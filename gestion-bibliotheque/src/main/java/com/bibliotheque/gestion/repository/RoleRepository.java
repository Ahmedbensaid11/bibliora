package com.bibliotheque.gestion.repository;



import com.bibliotheque.gestion.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Role
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Trouve un rôle par son nom
     */
    Optional<Role> findByName(Role.RoleName name);
}