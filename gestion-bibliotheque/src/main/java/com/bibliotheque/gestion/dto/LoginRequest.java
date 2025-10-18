package com.bibliotheque.gestion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Le nom d'utilisateur ou l'email est requis")
    private String usernameOrEmail;

    @NotBlank(message = "Le mot de passe est requis")
    private String password;
}
