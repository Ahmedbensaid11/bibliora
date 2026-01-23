package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLoanRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    private String notes;
}