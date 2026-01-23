package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Boolean success;
    private String message;
    private DashboardStatsDTO stats;

    // For lists
    private List<?> items;
    private Integer totalItems;

    // For additional data
    private Map<String, Object> data;
}