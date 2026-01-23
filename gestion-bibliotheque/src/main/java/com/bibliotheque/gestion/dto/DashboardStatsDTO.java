package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Long totalLoans;
    private Long activeLoans;
    private Long overdueLoans;
    private Long returnedLoans;
    private Double totalFines;
    private Integer readingGoal;
    private Integer readingProgress;
    private Long dueSoonLoans;
    private Long reservedBooks;

    // Next due book info
    private String nextDueBookTitle;
    private LocalDate nextDueDate;

    // Additional stats (can be added later)
    private Integer booksReadThisYear;
    private Integer booksReadThisMonth;
    private String mostBorrowedGenre;
}