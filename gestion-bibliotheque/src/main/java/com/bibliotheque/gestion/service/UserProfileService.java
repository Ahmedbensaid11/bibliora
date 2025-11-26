package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.dto.*;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.exception.BadRequestException;
import com.bibliotheque.gestion.exception.ResourceNotFoundException;
import com.bibliotheque.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service pour la gestion du profil utilisateur
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Configuration pour l'upload de fichiers
    private static final String UPLOAD_DIR = "uploads/profiles/";
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Récupère le profil complet d'un utilisateur
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = findUserByUsername(username);

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .identityCard(user.getIdentityCard())
                .photoUrl(user.getPhotoUrl())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .emailNotifications(user.getEmailNotifications())
                .publicProfile(user.getPublicProfile())
                .language(user.getLanguage())
                .theme(user.getTheme())
                .build();
    }

    /**
     * Met à jour le profil d'un utilisateur
     */
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUserByUsername(username);

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Cet email est déjà utilisé");
            }
        }

        // Mettre à jour les informations du profil
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhone());
        user.setIdentityCard(request.getIdentityCard());

        userRepository.save(user);

        log.info("Profil mis à jour pour l'utilisateur: {}", username);

        return getUserProfile(username);
    }

    /**
     * Upload une photo de profil
     */
    public String uploadProfilePhoto(String username, MultipartFile file) {
        User user = findUserByUsername(username);

        // Validation du fichier
        validateImageFile(file);

        try {
            // Créer le dossier d'upload s'il n'existe pas
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Supprimer l'ancienne photo si elle existe
            if (user.getPhotoUrl() != null) {
                deletePhotoFile(user.getPhotoUrl());
            }

            // Générer un nom de fichier unique
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + "." + extension;
            Path filePath = uploadPath.resolve(newFilename);

            // Sauvegarder le fichier
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construire l'URL de la photo
            String photoUrl = "/uploads/profiles/" + newFilename;
            user.setPhotoUrl(photoUrl);
            userRepository.save(user);

            log.info("Photo de profil uploadée pour l'utilisateur: {}", username);

            return photoUrl;
        } catch (IOException e) {
            log.error("Erreur lors de l'upload de la photo de profil", e);
            throw new BadRequestException("Erreur lors de l'upload de la photo");
        }
    }

    /**
     * Supprime la photo de profil
     */
    public void deleteProfilePhoto(String username) {
        User user = findUserByUsername(username);

        if (user.getPhotoUrl() != null) {
            deletePhotoFile(user.getPhotoUrl());
            user.setPhotoUrl(null);
            userRepository.save(user);

            log.info("Photo de profil supprimée pour l'utilisateur: {}", username);
        }
    }

    /**
     * Récupère les statistiques d'un utilisateur
     * Note: Cette méthode retourne des données simulées
     * Vous devrez l'adapter selon votre logique métier
     */
    @Transactional(readOnly = true)
    public UserStatisticsResponse getUserStatistics(String username) {
        User user = findUserByUsername(username);

        // TODO: Implémenter la vraie logique de récupération des statistiques
        // à partir de vos entités Book, Borrow, etc.

        return UserStatisticsResponse.builder()
                .totalBorrowedBooks(24)
                .currentlyBorrowed(3)
                .historyCount(21)
                .favoritesCount(12)
                .overdueBooks(0)
                .reservationsCount(2)
                .build();
    }

    /**
     * Met à jour les préférences d'un utilisateur
     */
    public UserProfileResponse updatePreferences(String username, UpdatePreferencesRequest request) {
        User user = findUserByUsername(username);

        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPublicProfile() != null) {
            user.setPublicProfile(request.getPublicProfile());
        }
        if (request.getLanguage() != null) {
            user.setLanguage(request.getLanguage());
        }
        if (request.getTheme() != null) {
            user.setTheme(request.getTheme());
        }

        userRepository.save(user);

        log.info("Préférences mises à jour pour l'utilisateur: {}", username);

        return getUserProfile(username);
    }

    /**
     * Change le mot de passe d'un utilisateur
     */
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = findUserByUsername(username);

        // Vérifier que le nouveau mot de passe et la confirmation correspondent
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Les mots de passe ne correspondent pas");
        }

        // Vérifier que le mot de passe actuel est correct
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Le mot de passe actuel est incorrect");
        }

        // Vérifier que le nouveau mot de passe est différent de l'ancien
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        // Changer le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Mot de passe changé pour l'utilisateur: {}", username);
    }

    /**
     * Supprime le compte d'un utilisateur
     */
    public void deleteAccount(String username, String password) {
        User user = findUserByUsername(username);

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Mot de passe incorrect");
        }

        // Supprimer la photo de profil si elle existe
        if (user.getPhotoUrl() != null) {
            deletePhotoFile(user.getPhotoUrl());
        }

        // Supprimer l'utilisateur
        userRepository.delete(user);

        log.info("Compte supprimé pour l'utilisateur: {}", username);
    }

    // ============================================
    // Méthodes utilitaires privées
    // ============================================

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + username));
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Le fichier est vide");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Le fichier est trop volumineux (max 5MB)");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BadRequestException("Nom de fichier invalide");
        }

        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Format de fichier non autorisé. Formats acceptés: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private void deletePhotoFile(String photoUrl) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + photoUrl.substring(photoUrl.lastIndexOf('/') + 1));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier: {}", photoUrl, e);
        }
    }
}