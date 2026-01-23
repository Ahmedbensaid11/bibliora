package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.CategoryDTO;
import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.mapper.CategoryMapper;
import com.bibliotheque.gestion.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    /**
     * Crée une nouvelle catégorie
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<DataResponse<CategoryDTO>> createCategory(@RequestBody CreateCategoryRequest request) {
        log.info("Creating category: {}", request.getName());

        try {
            Category category = categoryService.createCategory(
                    request.getName(),
                    request.getDescription(),
                    request.getParentId()
            );
            CategoryDTO dto = categoryMapper.toDTO(category);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Category created successfully", dto));
        } catch (RuntimeException e) {
            log.error("Error creating category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Récupère toutes les catégories actives
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<ListResponse<CategoryDTO>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Categories retrieved successfully", dtos));
    }

    /**
     * Récupère une catégorie par ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DataResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        Optional<Category> category = categoryService.getCategoryById(id);

        if (category.isPresent()) {
            CategoryDTO dto = categoryMapper.toDTO(category.get());
            return ResponseEntity.ok(new DataResponse<>(true, "Category retrieved successfully", dto));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Met à jour une catégorie
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DataResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @RequestBody UpdateCategoryRequest request) {

        log.info("Updating category with ID: {}", id);

        try {
            Category updatedCategory = categoryService.updateCategory(
                    id,
                    request.getName(),
                    request.getDescription(),
                    request.getParentId()
            );
            CategoryDTO dto = categoryMapper.toDTO(updatedCategory);
            return ResponseEntity.ok(new DataResponse<>(true, "Category updated successfully", dto));
        } catch (RuntimeException e) {
            log.error("Error updating category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Supprime une catégorie
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        log.info("Deleting category with ID: {}", id);

        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ApiResponse(true, "Category deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Récupère les catégories racines
     * GET /api/categories/root
     */
    @GetMapping("/root")
    public ResponseEntity<ListResponse<CategoryDTO>> getRootCategories() {
        List<Category> rootCategories = categoryService.getRootCategories();
        List<CategoryDTO> dtos = rootCategories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Root categories retrieved successfully", dtos));
    }

    /**
     * Récupère les enfants d'une catégorie
     * GET /api/categories/{id}/children
     */
    @GetMapping("/{id}/children")
    public ResponseEntity<ListResponse<CategoryDTO>> getChildCategories(@PathVariable Long id) {
        List<Category> children = categoryService.getChildCategories(id);
        List<CategoryDTO> dtos = children.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Child categories retrieved successfully", dtos));
    }

    /**
     * Récupère les catégories par niveau
     * GET /api/categories/level/{level}
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<ListResponse<CategoryDTO>> getCategoriesByLevel(@PathVariable Integer level) {
        List<Category> categories = categoryService.getCategoriesByLevel(level);
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Categories by level retrieved successfully", dtos));
    }

    /**
     * Recherche des catégories par nom
     * GET /api/categories/search?name={name}
     */
    @GetMapping("/search")
    public ResponseEntity<ListResponse<CategoryDTO>> searchCategories(@RequestParam String name) {
        List<Category> categories = categoryService.searchCategoriesByName(name);
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Search results retrieved successfully", dtos));
    }

    /**
     * Récupère les catégories qui ont des livres
     * GET /api/categories/with-books
     */
    @GetMapping("/with-books")
    public ResponseEntity<ListResponse<CategoryDTO>> getCategoriesWithBooks() {
        List<Category> categories = categoryService.getCategoriesWithBooks();
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Categories with books retrieved successfully", dtos));
    }

    /**
     * Récupère les catégories vides
     * GET /api/categories/empty
     */
    @GetMapping("/empty")
    public ResponseEntity<ListResponse<CategoryDTO>> getEmptyCategories() {
        List<Category> categories = categoryService.getEmptyCategories();
        List<CategoryDTO> dtos = categories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ListResponse<>(true, "Empty categories retrieved successfully", dtos));
    }

    /**
     * Compte les livres dans une catégorie
     * GET /api/categories/{id}/books/count
     */
    @GetMapping("/{id}/books/count")
    public ResponseEntity<DataResponse<Long>> countBooksInCategory(@PathVariable Long id) {
        Long count = categoryService.countBooksInCategory(id);
        return ResponseEntity.ok(new DataResponse<>(true, "Book count retrieved successfully", count));
    }

    /**
     * Vérifie si une catégorie a des enfants
     * GET /api/categories/{id}/has-children
     */
    @GetMapping("/{id}/has-children")
    public ResponseEntity<DataResponse<Boolean>> categoryHasChildren(@PathVariable Long id) {
        Boolean hasChildren = categoryService.categoryHasChildren(id);
        return ResponseEntity.ok(new DataResponse<>(true, "Children check completed", hasChildren));
    }

    // DTOs pour les requêtes
    public static class CreateCategoryRequest {
        private String name;
        private String description;
        private Long parentId;

        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
    }

    public static class UpdateCategoryRequest {
        private String name;
        private String description;
        private Long parentId;

        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
    }
}