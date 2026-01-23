package com.bibliotheque.gestion.mapper;

import com.bibliotheque.gestion.dto.LoanDTO;
import com.bibliotheque.gestion.dto.LoanUserDTO;
import com.bibliotheque.gestion.dto.LoanBookDTO;
import com.bibliotheque.gestion.entity.Loan;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class LoanMapper {

    public LoanDTO toDTO(Loan loan) {
        if (loan == null) {
            return null;
        }

        LoanDTO dto = LoanDTO.builder()
                .id(loan.getId())
                .loanDate(loan.getLoanDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .status(loan.getStatus())
                .notes(loan.getNotes())
                .fineAmount(loan.getFineAmount())
                .isOverdue(loan.isOverdue())
                .daysOverdue(loan.getDaysOverdue())
                .build();

        // Map user
        if (loan.getUser() != null) {
            dto.setUser(LoanUserDTO.builder()
                    .id(loan.getUser().getId())
                    .username(loan.getUser().getUsername())
                    .email(loan.getUser().getEmail())
                    .firstName(loan.getUser().getFirstName())
                    .lastName(loan.getUser().getLastName())
                    // Removed: .membershipNumber(loan.getUser().getMembershipNumber())
                    .build());
        }

        // Map book
        if (loan.getBook() != null) {
            dto.setBook(LoanBookDTO.builder()
                    .id(loan.getBook().getId())
                    .isbn(loan.getBook().getIsbn())
                    .title(loan.getBook().getTitle())
                    .author(loan.getBook().getAuthor())
                    // Removed: .coverImage(loan.getBook().getCoverImage())
                    .build());
        }

        // Calculate permissions
        calculatePermissions(dto, loan);

        return dto;
    }

    private void calculatePermissions(LoanDTO dto, Loan loan) {
        LocalDate today = LocalDate.now();

        // Can renew if active, not overdue, and not renewed before
        boolean canRenew = loan.getStatus() == Loan.LoanStatus.ACTIVE &&
                !loan.isOverdue() &&
                loan.getReturnDate() == null;

        // Can return if active (not returned yet)
        boolean canReturn = loan.getStatus() == Loan.LoanStatus.ACTIVE ||
                loan.getStatus() == Loan.LoanStatus.OVERDUE;

        // Can cancel if not already returned or cancelled
        boolean canCancel = loan.getStatus() != Loan.LoanStatus.RETURNED &&
                loan.getStatus() != Loan.LoanStatus.CANCELLED &&
                loan.getReturnDate() == null;

        dto.setCanRenew(canRenew);
        dto.setCanReturn(canReturn);
        dto.setCanCancel(canCancel);
    }

    public LoanUserDTO toUserDTO(com.bibliotheque.gestion.entity.User user) {
        if (user == null) {
            return null;
        }

        return LoanUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                // Removed: .membershipNumber(user.getMembershipNumber())
                .build();
    }

    public LoanBookDTO toBookDTO(com.bibliotheque.gestion.entity.Book book) {
        if (book == null) {
            return null;
        }

        return LoanBookDTO.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                // Removed: .coverImage(book.getCoverImage())
                .build();
    }
}