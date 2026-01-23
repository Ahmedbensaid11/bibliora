package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponse {
    private Boolean success;
    private String message;
    private LoanDTO data;

    // For multiple loans
    private List<LoanDTO> items;
    private Integer totalItems;
    private Integer page;
    private Integer totalPages;

    // For fines
    private Double fineAmount;
    private Boolean finePaid;
}