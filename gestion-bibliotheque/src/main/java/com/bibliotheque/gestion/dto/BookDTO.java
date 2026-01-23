package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String publisher;
    private Integer publicationYear;
    private String genre;
    private String summary;
    private Integer totalCopies;
    private Integer availableCopies;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Simplified categories to avoid circular reference
    private Set<CategorySimpleDTO> categories = new HashSet<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySimpleDTO {
        private Long id;
        private String name;
    }
}