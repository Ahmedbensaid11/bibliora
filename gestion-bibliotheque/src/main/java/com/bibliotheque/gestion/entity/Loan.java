package com.bibliotheque.gestion.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Entity representing a book loan/borrowing
 */
@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "roles", "resetPasswordToken", "resetPasswordTokenExpiry"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "categories"})
    private Book book;

    @Column(name = "loan_date", nullable = false)
    private LocalDate borrowDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LoanStatus status = LoanStatus.PENDING_DELIVERY;

    @Column(name = "late_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(name = "notes", length = 500)
    private String notes;

    // Delivery information fields
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_notes", length = 500)
    private String deliveryNotes;

    @Column(name = "preferred_pickup_date")
    private LocalDate preferredPickupDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ============ Helper Methods ============

    /**
     * Check if the loan is currently overdue
     */
    public boolean isOverdue() {
        if (status == LoanStatus.RETURNED || status == LoanStatus.CANCELLED || status == LoanStatus.PENDING_DELIVERY) {
            return false;
        }
        return LocalDate.now().isAfter(dueDate);
    }

    /**
     * Get the number of days remaining until due date (negative if overdue)
     */
    public long getDaysRemaining() {
        if (returnDate != null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDate.now(), dueDate);
    }

    /**
     * Get the number of days overdue (0 if not overdue)
     */
    public long getDaysOverdue() {
        if (returnDate != null) {
            // Calculate overdue based on return date
            if (returnDate.isAfter(dueDate)) {
                return ChronoUnit.DAYS.between(dueDate, returnDate);
            }
            return 0;
        }
        // Calculate overdue based on current date
        if (LocalDate.now().isAfter(dueDate)) {
            return ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        }
        return 0;
    }

    /**
     * Check if the loan is active (not returned, lost, or cancelled)
     */
    public boolean isActive() {
        return status == LoanStatus.ACTIVE || status == LoanStatus.OVERDUE;
    }

    /**
     * Mark the loan as returned
     */
    public void markAsReturned() {
        this.returnDate = LocalDate.now();
        this.status = LoanStatus.RETURNED;
    }

    /**
     * Update status to overdue if past due date
     */
    public void updateOverdueStatus() {
        if (isActive() && isOverdue()) {
            this.status = LoanStatus.OVERDUE;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Loan)) return false;
        Loan loan = (Loan) o;
        return id != null && id.equals(loan.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Loan{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", bookId=" + (book != null ? book.getId() : null) +
                ", status=" + status +
                ", borrowDate=" + borrowDate +
                ", dueDate=" + dueDate +
                '}';
    }
}
