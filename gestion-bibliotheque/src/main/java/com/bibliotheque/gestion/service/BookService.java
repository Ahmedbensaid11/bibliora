package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Crée un nouveau livre
     */
    public Book createBook(String isbn, String title, String author, String publisher,
                           Integer publicationYear, String genre, String summary,
                           Integer totalCopies, Set<Long> categoryIds) {

        log.info("Creating book: {} by {} with ISBN: {}", title, author, isbn);

        // Vérifier si l'ISBN existe déjà
        if (bookRepository.existsByIsbn(isbn)) {
            throw new RuntimeException("A book with ISBN " + isbn + " already exists");
        }

        Book book = Book.builder()
                .isbn(isbn)
                .title(title)
                .author(author)
                .publisher(publisher)
                .publicationYear(publicationYear)
                .genre(genre)
                .summary(summary)
                .totalCopies(totalCopies != null ? totalCopies : 1)
                .availableCopies(totalCopies != null ? totalCopies : 1)
                .status(Book.BookStatus.AVAILABLE)
                .build();

        // Assigner aux catégories si spécifiées
        if (categoryIds != null && !categoryIds.isEmpty()) {
            assignCategoriesToBook(book, categoryIds);
        }

        Book savedBook = bookRepository.save(book);
        log.info("Book created successfully with ID: {}", savedBook.getId());
        return savedBook;
    }

    /**
     * Supprime un livre
     */
    public void deleteBook(Long bookId) {
        log.info("Deleting book with ID: {}", bookId);

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) {
            throw new RuntimeException("Book not found with ID: " + bookId);
        }

        Book book = bookOpt.get();

        // Retirer le livre de toutes ses catégories
        book.clearCategories();

        // Supprimer le livre
        bookRepository.delete(book);

        log.info("Book {} deleted successfully", book.getTitle());
    }

    /**
     * Met à jour un livre
     */
    public Book updateBook(Long bookId, String isbn, String title, String author, String publisher,
                           Integer publicationYear, String genre, String summary,
                           Integer totalCopies, Set<Long> categoryIds) {

        log.info("Updating book with ID: {}", bookId);

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        if (bookOpt.isEmpty()) {
            throw new RuntimeException("Book not found with ID: " + bookId);
        }

        Book book = bookOpt.get();

        // Vérifier l'ISBN si changé
        if (isbn != null && !isbn.equals(book.getIsbn())) {
            if (bookRepository.existsByIsbn(isbn)) {
                throw new RuntimeException("A book with ISBN " + isbn + " already exists");
            }
            book.setIsbn(isbn);
        }

        // Mettre à jour les champs
        if (title != null) book.setTitle(title);
        if (author != null) book.setAuthor(author);
        if (publisher != null) book.setPublisher(publisher);
        if (publicationYear != null) book.setPublicationYear(publicationYear);
        if (genre != null) book.setGenre(genre);
        if (summary != null) book.setSummary(summary);

        // Mettre à jour le stock
        if (totalCopies != null) {
            int difference = totalCopies - book.getTotalCopies();
            book.setTotalCopies(totalCopies);
            book.setAvailableCopies(book.getAvailableCopies() + difference);

            // Assurer que les copies disponibles ne deviennent pas négatives
            if (book.getAvailableCopies() < 0) {
                book.setAvailableCopies(0);
            }
        }

        // Mettre à jour les catégories si spécifiées
        if (categoryIds != null) {
            book.clearCategories();
            assignCategoriesToBook(book, categoryIds);
        }

        Book savedBook = bookRepository.save(book);
        log.info("Book updated successfully: {}", savedBook.getTitle());
        return savedBook;
    }

    /**
     * Assigne des catégories à un livre
     */
    private void assignCategoriesToBook(Book book, Set<Long> categoryIds) {
        for (Long categoryId : categoryIds) {
            Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);
            if (categoryOpt.isPresent()) {
                book.addToCategory(categoryOpt.get());
            } else {
                log.warn("Category not found with ID: {}, skipping assignment", categoryId);
            }
        }
    }

    /**
     * Ajoute un livre à une catégorie
     */
    public void addBookToCategory(Long bookId, Long categoryId) {
        log.info("Adding book {} to category {}", bookId, categoryId);

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);

        if (bookOpt.isEmpty()) {
            throw new RuntimeException("Book not found with ID: " + bookId);
        }
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }

        Book book = bookOpt.get();
        Category category = categoryOpt.get();

        book.addToCategory(category);
        bookRepository.save(book);

        log.info("Book {} added to category {}", book.getTitle(), category.getName());
    }

    /**
     * Retire un livre d'une catégorie
     */
    public void removeBookFromCategory(Long bookId, Long categoryId) {
        log.info("Removing book {} from category {}", bookId, categoryId);

        Optional<Book> bookOpt = bookRepository.findById(bookId);
        Optional<Category> categoryOpt = categoryRepository.findByIdAndActiveTrue(categoryId);

        if (bookOpt.isEmpty()) {
            throw new RuntimeException("Book not found with ID: " + bookId);
        }
        if (categoryOpt.isEmpty()) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }

        Book book = bookOpt.get();
        Category category = categoryOpt.get();

        book.removeFromCategory(category);
        bookRepository.save(book);

        log.info("Book {} removed from category {}", book.getTitle(), category.getName());
    }

    /**
     * Récupère un livre par ID
     */
    @Transactional(readOnly = true)
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    /**
     * Récupère un livre par ISBN
     */
    @Transactional(readOnly = true)
    public Optional<Book> getBookByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    /**
     * Récupère tous les livres
     */
    @Transactional(readOnly = true)
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    /**
     * Recherche des livres par titre
     */
    @Transactional(readOnly = true)
    public List<Book> searchBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * Recherche des livres par auteur
     */
    @Transactional(readOnly = true)
    public List<Book> searchBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    /**
     * Récupère les livres d'une catégorie
     */
    @Transactional(readOnly = true)
    public List<Book> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    /**
     * Recherche avancée avec filtres
     */
    @Transactional(readOnly = true)
    public Page<Book> searchBooks(String title, String author, String publisher, String genre,
                                  Integer yearFrom, Integer yearTo, String isbn, Pageable pageable) {
        return bookRepository.findBooksWithFilters(title, author, publisher, genre,
                yearFrom, yearTo, isbn, pageable);
    }

    /**
     * Récupère les livres avec stock faible
     */
    @Transactional(readOnly = true)
    public List<Book> getBooksWithLowStock(Integer threshold) {
        return bookRepository.findBooksWithLowStock(threshold != null ? threshold : 3);
    }

    /**
     * Récupère les livres sans catégories
     */
    @Transactional(readOnly = true)
    public List<Book> getBooksWithoutCategories() {
        return bookRepository.findBooksWithoutCategories();
    }
}