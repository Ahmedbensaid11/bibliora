package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.*;
import com.bibliotheque.gestion.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion du profil utilisateur
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Récupère le profil de l'utilisateur connecté
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userProfileService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }

    /**
     * Met à jour les informations du profil utilisateur
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse updatedProfile = userProfileService.updateProfile(username, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Upload/Change profile photo
     */
    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        String photoUrl = userProfileService.uploadProfilePhoto(username, file);
        return ResponseEntity.ok(photoUrl);
    }

    /**
     * Supprime la photo de profil
     */
    @DeleteMapping("/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> deleteProfilePhoto(Authentication authentication) {
        String username = authentication.getName();
        userProfileService.deleteProfilePhoto(username);
        return ResponseEntity.ok(new ApiResponse(true, "Photo de profil supprimée avec succès"));
    }

    /**
     * Récupère les statistiques de l'utilisateur
     */
    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserStatisticsResponse> getUserStatistics(Authentication authentication) {
        String username = authentication.getName();
        UserStatisticsResponse statistics = userProfileService.getUserStatistics(username);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Met à jour les préférences de l'utilisateur
     */
    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updatePreferences(
            @Valid @RequestBody UpdatePreferencesRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userProfileService.updatePreferences(username, request);
        return ResponseEntity.ok(profile);
    }

    /**
     * Change le mot de passe de l'utilisateur
     */
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        userProfileService.changePassword(username, request);
        return ResponseEntity.ok(new ApiResponse(true, "Mot de passe modifié avec succès"));
    }

    /**
     * Supprime le compte utilisateur
     */
    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        userProfileService.deleteAccount(username, request.getPassword());
        return ResponseEntity.ok(new ApiResponse(true, "Compte supprimé avec succès"));
    }

    /**
     * DEBUG ENDPOINT - Test upload directory
     * REMOVE THIS IN PRODUCTION!
     */
    @GetMapping("/test-upload-dir")
    public ResponseEntity<Map<String, Object>> testUploadDir() {
        Map<String, Object> info = new HashMap<>();

        String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
        File uploadFolder = new File(uploadPath);
        File profilesFolder = new File(uploadPath + "profiles");

        info.put("currentDirectory", System.getProperty("user.dir"));
        info.put("uploadPath", uploadPath);
        info.put("uploadDirExists", uploadFolder.exists());
        info.put("uploadDirAbsolutePath", uploadFolder.getAbsolutePath());
        info.put("profilesDirExists", profilesFolder.exists());
        info.put("profilesDirAbsolutePath", profilesFolder.getAbsolutePath());

        if (profilesFolder.exists()) {
            File[] files = profilesFolder.listFiles();
            info.put("filesCount", files != null ? files.length : 0);

            if (files != null && files.length > 0) {
                String[] fileNames = new String[files.length];
                for (int i = 0; i < files.length; i++) {
                    fileNames[i] = files[i].getName();
                }
                info.put("files", fileNames);
            }
        }

        return ResponseEntity.ok(info);
    }

    /**
     * DEBUG ENDPOINT - Test if specific file exists
     * REMOVE THIS IN PRODUCTION!
     */
    @GetMapping("/test-file/{filename}")
    public ResponseEntity<Map<String, Object>> testFile(@PathVariable String filename) {
        Map<String, Object> result = new HashMap<>();

        try {
            String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
            Path filePath = Paths.get(uploadPath + "profiles").resolve(filename).normalize();

            result.put("filename", filename);
            result.put("fullPath", filePath.toString());
            result.put("exists", Files.exists(filePath));
            result.put("isReadable", Files.isReadable(filePath));
            result.put("isRegularFile", Files.isRegularFile(filePath));

            if (Files.exists(filePath)) {
                result.put("size", Files.size(filePath));
            }
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }
}