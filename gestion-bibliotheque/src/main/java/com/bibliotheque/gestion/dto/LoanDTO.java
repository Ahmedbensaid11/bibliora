package com.bibliotheque.gestion.dto;

import com.bibliotheque.gestion.entity.Loan;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDTO {
    private Long id;
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Loan.LoanStatus status;
    private String notes;
    private Double fineAmount;
    private Boolean isOverdue;
    private Long daysOverdue;

    // User info (simplified)
    private LoanUserDTO user;

    // Book info (simplified)
    private LoanBookDTO book;

    // Calculated fields
    @Builder.Default
    private Boolean canRenew = true;
    @Builder.Default
    private Boolean canReturn = true;
    @Builder.Default
    private Boolean canCancel = true;
}