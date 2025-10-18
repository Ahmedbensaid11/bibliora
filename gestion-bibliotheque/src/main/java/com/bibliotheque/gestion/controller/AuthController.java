package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.AuthResponse;
import com.bibliotheque.gestion.dto.ChangePasswordRequest;
import com.bibliotheque.gestion.dto.ForgotPasswordRequest;
import com.bibliotheque.gestion.dto.LoginRequest;
import com.bibliotheque.gestion.dto.RegisterRequest;
import com.bibliotheque.gestion.dto.ResetPasswordRequest;
import com.bibliotheque.gestion.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour la gestion de l'authentification
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "APIs pour l'authentification et la gestion des comptes")
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint de connexion
     */
    @PostMapping("/login")
    @Operation(summary = "Connexion", description = "Authentifie un utilisateur et retourne un token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint d'inscription
     */
    @PostMapping("/register")
    @Operation(summary = "Inscription", description = "Crée un nouveau compte utilisateur")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Endpoint d'inscription admin (réservé aux admins)
     */
    @PostMapping("/register/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Inscription Admin", description = "Crée un nouveau compte avec rôle personnalisé (Admin uniquement)")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse response = authService.register(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Endpoint pour demander la réinitialisation du mot de passe
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Mot de passe oublié", description = "Envoie un email de réinitialisation de mot de passe")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint pour réinitialiser le mot de passe
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Réinitialiser mot de passe", description = "Réinitialise le mot de passe avec un token valide")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint pour changer le mot de passe (utilisateur connecté)
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Changer mot de passe", description = "Change le mot de passe de l'utilisateur connecté")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        ApiResponse response = authService.changePassword(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de déconnexion (optionnel, car JWT est stateless)
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Déconnexion", description = "Déconnecte l'utilisateur (côté client)")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(new ApiResponse(true, "Déconnexion réussie"));
    }

    /**
     * Endpoint de test pour vérifier l'authentification
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Profil utilisateur", description = "Récupère les informations de l'utilisateur connecté")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        return ResponseEntity.ok(new ApiResponse(true, "Utilisateur authentifié"));
    }
}