package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.*;
import com.bibliotheque.gestion.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controleur REST pour la gestion du profil utilisateur
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
@Tag(name = "Profile", description = "APIs pour la gestion du profil utilisateur")
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Recupere le profil de l'utilisateur connecte
     * GET /api/profile
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mon profil", description = "Recupere le profil de l'utilisateur connecte")
    public ResponseEntity<DataResponse<UserProfileResponse>> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        log.info("Fetching profile for user: {}", username);

        try {
            UserProfileResponse profile = userProfileService.getUserProfile(username);
            return ResponseEntity.ok(new DataResponse<>(true, "Profil recupere avec succes", profile));
        } catch (RuntimeException e) {
            log.error("Error fetching profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Met a jour les informations du profil utilisateur
     * PUT /api/profile
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mettre a jour le profil", description = "Met a jour les informations du profil")
    public ResponseEntity<DataResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        log.info("Updating profile for user: {}", username);

        try {
            UserProfileResponse updatedProfile = userProfileService.updateProfile(username, request);
            return ResponseEntity.ok(new DataResponse<>(true, "Profil mis a jour avec succes", updatedProfile));
        } catch (RuntimeException e) {
            log.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Upload/Change profile photo
     * POST /api/profile/photo
     */
    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Uploader photo de profil", description = "Upload ou change la photo de profil")
    public ResponseEntity<DataResponse<String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        log.info("Uploading profile photo for user: {}", username);

        try {
            String photoUrl = userProfileService.uploadProfilePhoto(username, file);
            return ResponseEntity.ok(new DataResponse<>(true, "Photo uploadee avec succes", photoUrl));
        } catch (RuntimeException e) {
            log.error("Error uploading photo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Supprime la photo de profil
     * DELETE /api/profile/photo
     */
    @DeleteMapping("/photo")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Supprimer photo de profil", description = "Supprime la photo de profil")
    public ResponseEntity<ApiResponse> deleteProfilePhoto(Authentication authentication) {
        String username = authentication.getName();
        log.info("Deleting profile photo for user: {}", username);

        try {
            userProfileService.deleteProfilePhoto(username);
            return ResponseEntity.ok(new ApiResponse(true, "Photo de profil supprimee avec succes"));
        } catch (RuntimeException e) {
            log.error("Error deleting photo: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Recupere les statistiques de l'utilisateur
     * GET /api/profile/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mes statistiques", description = "Recupere les statistiques d'emprunts de l'utilisateur")
    public ResponseEntity<DataResponse<UserStatisticsResponse>> getUserStatistics(Authentication authentication) {
        String username = authentication.getName();
        log.info("Fetching statistics for user: {}", username);

        try {
            UserStatisticsResponse statistics = userProfileService.getUserStatistics(username);
            return ResponseEntity.ok(new DataResponse<>(true, "Statistiques recuperees avec succes", statistics));
        } catch (RuntimeException e) {
            log.error("Error fetching statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Met a jour les preferences de l'utilisateur
     * PUT /api/profile/preferences
     */
    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mettre a jour les preferences", description = "Met a jour les preferences de l'utilisateur")
    public ResponseEntity<DataResponse<UserProfileResponse>> updatePreferences(
            @Valid @RequestBody UpdatePreferencesRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        log.info("Updating preferences for user: {}", username);

        try {
            UserProfileResponse profile = userProfileService.updatePreferences(username, request);
            return ResponseEntity.ok(new DataResponse<>(true, "Preferences mises a jour avec succes", profile));
        } catch (RuntimeException e) {
            log.error("Error updating preferences: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Change le mot de passe de l'utilisateur
     * PUT /api/profile/change-password
     */
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Changer le mot de passe", description = "Change le mot de passe de l'utilisateur")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        log.info("Changing password for user: {}", username);

        try {
            userProfileService.changePassword(username, request);
            return ResponseEntity.ok(new ApiResponse(true, "Mot de passe modifie avec succes"));
        } catch (RuntimeException e) {
            log.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Supprime le compte utilisateur
     * DELETE /api/profile/account
     */
    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Supprimer le compte", description = "Supprime le compte de l'utilisateur")
    public ResponseEntity<ApiResponse> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        log.info("Deleting account for user: {}", username);

        try {
            userProfileService.deleteAccount(username, request.getPassword());
            return ResponseEntity.ok(new ApiResponse(true, "Compte supprime avec succes"));
        } catch (RuntimeException e) {
            log.error("Error deleting account: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
