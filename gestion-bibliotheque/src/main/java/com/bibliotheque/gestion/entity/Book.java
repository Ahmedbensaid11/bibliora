package com.bibliotheque.gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

/**
 * Entité représentant un livre dans le catalogue
 */
@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 17)
    private String isbn; // ISBN-13 format

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 300)
    private String author;

    @Column(length = 200)
    private String publisher; // Éditeur

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(length = 100)
    private String genre;

    @Column(length = 2000)
    private String summary; // Résumé

    // Stock management
    @Column(name = "total_copies", nullable = false)
    @Builder.Default
    private Integer totalCopies = 1;

    @Column(name = "available_copies", nullable = false)
    @Builder.Default
    private Integer availableCopies = 1;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookStatus status = BookStatus.AVAILABLE;

    // Many-to-Many relationship with Categories
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_categories",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Énumération des statuts de livre
     */
    public enum BookStatus {
        AVAILABLE("Disponible"),
        OUT_OF_STOCK("Rupture de stock"),
        DISCONTINUED("Arrêté"),
        MAINTENANCE("En maintenance");

        private final String description;

        BookStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Helper methods for category management
    public void addToCategory(Category category) {
        if (categories == null) {
            categories = new HashSet<>();
        }
        categories.add(category);
        category.getBooks().add(this);
    }

    public void removeFromCategory(Category category) {
        if (categories != null) {
            categories.remove(category);
            category.getBooks().remove(this);
        }
    }

    public boolean isAvailable() {
        return status == BookStatus.AVAILABLE && availableCopies > 0;
    }
    public void clearCategories() {
        if (categories != null) {
            for (Category category : categories) {
                category.getBooks().remove(this);
            }
            categories.clear();
        }
    }
}