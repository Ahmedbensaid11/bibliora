package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnLoanRequest {
    private String condition; // GOOD, DAMAGED, LOST
    private String notes;
    private Boolean paidFine;
}