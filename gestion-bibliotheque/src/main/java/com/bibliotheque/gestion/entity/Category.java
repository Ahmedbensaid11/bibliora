package com.bibliotheque.gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

/**
 * Entité représentant une catégorie hiérarchique de livres
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    // Self-referencing for hierarchy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Category> children = new HashSet<>();

    // Many-to-Many relationship with Books (will be defined in Book entity)
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Book> books = new HashSet<>();

    // Soft delete flag
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods for hierarchy management

    /**
     * Vérifie si c'est une catégorie racine (sans parent)
     */
    public boolean isRoot() {
        return parent == null;
    }

    /**
     * Vérifie si la catégorie a des enfants
     */
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }

    /**
     * Ajoute une catégorie enfant
     */
    public void addChild(Category child) {
        if (children == null) {
            children = new HashSet<>();
        }
        children.add(child);
        child.setParent(this);
    }

    /**
     * Retire une catégorie enfant
     */
    public void removeChild(Category child) {
        if (children != null) {
            children.remove(child);
            child.setParent(null);
        }
    }

    /**
     * Obtient le chemin complet de la catégorie (ex: "Fiction > Science-Fiction > Cyberpunk")
     */
    public String getFullPath() {
        if (parent == null) {
            return name;
        }
        return parent.getFullPath() + " > " + name;
    }

    /**
     * Obtient le niveau de profondeur dans la hiérarchie (racine = 0)
     */
    public int getLevel() {
        if (parent == null) {
            return 0;
        }
        return parent.getLevel() + 1;
    }

    /**
     * Prépare la suppression de cette catégorie en remontant les enfants d'un niveau
     * Les enfants prennent le parent de cette catégorie comme nouveau parent
     */
    public void prepareForDeletion() {
        if (children != null && !children.isEmpty()) {
            Category newParent = this.parent; // null if this is root

            for (Category child : children) {
                child.setParent(newParent);

                // Si newParent existe, ajouter l'enfant à sa liste
                if (newParent != null) {
                    newParent.getChildren().add(child);
                }
            }

            // Si cette catégorie avait un parent, retirer cette catégorie de ses enfants
            if (this.parent != null) {
                this.parent.getChildren().remove(this);
            }

            // Vider la liste des enfants de cette catégorie
            children.clear();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Category)) return false;
        Category category = (Category) o;
        return id != null && id.equals(category.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", level=" + getLevel() +
                '}';
    }
}