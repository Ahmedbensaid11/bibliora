package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanUserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
   // private String membershipNumber;
}