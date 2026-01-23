package com.bibliotheque.gestion.mapper;


import com.bibliotheque.gestion.dto.CategoryDTO;
import com.bibliotheque.gestion.entity.Category;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        if (category == null) {
            return null;
        }

        CategoryDTO dto = CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .level(category.getLevel())
                .fullPath(category.getFullPath())
                .build();

        // Handle parent
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
            dto.setParentName(category.getParent().getName());
        }

        // Handle children (convert to summary to avoid deep nesting)
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            Set<CategoryDTO.CategorySummaryDTO> childrenSummary = category.getChildren().stream()
                    .filter(child -> child.getActive()) // Only active children
                    .map(child -> CategoryDTO.CategorySummaryDTO.builder()
                            .id(child.getId())
                            .name(child.getName())
                            .description(child.getDescription())
                            .active(child.getActive())
                            .bookCount(child.getBooks() != null ? child.getBooks().size() : 0)
                            .level(child.getLevel())
                            .build())
                    .collect(Collectors.toSet());
            dto.setChildren(childrenSummary);
        }

        // Set book count
        dto.setBookCount(category.getBooks() != null ? category.getBooks().size() : 0);

        return dto;
    }

    public CategoryDTO.CategorySummaryDTO toSummaryDTO(Category category) {
        if (category == null) {
            return null;
        }

        return CategoryDTO.CategorySummaryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .bookCount(category.getBooks() != null ? category.getBooks().size() : 0)
                .level(category.getLevel())
                .build();
    }
}