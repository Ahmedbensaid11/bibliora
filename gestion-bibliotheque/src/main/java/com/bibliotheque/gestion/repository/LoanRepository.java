package com.bibliotheque.gestion.repository;

import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.LoanStatus;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    // ============ User-based queries ============

    List<Loan> findByUser(User user);

    List<Loan> findByUserId(Long userId);

    Page<Loan> findByUserId(Long userId, Pageable pageable);

    List<Loan> findByUserIdAndStatus(Long userId, LoanStatus status);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status IN :statuses")
    List<Loan> findByUserIdAndStatusIn(@Param("userId") Long userId, @Param("statuses") List<LoanStatus> statuses);

    // ============ Active loans for user ============

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status IN ('ACTIVE', 'OVERDUE') ORDER BY l.dueDate ASC")
    List<Loan> findActiveLoansForUser(@Param("userId") Long userId);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status IN ('ACTIVE', 'OVERDUE') ORDER BY l.dueDate ASC")
    Page<Loan> findActiveLoansForUser(@Param("userId") Long userId, Pageable pageable);

    // ============ Loan history for user ============

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status IN ('RETURNED', 'LOST', 'CANCELLED') ORDER BY l.returnDate DESC")
    List<Loan> findLoanHistoryForUser(@Param("userId") Long userId);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status IN ('RETURNED', 'LOST', 'CANCELLED') ORDER BY l.returnDate DESC")
    Page<Loan> findLoanHistoryForUser(@Param("userId") Long userId, Pageable pageable);

    // ============ Book-based queries ============

    List<Loan> findByBook(Book book);

    List<Loan> findByBookId(Long bookId);

    @Query("SELECT l FROM Loan l WHERE l.book.id = :bookId AND l.status IN ('ACTIVE', 'OVERDUE')")
    List<Loan> findActiveLoansForBook(@Param("bookId") Long bookId);

    // ============ Check if user already has this book ============

    @Query("SELECT COUNT(l) > 0 FROM Loan l WHERE l.user.id = :userId AND l.book.id = :bookId AND l.status IN ('ACTIVE', 'OVERDUE')")
    boolean hasActiveBookLoan(@Param("userId") Long userId, @Param("bookId") Long bookId);

    // ============ Status-based queries ============

    List<Loan> findByStatus(LoanStatus status);

    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE l.status IN :statuses")
    List<Loan> findByStatusIn(@Param("statuses") List<LoanStatus> statuses);

    // ============ Overdue loans ============

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status = 'OVERDUE'")
    List<Loan> findOverdueLoansForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status = 'OVERDUE'")
    Long countOverdueLoansForUser(@Param("userId") Long userId);

    // ============ Date-based queries ============

    List<Loan> findByDueDateBefore(LocalDate date);

    List<Loan> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :startDate AND :endDate")
    List<Loan> findLoansDueSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // ============ Statistics queries ============

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status IN ('ACTIVE', 'OVERDUE')")
    Long countActiveLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'OVERDUE'")
    Long countOverdueLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = 'RETURNED'")
    Long countReturnedLoans();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId")
    Long countTotalLoansForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status IN ('ACTIVE', 'OVERDUE')")
    Long countActiveLoansForUser(@Param("userId") Long userId);

    // ============ Admin statistics ============

    @Query("SELECT l.status, COUNT(l) FROM Loan l GROUP BY l.status")
    List<Object[]> getLoanCountByStatus();

    @Query("SELECT FUNCTION('DATE_FORMAT', l.borrowDate, '%Y-%m'), COUNT(l) FROM Loan l " +
           "WHERE l.borrowDate >= :startDate GROUP BY FUNCTION('DATE_FORMAT', l.borrowDate, '%Y-%m') " +
           "ORDER BY FUNCTION('DATE_FORMAT', l.borrowDate, '%Y-%m')")
    List<Object[]> getLoanCountByMonth(@Param("startDate") LocalDate startDate);

    @Query("SELECT SUM(l.lateFee) FROM Loan l WHERE l.user.id = :userId")
    java.math.BigDecimal getTotalLateFeeForUser(@Param("userId") Long userId);

    @Query("SELECT SUM(l.lateFee) FROM Loan l")
    java.math.BigDecimal getTotalLateFees();

    // ============ Limit checks ============

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status IN ('ACTIVE', 'OVERDUE')")
    int countCurrentLoansForUser(@Param("userId") Long userId);
}
