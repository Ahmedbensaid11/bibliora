package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgressDTO {
    private int goal;
    private int booksReadThisYear;
    private int booksReadThisMonth;
    private int progressPercentage;
    private int booksRemaining;
    private double averageBooksPerMonth;
    private int currentStreak;
    private int longestStreak;
    private Map<String, Long> monthlyStats;
    private Map<String, Long> genreStats;
    private String recommendation;
}