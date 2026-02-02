package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.User;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Service d'envoi d'emails via SendGrid
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final SendGrid sendGridClient;

    @Value("${SENDGRID_SENDER_EMAIL}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Type d'email pour déterminer si les préférences de notification doivent être respectées
     */
    private enum EmailType {
        CRITICAL,      // Emails critiques (toujours envoyés): bienvenue, réinitialisation
        NOTIFICATION   // Emails de notification (respect des préférences): emprunts, retards
    }

    /**
     * Vérifie si un email doit être envoyé en fonction des préférences de l'utilisateur
     */
    private boolean shouldSendNotification(User user, EmailType emailType) {
        // Les emails critiques sont toujours envoyés
        if (emailType == EmailType.CRITICAL) {
            return true;
        }

        // Pour les notifications, respecter les préférences de l'utilisateur
        return user.getEmailNotifications() != null && user.getEmailNotifications();
    }

    /**
     * Méthode helper pour envoyer un email via SendGrid
     */
    private void sendEmail(String to, String subject, String body, String emailContext) throws IOException {
        Email from = new Email(fromEmail);
        Email toEmail = new Email(to);
        Content content = new Content("text/plain", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGridClient.api(request);

        // Vérifier le code de statut (200-299 = succès)
        if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
            logger.info("Email {} envoyé avec succès à: {} (Status: {})",
                       emailContext, to, response.getStatusCode());
        } else {
            logger.error("Erreur lors de l'envoi de l'email {} à: {} (Status: {}, Body: {})",
                        emailContext, to, response.getStatusCode(), response.getBody());
        }
    }

    /**
     * Envoie un email de bienvenue
     */
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(User user) {
        try {
            if (!shouldSendNotification(user, EmailType.CRITICAL)) {
                logger.info("Email de bienvenue ignoré pour l'utilisateur: {} (notifications désactivées)",
                           user.getEmail());
                return;
            }

            String subject = "Bienvenue dans notre bibliothèque!";
            String body = String.format(
                    "Bonjour %s %s,\n\n" +
                    "Bienvenue dans notre système de gestion de bibliothèque!\n\n" +
                    "Votre compte a été créé avec succès.\n" +
                    "Nom d'utilisateur: %s\n\n" +
                    "Vous pouvez maintenant vous connecter et commencer à emprunter des livres.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Bibliora",
                    user.getFirstName(),
                    user.getLastName(),
                    user.getUsername()
            );

            sendEmail(user.getEmail(), subject, body, "bienvenue");
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de bienvenue à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(User user, String token) {
        try {
            if (!shouldSendNotification(user, EmailType.CRITICAL)) {
                logger.info("Email de réinitialisation ignoré pour l'utilisateur: {} (notifications désactivées)",
                           user.getEmail());
                return;
            }

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            String subject = "Réinitialisation de votre mot de passe";
            String body = String.format(
                    "Bonjour %s %s,\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                    "Cliquez sur le lien suivant pour réinitialiser votre mot de passe:\n" +
                    "%s\n\n" +
                    "Ce lien expirera dans 24 heures.\n\n" +
                    "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Bibliora",
                    user.getFirstName(),
                    user.getLastName(),
                    resetUrl
            );

            sendEmail(user.getEmail(), subject, body, "réinitialisation");
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de réinitialisation à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie une notification d'emprunt
     */
    @Async("emailTaskExecutor")
    public void sendBorrowNotification(User user, String bookTitle, String dueDate) {
        try {
            if (!shouldSendNotification(user, EmailType.NOTIFICATION)) {
                logger.info("Notification d'emprunt ignorée pour l'utilisateur: {} (notifications désactivées)",
                           user.getEmail());
                return;
            }

            String subject = "Confirmation d'emprunt";
            String body = String.format(
                    "Bonjour %s %s,\n\n" +
                    "Vous avez emprunté le livre: %s\n\n" +
                    "Date de retour prévue: %s\n\n" +
                    "N'oubliez pas de le retourner à temps pour éviter les pénalités.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Bibliora",
                    user.getFirstName(),
                    user.getLastName(),
                    bookTitle,
                    dueDate
            );

            sendEmail(user.getEmail(), subject, body, "notification d'emprunt");
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification d'emprunt à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie une confirmation de demande d'emprunt
     */
    @Async("emailTaskExecutor")
    public void sendLoanRequestConfirmation(User user, String bookTitle, java.time.LocalDate preferredPickupDate) {
        try {
            if (!shouldSendNotification(user, EmailType.NOTIFICATION)) {
                logger.info("Confirmation de demande ignorée pour l'utilisateur: {} (notifications désactivées)",
                           user.getEmail());
                return;
            }

            String pickupInfo = preferredPickupDate != null
                ? "Date de retrait souhaitée: " + preferredPickupDate.toString()
                : "Aucune date de retrait spécifiée";

            String subject = "Confirmation de votre demande d'emprunt";
            String body = String.format(
                    "Bonjour %s %s,\n\n" +
                    "Votre demande d'emprunt a été enregistrée avec succès!\n\n" +
                    "Livre demandé: %s\n" +
                    "%s\n\n" +
                    "Votre demande est en attente de traitement. Vous recevrez un email de confirmation " +
                    "lorsque le livre sera prêt à être récupéré.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Bibliora",
                    user.getFirstName(),
                    user.getLastName(),
                    bookTitle,
                    pickupInfo
            );

            sendEmail(user.getEmail(), subject, body, "confirmation de demande");
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de confirmation à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie une notification de retard
     */
    @Async("emailTaskExecutor")
    public void sendOverdueNotification(User user, String bookTitle, int daysOverdue) {
        try {
            if (!shouldSendNotification(user, EmailType.NOTIFICATION)) {
                logger.info("Notification de retard ignorée pour l'utilisateur: {} (notifications désactivées)",
                           user.getEmail());
                return;
            }

            String subject = "Livre en retard";
            String body = String.format(
                    "Bonjour %s %s,\n\n" +
                    "Le livre '%s' est en retard de %d jour(s).\n\n" +
                    "Veuillez le retourner dès que possible pour éviter des pénalités supplémentaires.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Bibliora",
                    user.getFirstName(),
                    user.getLastName(),
                    bookTitle,
                    daysOverdue
            );

            sendEmail(user.getEmail(), subject, body, "notification de retard");
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification de retard à: {}", user.getEmail(), e);
        }
    }
}
