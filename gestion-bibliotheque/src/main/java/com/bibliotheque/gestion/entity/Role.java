package com.bibliotheque.gestion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un rôle utilisateur
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private RoleName name;

    @Column(length = 255)
    private String description;

    /**
     * Enumération des rôles disponibles
     */
    public enum RoleName {
        ROLE_ADMIN("Administrateur - Accès complet au système"),
        ROLE_LECTEUR("Lecteur - Peut emprunter et consulter des livres");

        private final String description;

        RoleName(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}