package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingChallengeDTO {
    private Integer year;
    private Integer goal;
    private Integer currentCount;
    private Integer progressPercentage;
    private LocalDate estimatedCompletion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Milestone {
        private Integer percentage;
        private Integer booksRequired;
        private Boolean achieved;
        private String title;
        private String description;
        private String icon;
    }

    private List<Milestone> milestones;
    private Map<String, Boolean> achievements;
}