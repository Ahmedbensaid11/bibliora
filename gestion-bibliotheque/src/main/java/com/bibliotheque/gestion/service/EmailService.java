package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Envoie un email de bienvenue
     */
    @Async
    public void sendWelcomeEmail(User user) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Bienvenue dans notre bibliothèque!");
            message.setText(String.format(
                    "Bonjour %s %s,\n\n" +
                            "Bienvenue dans notre système de gestion de bibliothèque!\n\n" +
                            "Votre compte a été créé avec succès.\n" +
                            "Nom d'utilisateur: %s\n\n" +
                            "Vous pouvez maintenant vous connecter et commencer à emprunter des livres.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de la bibliothèque",
                    user.getFirstName(),
                    user.getLastName(),
                    user.getUsername()
            ));

            mailSender.send(message);
            logger.info("Email de bienvenue envoyé à: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de bienvenue à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    @Async
    public void sendPasswordResetEmail(User user, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText(String.format(
                    "Bonjour %s %s,\n\n" +
                            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                            "Cliquez sur le lien suivant pour réinitialiser votre mot de passe:\n" +
                            "%s\n\n" +
                            "Ce lien expirera dans 24 heures.\n\n" +
                            "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de la bibliothèque",
                    user.getFirstName(),
                    user.getLastName(),
                    resetUrl
            ));

            mailSender.send(message);
            logger.info("Email de réinitialisation envoyé à: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de réinitialisation à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie une notification d'emprunt
     */
    @Async
    public void sendBorrowNotification(User user, String bookTitle, String dueDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Confirmation d'emprunt");
            message.setText(String.format(
                    "Bonjour %s %s,\n\n" +
                            "Vous avez emprunté le livre: %s\n\n" +
                            "Date de retour prévue: %s\n\n" +
                            "N'oubliez pas de le retourner à temps pour éviter les pénalités.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de la bibliothèque",
                    user.getFirstName(),
                    user.getLastName(),
                    bookTitle,
                    dueDate
            ));

            mailSender.send(message);
            logger.info("Notification d'emprunt envoyée à: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification d'emprunt à: {}", user.getEmail(), e);
        }
    }

    /**
     * Envoie une notification de retard
     */
    @Async
    public void sendOverdueNotification(User user, String bookTitle, int daysOverdue) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Livre en retard");
            message.setText(String.format(
                    "Bonjour %s %s,\n\n" +
                            "Le livre '%s' est en retard de %d jour(s).\n\n" +
                            "Veuillez le retourner dès que possible pour éviter des pénalités supplémentaires.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de la bibliothèque",
                    user.getFirstName(),
                    user.getLastName(),
                    bookTitle,
                    daysOverdue
            ));

            mailSender.send(message);
            logger.info("Notification de retard envoyée à: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification de retard à: {}", user.getEmail(), e);
        }
    }
}