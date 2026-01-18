package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.PageResponse;
import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.service.BookImportService;
import com.bibliotheque.gestion.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
public class BookController {

    private final BookService bookService;
    private final BookImportService bookImportService;  // Add this

    /**
     * Crée un nouveau livre
     * POST /api/books
     */
    @PostMapping
    public ResponseEntity<DataResponse<Book>> createBook(@RequestBody CreateBookRequest request) {
        log.info("Creating book: {} by {}", request.getTitle(), request.getAuthor());

        try {
            Book book = bookService.createBook(
                    request.getIsbn(),
                    request.getTitle(),
                    request.getAuthor(),
                    request.getPublisher(),
                    request.getPublicationYear(),
                    request.getGenre(),
                    request.getSummary(),
                    request.getTotalCopies(),
                    request.getCategoryIds()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Book created successfully", book));
        } catch (RuntimeException e) {
            log.error("Error creating book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Récupère tous les livres
     * GET /api/books
     */
    @GetMapping
    public ResponseEntity<ListResponse<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        return ResponseEntity.ok(new ListResponse<>(true, "Books retrieved successfully", books));
    }

    /**
     * Récupère un livre par ID
     * GET /api/books/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DataResponse<Book>> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.getBookById(id);

        if (book.isPresent()) {
            return ResponseEntity.ok(new DataResponse<>(true, "Book retrieved successfully", book.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Récupère un livre par ISBN
     * GET /api/books/isbn/{isbn}
     */
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<DataResponse<Book>> getBookByIsbn(@PathVariable String isbn) {
        Optional<Book> book = bookService.getBookByIsbn(isbn);

        if (book.isPresent()) {
            return ResponseEntity.ok(new DataResponse<>(true, "Book retrieved successfully", book.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Met à jour un livre
     * PUT /api/books/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DataResponse<Book>> updateBook(
            @PathVariable Long id,
            @RequestBody UpdateBookRequest request) {

        log.info("Updating book with ID: {}", id);

        try {
            Book updatedBook = bookService.updateBook(
                    id,
                    request.getIsbn(),
                    request.getTitle(),
                    request.getAuthor(),
                    request.getPublisher(),
                    request.getPublicationYear(),
                    request.getGenre(),
                    request.getSummary(),
                    request.getTotalCopies(),
                    request.getCategoryIds()
            );
            return ResponseEntity.ok(new DataResponse<>(true, "Book updated successfully", updatedBook));
        } catch (RuntimeException e) {
            log.error("Error updating book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }
    @PostMapping("/import")
    public ResponseEntity<DataResponse<BookImportService.ImportResult>> importBooks(
            @RequestParam("file") MultipartFile file) {

        log.info("Importing books from CSV: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "File is empty", null));
        }

        BookImportService.ImportResult result = bookImportService.importBooksFromCsv(file);

        String message = String.format("Import complete: %d added, %d skipped, %d errors",
                result.successCount(), result.skipCount(), result.errors().size());

        return ResponseEntity.ok(new DataResponse<>(true, message, result));
    }
    /**
     * Supprime un livre
     * DELETE /api/books/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteBook(@PathVariable Long id) {
        log.info("Deleting book with ID: {}", id);

        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok(new ApiResponse(true, "Book deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Recherche de livres par titre
     * GET /api/books/search/title?q={title}
     */
    @GetMapping("/search/title")
    public ResponseEntity<ListResponse<Book>> searchBooksByTitle(@RequestParam String q) {
        List<Book> books = bookService.searchBooksByTitle(q);
        return ResponseEntity.ok(new ListResponse<>(true, "Search results retrieved successfully", books));
    }

    /**
     * Recherche de livres par auteur
     * GET /api/books/search/author?q={author}
     */
    @GetMapping("/search/author")
    public ResponseEntity<ListResponse<Book>> searchBooksByAuthor(@RequestParam String q) {
        List<Book> books = bookService.searchBooksByAuthor(q);
        return ResponseEntity.ok(new ListResponse<>(true, "Search results retrieved successfully", books));
    }

    /**
     * Recherche avancée de livres avec filtres
     * GET /api/books/search?title=...&author=...&publisher=...&genre=...&yearFrom=...&yearTo=...&isbn=...&page=0&size=10
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<Book>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String publisher,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) String isbn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookService.searchBooks(title, author, publisher, genre, yearFrom, yearTo, isbn, pageable);
        return ResponseEntity.ok(new PageResponse<>(true, "Search results retrieved successfully", books));
    }

    /**
     * Récupère les livres d'une catégorie
     * GET /api/books/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ListResponse<Book>> getBooksByCategory(@PathVariable Long categoryId) {
        List<Book> books = bookService.getBooksByCategory(categoryId);
        return ResponseEntity.ok(new ListResponse<>(true, "Books by category retrieved successfully", books));
    }

    /**
     * Récupère les livres avec stock faible
     * GET /api/books/low-stock?threshold={threshold}
     */
    @GetMapping("/low-stock")
    public ResponseEntity<ListResponse<Book>> getBooksWithLowStock(@RequestParam(defaultValue = "3") Integer threshold) {
        List<Book> books = bookService.getBooksWithLowStock(threshold);
        return ResponseEntity.ok(new ListResponse<>(true, "Low stock books retrieved successfully", books));
    }

    /**
     * Récupère les livres sans catégories
     * GET /api/books/without-categories
     */
    @GetMapping("/without-categories")
    public ResponseEntity<ListResponse<Book>> getBooksWithoutCategories() {
        List<Book> books = bookService.getBooksWithoutCategories();
        return ResponseEntity.ok(new ListResponse<>(true, "Books without categories retrieved successfully", books));
    }

    /**
     * Ajoute un livre à une catégorie
     * POST /api/books/{bookId}/categories/{categoryId}
     */
    @PostMapping("/{bookId}/categories/{categoryId}")
    public ResponseEntity<ApiResponse> addBookToCategory(
            @PathVariable Long bookId,
            @PathVariable Long categoryId) {

        log.info("Adding book {} to category {}", bookId, categoryId);

        try {
            bookService.addBookToCategory(bookId, categoryId);
            return ResponseEntity.ok(new ApiResponse(true, "Book added to category successfully"));
        } catch (RuntimeException e) {
            log.error("Error adding book to category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Retire un livre d'une catégorie
     * DELETE /api/books/{bookId}/categories/{categoryId}
     */
    @DeleteMapping("/{bookId}/categories/{categoryId}")
    public ResponseEntity<ApiResponse> removeBookFromCategory(
            @PathVariable Long bookId,
            @PathVariable Long categoryId) {

        log.info("Removing book {} from category {}", bookId, categoryId);

        try {
            bookService.removeBookFromCategory(bookId, categoryId);
            return ResponseEntity.ok(new ApiResponse(true, "Book removed from category successfully"));
        } catch (RuntimeException e) {
            log.error("Error removing book from category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // DTOs pour les requêtes
    public static class CreateBookRequest {
        private String isbn;
        private String title;
        private String author;
        private String publisher;
        private Integer publicationYear;
        private String genre;
        private String summary;
        private Integer totalCopies;
        private Set<Long> categoryIds;

        // Getters et Setters
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }

        public Integer getTotalCopies() { return totalCopies; }
        public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

        public Set<Long> getCategoryIds() { return categoryIds; }
        public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
    }

    public static class UpdateBookRequest {
        private String isbn;
        private String title;
        private String author;
        private String publisher;
        private Integer publicationYear;
        private String genre;
        private String summary;
        private Integer totalCopies;
        private Set<Long> categoryIds;

        // Getters et Setters (same as CreateBookRequest)
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }

        public Integer getTotalCopies() { return totalCopies; }
        public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

        public Set<Long> getCategoryIds() { return categoryIds; }
        public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
    }
}