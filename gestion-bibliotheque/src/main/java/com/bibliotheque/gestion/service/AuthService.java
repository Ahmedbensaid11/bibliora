package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.AuthResponse;
import com.bibliotheque.gestion.dto.ChangePasswordRequest;
import com.bibliotheque.gestion.dto.ForgotPasswordRequest;
import com.bibliotheque.gestion.dto.LoginRequest;
import com.bibliotheque.gestion.dto.RegisterRequest;
import com.bibliotheque.gestion.dto.ResetPasswordRequest;
import com.bibliotheque.gestion.entity.Role;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.exception.BadRequestException;
import com.bibliotheque.gestion.exception.ResourceNotFoundException;
import com.bibliotheque.gestion.repository.RoleRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.security.JwtTokenProvider;
import com.bibliotheque.gestion.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service de gestion de l'authentification
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Value("${app.security.max-login-attempts}")
    private int maxLoginAttempts;

    @Value("${app.security.account-lock-duration-minutes}")
    private int accountLockDuration;

    @Value("${app.security.reset-token-expiry-hours}")
    private int resetTokenExpiryHours;

    /**
     * Authentifie un utilisateur
     */
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        // Vérifier si l'utilisateur existe
        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new BadRequestException("Identifiants invalides"));

        // Vérifier si le compte est verrouillé
        if (user.isAccountLocked()) {
            throw new BadRequestException(
                    "Compte verrouillé. Réessayez plus tard ou contactez l'administrateur."
            );
        }

        try {
            System.out.println("==== DEBUG: Starting authentication ====");

            // Authentifier
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            System.out.println("==== DEBUG: Authentication successful ====");
            System.out.println("Authentication object: " + authentication);
            System.out.println("Principal class: " + authentication.getPrincipal().getClass().getName());

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Réinitialiser les tentatives échouées
            user.resetFailedAttempts();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            System.out.println("==== DEBUG: User saved successfully ====");

            // Générer les tokens
            System.out.println("==== DEBUG: Generating access token ====");
            String accessToken = tokenProvider.generateToken(authentication);
            System.out.println("==== DEBUG: Access token generated ====");

            System.out.println("==== DEBUG: Generating refresh token ====");
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            System.out.println("==== DEBUG: Refresh token generated ====");

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Set<String> roles = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            System.out.println("==== DEBUG: Login completed successfully ====");

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail(),
                    roles
            );

        } catch (Exception e) {
            // LOG THE ACTUAL ERROR
            System.out.println("==== LOGIN ERROR DEBUG ====");
            System.out.println("Exception Type: " + e.getClass().getName());
            System.out.println("Error Message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            System.out.println("============================");

            // Incrémenter les tentatives échouées
            user.incrementFailedAttempts();

            if (user.getFailedLoginAttempts() >= maxLoginAttempts) {
                user.lockAccount(accountLockDuration);
                userRepository.save(user);
                throw new BadRequestException(
                        "Trop de tentatives échouées. Compte verrouillé pour " +
                                accountLockDuration + " minutes."
                );
            }

            userRepository.save(user);
            throw new BadRequestException("Identifiants invalides: " + e.getMessage());
        }
    }


    /**
     * Inscrit un nouvel utilisateur
     */
    @Transactional
    public ApiResponse register(RegisterRequest registerRequest) {
        // Vérifier si le username existe déjà
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Ce nom d'utilisateur est déjà pris");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Cet email est déjà utilisé");
        }

        // Créer l'utilisateur
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .enabled(true)
                .accountNonLocked(true)
                .failedLoginAttempts(0)
                .build();

        // Attribuer les rôles
        Set<Role> roles = new HashSet<>();

        if (registerRequest.getRoles() != null && !registerRequest.getRoles().isEmpty()) {
            registerRequest.getRoles().forEach(roleName -> {
                Role role = roleRepository.findByName(Role.RoleName.valueOf(roleName))
                        .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé: " + roleName));
                roles.add(role);
            });
        } else {
            // Par défaut, attribuer le rôle LECTEUR
            Role lecteurRole = roleRepository.findByName(Role.RoleName.ROLE_LECTEUR)
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle LECTEUR non trouvé"));
            roles.add(lecteurRole);
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Envoyer un email de bienvenue
        emailService.sendWelcomeEmail(user);

        return new ApiResponse(true, "Utilisateur enregistré avec succès");
    }

    /**
     * Initie la réinitialisation du mot de passe
     */
    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun compte avec cet email"));

        // Générer un token de réinitialisation
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(resetTokenExpiryHours));

        userRepository.save(user);

        // Envoyer l'email de réinitialisation
        emailService.sendPasswordResetEmail(user, token);

        return new ApiResponse(true, "Email de réinitialisation envoyé");
    }

    /**
     * Réinitialise le mot de passe
     */
    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Token de réinitialisation invalide"));

        // Vérifier si le token est expiré
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Le token de réinitialisation a expiré");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        user.resetFailedAttempts();
        user.unlockAccount();

        userRepository.save(user);

        return new ApiResponse(true, "Mot de passe réinitialisé avec succès");
    }

    /**
     * Change le mot de passe de l'utilisateur connecté
     */
    @Transactional
    public ApiResponse changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("L'ancien mot de passe est incorrect");
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new ApiResponse(true, "Mot de passe changé avec succès");
    }
}