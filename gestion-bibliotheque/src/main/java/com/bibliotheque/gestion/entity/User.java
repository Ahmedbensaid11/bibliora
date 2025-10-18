package com.bibliotheque.gestion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un utilisateur du système
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(length = 20)
    private String phoneNumber;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean accountNonLocked = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    private LocalDateTime lockedUntil;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordTokenExpiry;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    /**
     * Vérifie si le compte est verrouillé temporairement
     */
    public boolean isAccountLocked() {
        if (!accountNonLocked) {
            return true;
        }
        if (lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil)) {
            return true;
        }
        return false;
    }

    /**
     * Incrémente le nombre de tentatives de connexion échouées
     */
    public void incrementFailedAttempts() {
        this.failedLoginAttempts++;
    }

    /**
     * Réinitialise les tentatives de connexion échouées
     */
    public void resetFailedAttempts() {
        this.failedLoginAttempts = 0;
    }

    /**
     * Verrouille le compte pour une durée spécifique
     */
    public void lockAccount(int minutes) {
        this.accountNonLocked = false;
        this.lockedUntil = LocalDateTime.now().plusMinutes(minutes);
    }

    /**
     * Déverrouille le compte
     */
    public void unlockAccount() {
        this.accountNonLocked = true;
        this.lockedUntil = null;
        this.failedLoginAttempts = 0;
    }
}