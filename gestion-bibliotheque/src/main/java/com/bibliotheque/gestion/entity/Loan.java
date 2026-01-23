package com.bibliotheque.gestion.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private LocalDate loanDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanStatus status = LoanStatus.ACTIVE;

    @Column(length = 500)
    private String notes;

    @Column
    private Double fineAmount = 0.0;

    public enum LoanStatus {
        ACTIVE,      // Currently borrowed
        RETURNED,    // Returned on time
        OVERDUE,     // Past due date
        LOST,        // Book reported lost
        CANCELLED    // Loan cancelled
    }

    // Helper methods
    public boolean isOverdue() {
        return status == LoanStatus.ACTIVE &&
                LocalDate.now().isAfter(dueDate);
    }

    public long getDaysOverdue() {
        if (!isOverdue()) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }

    public void calculateFine(double finePerDay) {
        if (isOverdue()) {
            this.fineAmount = getDaysOverdue() * finePerDay;
        }
    }
}