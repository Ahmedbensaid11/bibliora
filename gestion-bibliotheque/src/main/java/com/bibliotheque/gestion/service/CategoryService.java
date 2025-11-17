package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Crée une nouvelle catégorie
     */
    public Category createCategory(String name, String description, Long parentId) {
        log.info("Creating category: {} with parent ID: {}", name, parentId);

        Category category = Category.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();

        // Si un parent est spécifié, l'assigner
        if (parentId != null) {
            Optional<Category> parent = categoryRepository.findByIdAndActiveTrue(parentId);
            if (parent.isPresent()) {
                category.setParent(parent.get());
                parent.get().addChild(category);
            } else {
                throw new RuntimeException("Parent category not found with ID: " + parentId);
            }
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());
        return savedCategory;
    }

    /**
     * Supprime une catégorie avec la logique de remontée des enfants
     */
    public void deleteCategory(Long categoryId) {
        log.info("Deleting category with ID: {}", categoryId);

        Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }

        Category category = categoryOpt.get();

        // Vérifier si la catégorie a des livres
        Long bookCount = categoryRepository.countBooksByCategoryId(categoryId);
        if (bookCount > 0) {
            log.warn("Category {} has {} books. Proceeding with deletion but books will lose this category.",
                    category.getName(), bookCount);
        }

        // Appliquer la logique de remontée des enfants
        category.prepareForDeletion();

        // Sauvegarder les modifications de hiérarchie
        if (category.hasChildren()) {
            for (Category child : category.getChildren()) {
                categoryRepository.save(child);
            }
        }

        // Soft delete
        category.setActive(false);
        categoryRepository.save(category);

        log.info("Category {} deleted successfully. Children moved up to parent level.", category.getName());
    }

    /**
     * Met à jour une catégorie
     */
    public Category updateCategory(Long categoryId, String name, String description, Long newParentId) {
        log.info("Updating category with ID: {}", categoryId);

        Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }

        Category category = categoryOpt.get();
        Category oldParent = category.getParent();

        // Mettre à jour les champs de base
        if (name != null) {
            category.setName(name);
        }
        if (description != null) {
            category.setDescription(description);
        }

        // Gérer le changement de parent
        if (newParentId != null) {
            Long currentParentId = category.getParent() != null ? category.getParent().getId() : null;
            if (!newParentId.equals(currentParentId)) {
                // Retirer de l'ancien parent
                if (oldParent != null) {
                    oldParent.removeChild(category);
                }

                // Ajouter au nouveau parent
                Optional<Category> newParent = categoryRepository.findByIdAndActiveTrue(newParentId);
                if (newParent.isPresent()) {
                    newParent.get().addChild(category);
                } else {
                    throw new RuntimeException("New parent category not found with ID: " + newParentId);
                }
            }
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category updated successfully: {}", savedCategory.getName());
        return savedCategory;
    }

    /**
     * Récupère une catégorie par ID
     */
    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findByIdAndActiveTrue(id);
    }

    /**
     * Récupère toutes les catégories actives
     */
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findByActiveTrue();
    }

    /**
     * Récupère toutes les catégories racines
     */
    @Transactional(readOnly = true)
    public List<Category> getRootCategories() {
        return categoryRepository.findRootCategories();
    }

    /**
     * Récupère les enfants d'une catégorie
     */
    @Transactional(readOnly = true)
    public List<Category> getChildCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    /**
     * Récupère les catégories par niveau
     */
    @Transactional(readOnly = true)
    public List<Category> getCategoriesByLevel(Integer level) {
        return categoryRepository.findByLevel(level);
    }

    /**
     * Recherche des catégories par nom
     */
    @Transactional(readOnly = true)
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    /**
     * Récupère les catégories qui ont des livres
     */
    @Transactional(readOnly = true)
    public List<Category> getCategoriesWithBooks() {
        return categoryRepository.findCategoriesWithBooks();
    }

    /**
     * Récupère les catégories vides
     */
    @Transactional(readOnly = true)
    public List<Category> getEmptyCategories() {
        return categoryRepository.findEmptyCategories();
    }

    /**
     * Compte le nombre de livres dans une catégorie
     */
    @Transactional(readOnly = true)
    public Long countBooksInCategory(Long categoryId) {
        return categoryRepository.countBooksByCategoryId(categoryId);
    }

    /**
     * Vérifie si une catégorie a des enfants
     */
    @Transactional(readOnly = true)
    public boolean categoryHasChildren(Long categoryId) {
        return categoryRepository.hasChildren(categoryId);
    }
}