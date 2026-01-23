package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanStatisticsDTO {
    private Integer totalLoans;
    private Integer activeLoans;
    private Integer overdueLoans;
    private Integer returnedLoans;
    private Double totalFines;
    private Double unpaidFines;

    @Builder.Default
    private Map<String, Integer> loansByStatus = Map.of();

    @Builder.Default
    private Map<String, Integer> loansByMonth = Map.of();

    @Builder.Default
    private Map<String, Integer> popularBooks = Map.of();
}