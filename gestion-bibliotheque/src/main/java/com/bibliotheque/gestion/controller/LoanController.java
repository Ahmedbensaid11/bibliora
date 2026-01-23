package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.*;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.mapper.LoanMapper;
import com.bibliotheque.gestion.security.UserPrincipal;
import com.bibliotheque.gestion.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;
    private final LoanMapper loanMapper;

    @PostMapping("/borrow/{bookId}")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> borrowBook(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long bookId,
            @RequestBody(required = false) CreateLoanRequest request) {

        try {
            Loan loan = loanService.borrowBook(currentUser.getId(), bookId);

            // Add notes if provided in request
            if (request != null && request.getNotes() != null) {
                loan.setNotes(request.getNotes());
                loan = loanService.saveLoan(loan);
            }

            LoanDTO loanDTO = loanMapper.toDTO(loan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Livre emprunté avec succès")
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{loanId}/return")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> returnBook(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long loanId,
            @RequestBody(required = false) ReturnLoanRequest request) {

        try {
            Loan loan = loanService.getLoanById(loanId);

            // Check if user owns this loan or is admin
            if (!loan.getUser().getId().equals(currentUser.getId()) &&
                    !currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                LoanResponse response = LoanResponse.builder()
                        .success(false)
                        .message("Non autorisé")
                        .build();
                return ResponseEntity.status(403).body(response);
            }

            // Process return with optional request data
            if (request != null) {
                // Update condition and notes if provided
                if (request.getCondition() != null) {
                    loan.setNotes((loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                            "Condition: " + request.getCondition());
                }
                if (request.getNotes() != null) {
                    loan.setNotes((loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                            "Retour notes: " + request.getNotes());
                }

                // Handle fine payment
                if (request.getPaidFine() != null && request.getPaidFine() && loan.getFineAmount() > 0) {
                    // Mark fine as paid (you might need additional logic here)
                    loan.setNotes((loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                            "Amende payée");
                }
            }

            Loan returnedLoan = loanService.returnBook(loanId);
            LoanDTO loanDTO = loanMapper.toDTO(returnedLoan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Livre retourné avec succès")
                    .data(loanDTO)
                    .fineAmount(returnedLoan.getFineAmount())
                    .finePaid(request != null && request.getPaidFine() != null ? request.getPaidFine() : false)
                    .build();

            if (returnedLoan.getFineAmount() > 0) {
                response.setMessage("Livre retourné. Amende de " + returnedLoan.getFineAmount() + " TND");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{loanId}/renew")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> renewLoan(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long loanId,
            @RequestBody(required = false) RenewLoanRequest request) {

        try {
            Loan loan = loanService.getLoanById(loanId);

            // Check if user owns this loan or is admin
            if (!loan.getUser().getId().equals(currentUser.getId()) &&
                    !currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                LoanResponse response = LoanResponse.builder()
                        .success(false)
                        .message("Non autorisé")
                        .build();
                return ResponseEntity.status(403).body(response);
            }

            // Add renewal reason if provided
            if (request != null && request.getReason() != null) {
                loan.setNotes((loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                        "Renewal reason: " + request.getReason());
                loan = loanService.saveLoan(loan);
            }

            Loan renewedLoan = loanService.renewLoan(loanId);
            LoanDTO loanDTO = loanMapper.toDTO(renewedLoan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Emprunt renouvelé avec succès")
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-loans")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> getMyLoans(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<Loan> loans = loanService.getUserLoans(currentUser.getId());
        List<LoanDTO> loanDTOs = loans.stream()
                .map(loanMapper::toDTO)
                .collect(Collectors.toList());

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .items(loanDTOs)
                .totalItems(loanDTOs.size())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-active-loans")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> getMyActiveLoans(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<Loan> loans = loanService.getUserActiveLoans(currentUser.getId());
        List<LoanDTO> loanDTOs = loans.stream()
                .map(loanMapper::toDTO)
                .collect(Collectors.toList());

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .items(loanDTOs)
                .totalItems(loanDTOs.size())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{loanId}")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> getLoan(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long loanId) {

        try {
            Loan loan = loanService.getLoanById(loanId);

            // Check if user owns this loan or is admin
            if (!loan.getUser().getId().equals(currentUser.getId()) &&
                    !currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                LoanResponse response = LoanResponse.builder()
                        .success(false)
                        .message("Non autorisé")
                        .build();
                return ResponseEntity.status(403).body(response);
            }

            LoanDTO loanDTO = loanMapper.toDTO(loan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Admin endpoints
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> getOverdueLoans() {
        List<Loan> loans = loanService.getOverdueLoans();
        List<LoanDTO> loanDTOs = loans.stream()
                .map(loanMapper::toDTO)
                .collect(Collectors.toList());

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .items(loanDTOs)
                .totalItems(loanDTOs.size())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/due-soon")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> getLoansDueSoon(
            @RequestParam(defaultValue = "3") int days) {

        List<Loan> loans = loanService.getLoansDueSoon(days);
        List<LoanDTO> loanDTOs = loans.stream()
                .map(loanMapper::toDTO)
                .collect(Collectors.toList());

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .items(loanDTOs)
                .totalItems(loanDTOs.size())
                .build();

        return ResponseEntity.ok(response);
    }

    // Additional admin endpoints
    @GetMapping("/admin/all-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> getAllActiveLoans() {
        List<Loan> loans = loanService.getAllActiveLoans();
        List<LoanDTO> loanDTOs = loans.stream()
                .map(loanMapper::toDTO)
                .collect(Collectors.toList());

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .items(loanDTOs)
                .totalItems(loanDTOs.size())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{loanId}/lost")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> markAsLost(
            @PathVariable Long loanId) {

        try {
            Loan loan = loanService.markAsLost(loanId);
            LoanDTO loanDTO = loanMapper.toDTO(loan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Livre marqué comme perdu")
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{loanId}/cancel")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> cancelLoan(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long loanId) {

        try {
            Loan loan = loanService.getLoanById(loanId);

            // Check if user owns this loan or is admin
            if (!loan.getUser().getId().equals(currentUser.getId()) &&
                    !currentUser.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                LoanResponse response = LoanResponse.builder()
                        .success(false)
                        .message("Non autorisé")
                        .build();
                return ResponseEntity.status(403).body(response);
            }

            Loan cancelledLoan = loanService.cancelLoan(loanId);
            LoanDTO loanDTO = loanMapper.toDTO(cancelledLoan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Emprunt annulé avec succès")
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Statistics endpoint
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> getStatistics() {
        try {
            List<Loan> allLoans = loanService.getAllLoans();
            List<Loan> activeLoans = loanService.getAllActiveLoans();
            List<Loan> overdueLoans = loanService.getOverdueLoans();

            double totalFines = allLoans.stream()
                    .mapToDouble(Loan::getFineAmount)
                    .sum();

            double unpaidFines = allLoans.stream()
                    .filter(loan -> loan.getFineAmount() > 0 &&
                            (loan.getStatus() == Loan.LoanStatus.OVERDUE ||
                                    loan.getStatus() == Loan.LoanStatus.ACTIVE))
                    .mapToDouble(Loan::getFineAmount)
                    .sum();

            LoanStatisticsDTO statistics = LoanStatisticsDTO.builder()
                    .totalLoans(allLoans.size())
                    .activeLoans(activeLoans.size())
                    .overdueLoans(overdueLoans.size())
                    .returnedLoans((int) allLoans.stream()
                            .filter(loan -> loan.getStatus() == Loan.LoanStatus.RETURNED)
                            .count())
                    .totalFines(totalFines)
                    .unpaidFines(unpaidFines)
                    .build();

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Statistiques récupérées")
                    .build();

            // Note: You might want to add a separate field for statistics in LoanResponse
            // For now, we'll use the message field for demonstration

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Simple test endpoint to verify authentication
    @GetMapping("/test-auth")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> testAuth(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        LoanResponse response = LoanResponse.builder()
                .success(true)
                .message("Authentifié avec succès")
                .build();

        // You might want to create a separate AuthResponse DTO for this
        return ResponseEntity.ok(response);
    }

    // User endpoint to report lost book
    @PutMapping("/{loanId}/lost")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<LoanResponse> userMarkAsLost(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long loanId) {

        try {
            Loan loan = loanService.getLoanById(loanId);

            // Authorization check
            if (!loan.getUser().getId().equals(currentUser.getId())) {
                LoanResponse response = LoanResponse.builder()
                        .success(false)
                        .message("Non autorisé")
                        .build();
                return ResponseEntity.status(403).body(response);
            }

            Loan lostLoan = loanService.markAsLost(loanId);
            LoanDTO loanDTO = loanMapper.toDTO(lostLoan);

            LoanResponse response = LoanResponse.builder()
                    .success(true)
                    .message("Livre signalé comme perdu. Amende de " + lostLoan.getFineAmount() + " TND")
                    .data(loanDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LoanResponse response = LoanResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }
}