package com.bibliotheque.gestion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO for loan/borrow requests with delivery information
 */
public record LoanRequestDTO(
    @NotNull(message = "Book ID is required")
    Long bookId,

    @NotBlank(message = "Phone number is required")
    String phone,

    @NotBlank(message = "Delivery address is required")
    String deliveryAddress,

    String deliveryNotes,

    LocalDate preferredPickupDate
) {}
