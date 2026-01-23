package com.bibliotheque.gestion.repository;

import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.Loan.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.Loan.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserIdOrderByLoanDateDesc(Long userId);
    List<Loan> findByUserIdAndStatus(Long userId, LoanStatus status);
    List<Loan> findByStatus(LoanStatus status);
    List<Loan> findByBookId(Long bookId);

    Long countByUserIdAndStatus(Long userId, LoanStatus status);
    boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, LoanStatus status);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :startDate AND :endDate")
    List<Loan> findLoansDueSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(l.fineAmount), 0) FROM Loan l WHERE l.user.id = :userId AND l.fineAmount > 0 AND (l.status = 'ACTIVE' OR l.status = 'OVERDUE')")
    double getTotalUnpaidFinesByUser(@Param("userId") Long userId);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND YEAR(l.loanDate) = :year ORDER BY l.loanDate DESC")
    List<Loan> findByUserIdAndLoanDateYear(@Param("userId") Long userId, @Param("year") int year);














    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId " +
            "AND YEAR(l.returnDate) = :year AND l.status = 'RETURNED'")
    Long countReturnedBooksByUserAndYear(@Param("userId") Long userId, @Param("year") int year);

    /**
     * Count returned books by user, year and month
     */
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId " +
            "AND YEAR(l.returnDate) = :year AND MONTH(l.returnDate) = :month " +
            "AND l.status = 'RETURNED'")
    Long countReturnedBooksByUserAndMonth(@Param("userId") Long userId,
                                          @Param("year") int year,
                                          @Param("month") int month);

    /**
     * Get genre statistics by user and year
     */
    @Query("SELECT c.name as genre, COUNT(l) as count FROM Loan l " +
            "JOIN l.book b JOIN b.categories c " +
            "WHERE l.user.id = :userId AND YEAR(l.returnDate) = :year " +
            "AND l.status = 'RETURNED' " +
            "GROUP BY c.name ORDER BY count DESC")
    Map<String, Long> getGenreStatsByUserAndYear(@Param("userId") Long userId, @Param("year") int year);

    /**
     * Get current reading streak (consecutive days with activity)
     */
    @Query(value = "SELECT COALESCE(MAX(streak), 0) FROM (" +
            "  SELECT COUNT(*) as streak FROM (" +
            "    SELECT DATE(return_date) as date, " +
            "           DATE(return_date) - ROW_NUMBER() OVER (ORDER BY DATE(return_date)) as grp " +
            "    FROM loan " +
            "    WHERE user_id = :userId AND status = 'RETURNED' AND return_date IS NOT NULL" +
            "  ) t GROUP BY grp" +
            ") streaks", nativeQuery = true)
    int getCurrentReadingStreak(@Param("userId") Long userId);

    /**
     * Get longest reading streak
     */
    @Query(value = "SELECT COALESCE(MAX(streak), 0) FROM (" +
            "  SELECT COUNT(*) as streak FROM (" +
            "    SELECT DATE(return_date) as date, " +
            "           DATE(return_date) - ROW_NUMBER() OVER (ORDER BY DATE(return_date)) as grp " +
            "    FROM loan " +
            "    WHERE user_id = :userId AND status = 'RETURNED' AND return_date IS NOT NULL" +
            "  ) t GROUP BY grp" +
            ") streaks", nativeQuery = true)
    int getLongestReadingStreak(@Param("userId") Long userId);

    /**
     * Get average books per month for a user in a specific year
     */
    @Query("SELECT COUNT(l) * 1.0 / :currentMonth FROM Loan l " +
            "WHERE l.user.id = :userId AND YEAR(l.returnDate) = :year " +
            "AND l.status = 'RETURNED'")
    double getAverageBooksPerMonth(@Param("userId") Long userId, @Param("year") int year);

    Page<Loan> findByUserId(Long userId, Pageable pageable);

    Page<Loan> findByBookId(Long bookId, Pageable pageable);

    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l WHERE " +
            "LOWER(l.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(l.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(l.book.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(l.book.author) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "CAST(l.id AS string) LIKE CONCAT('%', :search, '%')")
    Page<Loan> searchLoans(@Param("search") String search, Pageable pageable);


    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :now")
    List<Loan> findOverdueLoans(@Param("now") LocalDateTime now);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate BETWEEN :start AND :end")
    List<Loan> findLoansDueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count all loans by user excluding cancelled ones
     */
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status != :excludedStatus")
    Long countByUserIdAndStatusNot(@Param("userId") Long userId, @Param("excludedStatus") LoanStatus excludedStatus);

    /**
     * Find overdue loans for a specific user
     */
    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status = :status AND l.dueDate < :date")
    List<Loan> findByUserIdAndStatusAndDueDateBefore(
            @Param("userId") Long userId,
            @Param("status") LoanStatus status,
            @Param("date") LocalDate date
    );
}