package com.bibliotheque.gestion.repository;

import com.bibliotheque.gestion.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.PageResponse; // for BookController
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Basic queries
    List<Category> findByActiveTrue();

    Optional<Category> findByIdAndActiveTrue(Long id);

    List<Category> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    // Hierarchy-specific queries

    /**
     * Trouve toutes les catégories racines (sans parent)
     */
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.active = true ORDER BY c.name")
    List<Category> findRootCategories();

    /**
     * Trouve tous les enfants d'une catégorie donnée
     */
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.active = true ORDER BY c.name")
    List<Category> findByParentId(@Param("parentId") Long parentId);

    /**
     * Trouve tous les enfants directs d'une catégorie
     */
    List<Category> findByParentAndActiveTrueOrderByName(Category parent);

    /**
     * Trouve toutes les catégories sans enfants (feuilles)
     */
    @Query("SELECT c FROM Category c WHERE c.active = true AND " +
            "NOT EXISTS (SELECT child FROM Category child WHERE child.parent = c AND child.active = true)")
    List<Category> findLeafCategories();

    /**
     * Trouve toutes les catégories d'un niveau donné dans la hiérarchie
     */
    @Query("SELECT c FROM Category c WHERE c.active = true AND " +
            "(:level = 0 AND c.parent IS NULL) OR " +
            "(:level = 1 AND c.parent IS NOT NULL AND c.parent.parent IS NULL) OR " +
            "(:level = 2 AND c.parent IS NOT NULL AND c.parent.parent IS NOT NULL AND c.parent.parent.parent IS NULL) OR " +
            "(:level = 3 AND c.parent IS NOT NULL AND c.parent.parent IS NOT NULL AND c.parent.parent.parent IS NOT NULL AND c.parent.parent.parent.parent IS NULL)")
    List<Category> findByLevel(@Param("level") Integer level);

    /**
     * Trouve toutes les catégories qui ont des livres
     */
    @Query("SELECT DISTINCT c FROM Category c JOIN c.books b WHERE c.active = true")
    List<Category> findCategoriesWithBooks();

    /**
     * Trouve toutes les catégories vides (sans livres)
     */
    @Query("SELECT c FROM Category c WHERE c.active = true AND c.books IS EMPTY")
    List<Category> findEmptyCategories();

    /**
     * Compte le nombre d'enfants directs d'une catégorie
     */
    @Query("SELECT COUNT(c) FROM Category c WHERE c.parent.id = :parentId AND c.active = true")
    Long countChildrenByParentId(@Param("parentId") Long parentId);

    /**
     * Compte le nombre de livres dans une catégorie
     */
    @Query("SELECT COUNT(b) FROM Category c JOIN c.books b WHERE c.id = :categoryId AND c.active = true")
    Long countBooksByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * Vérifie si une catégorie a des enfants
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.parent.id = :parentId AND c.active = true")
    boolean hasChildren(@Param("parentId") Long parentId);

    /**
     * Trouve le chemin complet d'une catégorie (récursif)
     */
    @Query("SELECT c FROM Category c WHERE c.id = :categoryId AND c.active = true")
    Optional<Category> findCategoryWithPath(@Param("categoryId") Long categoryId);
}