package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.dto.LoanRequestDTO;
import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.LoanStatus;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.LoanRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Configuration constants
    private static final int DEFAULT_LOAN_DURATION_DAYS = 14;
    private static final int MAX_LOANS_PER_USER = 5;
    private static final BigDecimal LATE_FEE_PER_DAY = new BigDecimal("0.50");

    // ============ Borrow Operations ============

    /**
     * Borrow a book for a user
     */
    public Loan borrowBook(Long userId, Long bookId) {
        return borrowBook(userId, bookId, DEFAULT_LOAN_DURATION_DAYS);
    }

    /**
     * Borrow a book for a user with custom loan duration
     */
    public Loan borrowBook(Long userId, Long bookId, int loanDurationDays) {
        log.info("Processing loan request - User: {}, Book: {}", userId, bookId);

        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Validate book
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + bookId));

        // Check if user already has this book
        if (loanRepository.hasActiveBookLoan(userId, bookId)) {
            throw new RuntimeException("User already has an active loan for this book");
        }

        // Check user's loan limit
        int currentLoans = loanRepository.countCurrentLoansForUser(userId);
        if (currentLoans >= MAX_LOANS_PER_USER) {
            throw new RuntimeException("User has reached maximum loan limit of " + MAX_LOANS_PER_USER + " books");
        }

        // Check book availability
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        if (book.getStatus() != Book.BookStatus.AVAILABLE) {
            throw new RuntimeException("Book is not available for borrowing. Status: " + book.getStatus());
        }

        // Create the loan
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate = borrowDate.plusDays(loanDurationDays);

        Loan loan = Loan.builder()
                .user(user)
                .book(book)
                .borrowDate(borrowDate)
                .dueDate(dueDate)
                .status(LoanStatus.ACTIVE)
                .build();

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus(Book.BookStatus.OUT_OF_STOCK);
        }
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan created successfully - ID: {}, Book: '{}', User: '{}'",
                savedLoan.getId(), book.getTitle(), user.getUsername());

        return savedLoan;
    }

    /**
     * Create a loan request with delivery information (status: PENDING_DELIVERY)
     * Book copies are NOT decremented until admin activates the loan
     */
    public Loan createLoanRequest(Long userId, LoanRequestDTO request) {
        log.info("Processing loan request - User: {}, Book: {}", userId, request.bookId());

        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Validate book
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + request.bookId()));

        // Check if user already has this book (active or pending)
        if (loanRepository.hasActiveBookLoan(userId, request.bookId())) {
            throw new RuntimeException("User already has an active or pending loan for this book");
        }

        // Check user's loan limit (including pending)
        int currentLoans = loanRepository.countCurrentLoansForUser(userId);
        if (currentLoans >= MAX_LOANS_PER_USER) {
            throw new RuntimeException("User has reached maximum loan limit of " + MAX_LOANS_PER_USER + " books");
        }

        // Check book availability
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        // Create the loan request with PENDING_DELIVERY status
        LocalDate borrowDate = LocalDate.now();
        LocalDate dueDate = borrowDate.plusDays(DEFAULT_LOAN_DURATION_DAYS);

        Loan loan = Loan.builder()
                .user(user)
                .book(book)
                .borrowDate(borrowDate)
                .dueDate(dueDate)
                .status(LoanStatus.PENDING_DELIVERY)
                .phone(request.phone())
                .deliveryAddress(request.deliveryAddress())
                .deliveryNotes(request.deliveryNotes())
                .preferredPickupDate(request.preferredPickupDate())
                .build();

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan request created - ID: {}, Book: '{}', User: '{}', Status: PENDING_DELIVERY",
                savedLoan.getId(), book.getTitle(), user.getUsername());

        // Send email notification to user
        try {
            emailService.sendLoanRequestConfirmation(user, book.getTitle(), request.preferredPickupDate());
        } catch (Exception e) {
            log.error("Failed to send loan request confirmation email", e);
        }

        return savedLoan;
    }

    /**
     * Activate a pending loan (admin action) - changes status to ACTIVE and decrements book copies
     */
    public Loan activateLoan(Long loanId) {
        log.info("Activating loan ID: {}", loanId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + loanId));

        if (loan.getStatus() != LoanStatus.PENDING_DELIVERY) {
            throw new RuntimeException("Can only activate loans with PENDING_DELIVERY status. Current status: " + loan.getStatus());
        }

        Book book = loan.getBook();

        // Check book availability before activation
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for this book");
        }

        // Update loan status
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setBorrowDate(LocalDate.now()); // Reset borrow date to activation date
        loan.setDueDate(LocalDate.now().plusDays(DEFAULT_LOAN_DURATION_DAYS));

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        if (book.getAvailableCopies() == 0) {
            book.setStatus(Book.BookStatus.OUT_OF_STOCK);
        }
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan activated - ID: {}, Book: '{}', User: '{}'",
                loanId, book.getTitle(), loan.getUser().getUsername());

        // Send email notification about activation
        try {
            emailService.sendBorrowNotification(
                    loan.getUser(),
                    book.getTitle(),
                    savedLoan.getDueDate().toString()
            );
        } catch (Exception e) {
            log.error("Failed to send loan activation email", e);
        }

        return savedLoan;
    }

    // ============ Return Operations ============

    /**
     * Return a borrowed book
     */
    public Loan returnBook(Long loanId) {
        return returnBook(loanId, null);
    }

    /**
     * Return a borrowed book with optional notes
     */
    public Loan returnBook(Long loanId, String notes) {
        log.info("Processing return for loan ID: {}", loanId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + loanId));

        if (!loan.isActive()) {
            throw new RuntimeException("Loan is not active. Current status: " + loan.getStatus());
        }

        // Calculate late fee if overdue
        if (loan.isOverdue()) {
            long daysOverdue = loan.getDaysOverdue();
            BigDecimal lateFee = LATE_FEE_PER_DAY.multiply(BigDecimal.valueOf(daysOverdue));
            loan.setLateFee(lateFee);
            log.info("Late fee calculated: {} for {} days overdue", lateFee, daysOverdue);
        }

        // Mark as returned
        loan.markAsReturned();
        if (notes != null && !notes.trim().isEmpty()) {
            loan.setNotes(notes);
        }

        // Increment available copies
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        if (book.getStatus() == Book.BookStatus.OUT_OF_STOCK) {
            book.setStatus(Book.BookStatus.AVAILABLE);
        }
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);
        log.info("Book returned successfully - Loan ID: {}, Book: '{}'",
                loanId, book.getTitle());

        return savedLoan;
    }

    /**
     * Return a book by user and book IDs (alternative method)
     */
    public Loan returnBookByUserAndBook(Long userId, Long bookId, String notes) {
        log.info("Processing return - User: {}, Book: {}", userId, bookId);

        List<Loan> activeLoans = loanRepository.findActiveLoansForBook(bookId);
        Loan loan = activeLoans.stream()
                .filter(l -> l.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active loan found for this user and book"));

        return returnBook(loan.getId(), notes);
    }

    // ============ Loan Extension ============

    /**
     * Extend a loan's due date
     */
    public Loan extendLoan(Long loanId, int additionalDays) {
        log.info("Extending loan ID: {} by {} days", loanId, additionalDays);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + loanId));

        if (!loan.isActive()) {
            throw new RuntimeException("Cannot extend inactive loan. Status: " + loan.getStatus());
        }

        // Don't allow extension if already overdue
        if (loan.getStatus() == LoanStatus.OVERDUE) {
            throw new RuntimeException("Cannot extend overdue loan. Please return the book first.");
        }

        loan.setDueDate(loan.getDueDate().plusDays(additionalDays));

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan extended - New due date: {}", savedLoan.getDueDate());

        return savedLoan;
    }

    // ============ Mark Lost ============

    /**
     * Mark a loan as lost
     */
    public Loan markAsLost(Long loanId) {
        log.info("Marking loan ID: {} as lost", loanId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with ID: " + loanId));

        if (!loan.isActive()) {
            throw new RuntimeException("Loan is not active. Status: " + loan.getStatus());
        }

        loan.setStatus(LoanStatus.LOST);
        loan.setReturnDate(LocalDate.now());

        // Update book's total copies (one less copy in the system)
        Book book = loan.getBook();
        book.setTotalCopies(book.getTotalCopies() - 1);
        bookRepository.save(book);

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan marked as lost - Book: '{}'", book.getTitle());

        return savedLoan;
    }

    // ============ Query Operations ============

    /**
     * Get a loan by ID
     */
    @Transactional(readOnly = true)
    public Optional<Loan> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    /**
     * Get all active loans for a user
     */
    @Transactional(readOnly = true)
    public List<Loan> getActiveLoansForUser(Long userId) {
        return loanRepository.findActiveLoansForUser(userId);
    }

    /**
     * Get all active loans for a user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<Loan> getActiveLoansForUser(Long userId, Pageable pageable) {
        return loanRepository.findActiveLoansForUser(userId, pageable);
    }

    /**
     * Get all loans for a user (active + history)
     */
    @Transactional(readOnly = true)
    public List<Loan> getAllLoansForUser(Long userId) {
        return loanRepository.findByUserId(userId);
    }

    /**
     * Get loan history for a user
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoanHistoryForUser(Long userId) {
        return loanRepository.findLoanHistoryForUser(userId);
    }

    /**
     * Get loan history for a user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<Loan> getLoanHistoryForUser(Long userId, Pageable pageable) {
        return loanRepository.findLoanHistoryForUser(userId, pageable);
    }

    /**
     * Get overdue loans for a user
     */
    @Transactional(readOnly = true)
    public List<Loan> getOverdueLoansForUser(Long userId) {
        return loanRepository.findOverdueLoansForUser(userId);
    }

    /**
     * Get all overdue loans (admin)
     */
    @Transactional(readOnly = true)
    public List<Loan> getAllOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDate.now());
    }

    /**
     * Get loans due soon (for reminders)
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoansDueSoon(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysAhead);
        return loanRepository.findLoansDueSoon(today, endDate);
    }

    /**
     * Get all loans (admin)
     */
    @Transactional(readOnly = true)
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    /**
     * Get loans by status
     */
    @Transactional(readOnly = true)
    public Page<Loan> getLoansByStatus(LoanStatus status, Pageable pageable) {
        return loanRepository.findByStatus(status, pageable);
    }

    // ============ Statistics ============

    /**
     * Get loan statistics for a user
     */
    @Transactional(readOnly = true)
    public UserLoanStats getUserLoanStats(Long userId) {
        Long activeCount = loanRepository.countActiveLoansForUser(userId);
        Long overdueCount = loanRepository.countOverdueLoansForUser(userId);
        Long totalCount = loanRepository.countTotalLoansForUser(userId);
        BigDecimal totalFees = loanRepository.getTotalLateFeeForUser(userId);

        return new UserLoanStats(
                activeCount != null ? activeCount : 0L,
                overdueCount != null ? overdueCount : 0L,
                totalCount != null ? totalCount : 0L,
                totalFees != null ? totalFees : BigDecimal.ZERO,
                MAX_LOANS_PER_USER
        );
    }

    /**
     * Get global loan statistics (admin)
     */
    @Transactional(readOnly = true)
    public GlobalLoanStats getGlobalLoanStats() {
        Long activeCount = loanRepository.countActiveLoans();
        Long overdueCount = loanRepository.countOverdueLoans();
        Long returnedCount = loanRepository.countReturnedLoans();
        BigDecimal totalFees = loanRepository.getTotalLateFees();

        return new GlobalLoanStats(
                activeCount != null ? activeCount : 0L,
                overdueCount != null ? overdueCount : 0L,
                returnedCount != null ? returnedCount : 0L,
                totalFees != null ? totalFees : BigDecimal.ZERO
        );
    }

    // ============ Scheduled Tasks ============

    /**
     * Update overdue status for all active loans (called by scheduler)
     */
    public int updateOverdueStatuses() {
        log.info("Running overdue status update...");

        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LocalDate.now());
        int count = 0;

        for (Loan loan : overdueLoans) {
            if (loan.getStatus() == LoanStatus.ACTIVE) {
                loan.setStatus(LoanStatus.OVERDUE);
                loanRepository.save(loan);
                count++;
            }
        }

        log.info("Updated {} loans to overdue status", count);
        return count;
    }

    // ============ Inner Classes for Statistics ============

    public record UserLoanStats(
            Long activeLoans,
            Long overdueLoans,
            Long totalLoans,
            BigDecimal totalLateFees,
            int maxLoansAllowed
    ) {}

    public record GlobalLoanStats(
            Long activeLoans,
            Long overdueLoans,
            Long returnedLoans,
            BigDecimal totalLateFees
    ) {}
}
