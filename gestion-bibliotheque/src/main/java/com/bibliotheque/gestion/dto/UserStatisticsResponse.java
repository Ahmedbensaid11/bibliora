package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatisticsResponse {
    private Integer totalBorrowedBooks;
    private Integer currentlyBorrowed;
    private Integer historyCount;
    private Integer favoritesCount;
    private Integer overdueBooks;
    private Integer reservationsCount;
}