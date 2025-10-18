package com.bibliotheque.gestion.repository;



import com.bibliotheque.gestion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité User
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Trouve un utilisateur par son nom d'utilisateur
     */
    Optional<User> findByUsername(String username);

    /**
     * Trouve un utilisateur par son email
     */
    Optional<User> findByEmail(String email);

    /**
     * Trouve un utilisateur par username ou email
     */
    @Query("SELECT u FROM User u WHERE u.username = ?1 OR u.email = ?1")
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);

    /**
     * Vérifie si un username existe
     */
    Boolean existsByUsername(String username);

    /**
     * Vérifie si un email existe
     */
    Boolean existsByEmail(String email);

    /**
     * Trouve un utilisateur par son token de réinitialisation de mot de passe
     */
    Optional<User> findByResetPasswordToken(String token);
}