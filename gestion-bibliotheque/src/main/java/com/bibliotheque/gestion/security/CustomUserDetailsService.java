package com.bibliotheque.gestion.security;

import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service personnalisé pour charger les détails utilisateur
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Charge un utilisateur par son username ou email
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur non trouvé: " + usernameOrEmail)
                );

        return UserPrincipal.create(user);
    }

    /**
     * Charge un utilisateur par son ID
     */
    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Utilisateur non trouvé avec l'ID: " + id)
                );

        return UserPrincipal.create(user);
    }
}