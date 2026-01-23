package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.Loan.LoanStatus;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.exception.BadRequestException;
import com.bibliotheque.gestion.exception.ResourceNotFoundException;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.LoanRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private static final int DEFAULT_LOAN_DURATION_DAYS = 14;
    private static final int MAX_ACTIVE_LOANS = 5;
    private static final double FINE_PER_DAY = 0.5;
    private static final double LOST_BOOK_FINE = 50.0;

    @Transactional
    public Loan borrowBook(Long userId, Long bookId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // Validate book exists
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Livre non trouvé"));

        // Check if book is available
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Ce livre n'est pas disponible");
        }

        // Check if user already has this book
        if (loanRepository.existsByUserIdAndBookIdAndStatus(userId, bookId, LoanStatus.ACTIVE)) {
            throw new BadRequestException("Vous avez déjà emprunté ce livre");
        }

        // Check if user has reached max loans
        long activeLoans = loanRepository.countByUserIdAndStatus(userId, LoanStatus.ACTIVE);
        if (activeLoans >= MAX_ACTIVE_LOANS) {
            throw new BadRequestException("Vous avez atteint le nombre maximum d'emprunts (" + MAX_ACTIVE_LOANS + ")");
        }

        // Check if user has unpaid fines
        double totalFines = loanRepository.getTotalUnpaidFinesByUser(userId);
        if (totalFines > 0) {
            throw new BadRequestException("Vous avez des amendes impayées. Montant total: " + totalFines + " TND");
        }

        // Create new loan
        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBook(book);
        loan.setLoanDate(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(DEFAULT_LOAN_DURATION_DAYS));
        loan.setStatus(LoanStatus.ACTIVE);

        // Update book available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));

        if (loan.getStatus() != LoanStatus.ACTIVE && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BadRequestException("Ce livre n'est pas en cours d'emprunt");
        }

        // Update loan
        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LoanStatus.RETURNED);

        // Calculate fine if overdue
        if (loan.getStatus() == LoanStatus.OVERDUE || loan.isOverdue()) {
            loan.calculateFine(FINE_PER_DAY);
        }

        // Update book available copies
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan renewLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BadRequestException("Seuls les emprunts actifs peuvent être renouvelés");
        }

        if (loan.isOverdue()) {
            throw new BadRequestException("Impossible de renouveler un emprunt en retard");
        }

        // Check if already renewed multiple times
        int renewalCount = 0;
        String notes = loan.getNotes();
        if (notes != null && notes.contains("Renouvelé")) {
            // Simple check for renewals in notes
            String[] lines = notes.split("\n");
            for (String line : lines) {
                if (line.contains("Renouvelé")) {
                    renewalCount++;
                }
            }
        }

        if (renewalCount >= 2) {
            throw new BadRequestException("Cet emprunt a déjà été renouvelé 2 fois (maximum)");
        }

        // Extend due date
        loan.setDueDate(loan.getDueDate().plusDays(DEFAULT_LOAN_DURATION_DAYS));

        // Add renewal note
        String renewalNote = "\nRenouvelé le " + LocalDate.now() + " (nouvelle date de retour: " + loan.getDueDate() + ")";
        loan.setNotes((loan.getNotes() != null ? loan.getNotes() : "") + renewalNote);

        return loanRepository.save(loan);
    }

    public List<Loan> getUserLoans(Long userId) {
        return loanRepository.findByUserIdOrderByLoanDateDesc(userId);
    }

    public List<Loan> getUserActiveLoans(Long userId) {
        return loanRepository.findByUserIdAndStatus(userId, LoanStatus.ACTIVE);
    }

    public Loan getLoanById(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));
    }

    public List<Loan> getOverdueLoans() {
        List<Loan> loans = loanRepository.findOverdueLoans(LocalDate.now());
        // Calculate fines for all overdue loans
        loans.forEach(loan -> loan.calculateFine(FINE_PER_DAY));
        return loans;
    }

    @Transactional
    public void updateOverdueLoans() {
        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LocalDate.now());
        for (Loan loan : overdueLoans) {
            if (loan.getStatus() != LoanStatus.OVERDUE) {
                loan.setStatus(LoanStatus.OVERDUE);
                loan.calculateFine(FINE_PER_DAY);
                loanRepository.save(loan);
            }
        }
    }

    public List<Loan> getLoansDueSoon(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        return loanRepository.findLoansDueSoon(startDate, endDate);
    }

    // NEW METHOD: Get all active loans (for admin)
    public List<Loan> getAllActiveLoans() {
        return loanRepository.findByStatus(LoanStatus.ACTIVE);
    }

    // NEW METHOD: Mark loan as lost (for admin)
    @Transactional
    public Loan markAsLost(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));

        if (loan.getStatus() == LoanStatus.LOST) {
            throw new BadRequestException("Ce livre est déjà marqué comme perdu");
        }

        if (loan.getStatus() != LoanStatus.ACTIVE && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new BadRequestException("Seuls les emprunts actifs ou en retard peuvent être marqués comme perdus");
        }

        // Calculate fine
        if (loan.isOverdue()) {
            loan.calculateFine(FINE_PER_DAY);
            loan.setFineAmount(loan.getFineAmount() + LOST_BOOK_FINE);
        } else {
            loan.setFineAmount(LOST_BOOK_FINE);
        }

        loan.setStatus(LoanStatus.LOST);
        loan.setReturnDate(LocalDate.now());

        // Update notes
        String lostNote = "\nMarqué comme perdu le " + LocalDate.now() + " (amende: " + loan.getFineAmount() + " TND)";
        loan.setNotes((loan.getNotes() != null ? loan.getNotes() : "") + lostNote);

        return loanRepository.save(loan);
    }

    // NEW METHOD: Cancel loan
    @Transactional
    public Loan cancelLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BadRequestException("Seuls les emprunts actifs peuvent être annulés");
        }

        // Return the book copy
        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        loan.setStatus(LoanStatus.CANCELLED);
        loan.setReturnDate(LocalDate.now());

        // Update notes
        String cancelNote = "\nAnnulé le " + LocalDate.now();
        loan.setNotes((loan.getNotes() != null ? loan.getNotes() : "") + cancelNote);

        return loanRepository.save(loan);
    }

    // NEW METHOD: Save loan (needed for controller updates)
    @Transactional
    public Loan saveLoan(Loan loan) {
        return loanRepository.save(loan);
    }

    // NEW METHOD: Get all loans (for statistics)
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    // NEW METHOD: Get loans by status
    public List<Loan> getLoansByStatus(LoanStatus status) {
        return loanRepository.findByStatus(status);
    }

    // NEW METHOD: Get user's overdue loans
    public List<Loan> getUserOverdueLoans(Long userId) {
        return loanRepository.findByUserIdAndStatus(userId, LoanStatus.OVERDUE);
    }

    // NEW METHOD: Pay fine for a loan
    @Transactional
    public Loan payFine(Long loanId, double amountPaid) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt non trouvé"));

        if (loan.getFineAmount() <= 0) {
            throw new BadRequestException("Aucune amende à payer pour cet emprunt");
        }

        if (amountPaid > loan.getFineAmount()) {
            throw new BadRequestException("Le montant payé dépasse l'amende due");
        }

        // Update fine amount (partial payment scenario)
        double remainingFine = loan.getFineAmount() - amountPaid;
        loan.setFineAmount(remainingFine);

        // Update notes
        String paymentNote = "\nAmende payée: " + amountPaid + " TND le " + LocalDate.now() +
                (remainingFine > 0 ? " (reste à payer: " + remainingFine + " TND)" : " (entièrement payé)");
        loan.setNotes((loan.getNotes() != null ? loan.getNotes() : "") + paymentNote);

        return loanRepository.save(loan);
    }

    // NEW METHOD: Calculate total fines for user
    public double getUserTotalFines(Long userId) {
        return loanRepository.getTotalUnpaidFinesByUser(userId);
    }

    // NEW METHOD: Get loans by book
    public List<Loan> getLoansByBook(Long bookId) {
        return loanRepository.findByBookId(bookId);
    }

    // NEW METHOD: Check if user can borrow more books
    public boolean canUserBorrowMoreBooks(Long userId) {
        long activeLoans = loanRepository.countByUserIdAndStatus(userId, LoanStatus.ACTIVE);
        double totalFines = loanRepository.getTotalUnpaidFinesByUser(userId);

        return activeLoans < MAX_ACTIVE_LOANS && totalFines == 0;
    }
    public List<Loan> getUserLoansByYear(Long userId, int year) {
        return loanRepository.findByUserIdAndLoanDateYear(userId, year);
    }
}