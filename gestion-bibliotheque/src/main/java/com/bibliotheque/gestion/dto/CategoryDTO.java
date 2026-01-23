package com.bibliotheque.gestion.dto;


import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Parent info (simplified to avoid circular reference)
    private Long parentId;
    private String parentName;

    // Children info (simplified to avoid deep nesting)
    @Builder.Default
    private Set<CategorySummaryDTO> children = new HashSet<>();

    // Book count
    private Integer bookCount;

    // Helper fields
    private Integer level;
    private String fullPath;

    // Nested DTO for children to avoid deep nesting
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummaryDTO {
        private Long id;
        private String name;
        private String description;
        private Boolean active;
        private Integer bookCount;
        private Integer level;
    }
}