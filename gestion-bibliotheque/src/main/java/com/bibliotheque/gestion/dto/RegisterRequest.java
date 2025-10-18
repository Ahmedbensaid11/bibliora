package com.bibliotheque.gestion.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Le nom d'utilisateur est requis")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    private String username;

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 6, max = 100, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le prénom est requis")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Le nom est requis")
    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phoneNumber;

    private Set<String> roles;
}
