package com.bibliotheque.gestion.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Le prenom est obligatoire")
    @Size(max = 100, message = "Le prenom ne peut pas depasser 100 caracteres")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne peut pas depasser 100 caracteres")
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit etre valide")
    @Size(max = 100, message = "L'email ne peut pas depasser 100 caracteres")
    private String email;

    @Size(max = 20, message = "Le numero de telephone ne peut pas depasser 20 caracteres")
    private String phone;

    @Size(max = 50, message = "Le numero de carte d'identite ne peut pas depasser 50 caracteres")
    private String identityCard;
}
