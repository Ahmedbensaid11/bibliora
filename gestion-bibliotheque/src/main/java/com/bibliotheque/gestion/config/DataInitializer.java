package com.bibliotheque.gestion.config;



import com.bibliotheque.gestion.entity.Role;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.RoleRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Initialise les données par défaut au démarrage de l'application
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDefaultUsers();
    }

    /**
     * Initialise les rôles par défaut
     */
    private void initializeRoles() {
        try {
            // Créer le rôle ADMIN s'il n'existe pas
            if (roleRepository.findByName(Role.RoleName.ROLE_ADMIN).isEmpty()) {
                Role adminRole = Role.builder()
                        .name(Role.RoleName.ROLE_ADMIN)
                        .description("Administrateur - Accès complet au système")
                        .build();
                roleRepository.save(adminRole);
                logger.info("Rôle ADMIN créé avec succès");
            }

            // Créer le rôle LECTEUR s'il n'existe pas
            if (roleRepository.findByName(Role.RoleName.ROLE_LECTEUR).isEmpty()) {
                Role lecteurRole = Role.builder()
                        .name(Role.RoleName.ROLE_LECTEUR)
                        .description("Lecteur - Peut emprunter et consulter des livres")
                        .build();
                roleRepository.save(lecteurRole);
                logger.info("Rôle LECTEUR créé avec succès");
            }

            logger.info("Initialisation des rôles terminée");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation des rôles: ", e);
        }
    }

    /**
     * Initialise les utilisateurs par défaut
     */
    private void initializeDefaultUsers() {
        try {
            // Créer un utilisateur admin par défaut s'il n'existe pas
            if (userRepository.findByUsername("admin").isEmpty()) {
                Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Rôle ADMIN non trouvé"));

                Set<Role> adminRoles = new HashSet<>();
                adminRoles.add(adminRole);

                User admin = User.builder()
                        .username("admin")
                        .email("admin@bibliotheque.com")
                        .password(passwordEncoder.encode("admin123"))
                        .firstName("Admin")
                        .lastName("Système")
                        .roles(adminRoles)
                        .enabled(true)
                        .accountNonLocked(true)
                        .failedLoginAttempts(0)
                        .build();

                userRepository.save(admin);
                logger.info("Utilisateur admin créé avec succès (username: admin, password: admin123)");
            }

            // Créer un utilisateur lecteur de test s'il n'existe pas
            if (userRepository.findByUsername("lecteur1").isEmpty()) {
                Role lecteurRole = roleRepository.findByName(Role.RoleName.ROLE_LECTEUR)
                        .orElseThrow(() -> new RuntimeException("Rôle LECTEUR non trouvé"));

                Set<Role> lecteurRoles = new HashSet<>();
                lecteurRoles.add(lecteurRole);

                User lecteur = User.builder()
                        .username("lecteur1")
                        .email("lecteur@bibliotheque.com")
                        .password(passwordEncoder.encode("lecteur123"))
                        .firstName("Jean")
                        .lastName("Dupont")
                        .phoneNumber("+216 12 345 678")
                        .roles(lecteurRoles)
                        .enabled(true)
                        .accountNonLocked(true)
                        .failedLoginAttempts(0)
                        .build();

                userRepository.save(lecteur);
                logger.info("Utilisateur lecteur créé avec succès (username: lecteur1, password: lecteur123)");
            }

            logger.info("Initialisation des utilisateurs terminée");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation des utilisateurs: ", e);
        }
    }
}