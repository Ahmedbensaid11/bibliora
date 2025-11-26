package com.bibliotheque.gestion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteAccountRequest {

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}