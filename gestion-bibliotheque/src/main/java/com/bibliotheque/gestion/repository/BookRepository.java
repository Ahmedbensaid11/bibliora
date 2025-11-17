package com.bibliotheque.gestion.repository;

import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public interface BookRepository extends JpaRepository<Book, Long> {

    // Basic search methods
    Optional<Book> findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCase(String title);

    List<Book> findByAuthorContainingIgnoreCase(String author);

    List<Book> findByPublisherContainingIgnoreCase(String publisher);

    List<Book> findByGenreIgnoreCase(String genre);

    List<Book> findByPublicationYear(Integer year);

    List<Book> findByPublicationYearBetween(Integer startYear, Integer endYear);

    // Status-based queries
    List<Book> findByStatus(Book.BookStatus status);

    List<Book> findByStatusAndAvailableCopiesGreaterThan(Book.BookStatus status, Integer minCopies);

    // Category-based queries
    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId")
    List<Book> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c IN :categories")
    List<Book> findByCategories(@Param("categories") List<Category> categories);

    // Advanced search with pagination
    Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author, Pageable pageable);

    // Complex search query
    @Query("SELECT b FROM Book b WHERE " +
            "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:publisher IS NULL OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%'))) AND " +
            "(:genre IS NULL OR LOWER(b.genre) = LOWER(:genre)) AND " +
            "(:yearFrom IS NULL OR b.publicationYear >= :yearFrom) AND " +
            "(:yearTo IS NULL OR b.publicationYear <= :yearTo) AND " +
            "(:isbn IS NULL OR b.isbn = :isbn)")
    Page<Book> findBooksWithFilters(
            @Param("title") String title,
            @Param("author") String author,
            @Param("publisher") String publisher,
            @Param("genre") String genre,
            @Param("yearFrom") Integer yearFrom,
            @Param("yearTo") Integer yearTo,
            @Param("isbn") String isbn,
            Pageable pageable);

    // Statistics queries
    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = 'AVAILABLE'")
    Long countAvailableBooks();

    @Query("SELECT SUM(b.availableCopies) FROM Book b WHERE b.status = 'AVAILABLE'")
    Long countTotalAvailableCopies();

    @Query("SELECT b.genre, COUNT(b) FROM Book b GROUP BY b.genre ORDER BY COUNT(b) DESC")
    List<Object[]> getBookCountByGenre();

    @Query("SELECT b.publicationYear, COUNT(b) FROM Book b WHERE b.publicationYear IS NOT NULL " +
            "GROUP BY b.publicationYear ORDER BY b.publicationYear DESC")
    List<Object[]> getBookCountByYear();

    // Books with low stock
    @Query("SELECT b FROM Book b WHERE b.availableCopies <= :threshold AND b.status = 'AVAILABLE'")
    List<Book> findBooksWithLowStock(@Param("threshold") Integer threshold);

    // Latest books by category
    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId " +
            "ORDER BY b.createdAt DESC")
    List<Book> findLatestBooksByCategory(@Param("categoryId") Long categoryId, Pageable pageable);

    // Check if ISBN already exists (useful for validation)
    boolean existsByIsbn(String isbn);

    // Find books without any categories
    @Query("SELECT b FROM Book b WHERE b.categories IS EMPTY")
    List<Book> findBooksWithoutCategories();
}