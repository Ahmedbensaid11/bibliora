package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.PageResponse;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.LoanStatus;
import com.bibliotheque.gestion.security.UserPrincipal;
import com.bibliotheque.gestion.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
@Tag(name = "Loans", description = "APIs pour la gestion des emprunts de livres")
public class LoanController {

    private final LoanService loanService;

    // ============ User Endpoints ============

    /**
     * Emprunter un livre
     * POST /api/loans
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Emprunter un livre", description = "Crée un nouvel emprunt pour l'utilisateur connecté")
    public ResponseEntity<DataResponse<Loan>> borrowBook(@RequestBody BorrowRequest request) {
        Long userId = getCurrentUserId();
        log.info("User {} borrowing book {}", userId, request.getBookId());

        try {
            Loan loan = loanService.borrowBook(userId, request.getBookId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Livre emprunté avec succès", loan));
        } catch (RuntimeException e) {
            log.error("Error borrowing book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Retourner un livre
     * PUT /api/loans/{loanId}/return
     */
    @PutMapping("/{loanId}/return")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Retourner un livre", description = "Marque un emprunt comme retourné")
    public ResponseEntity<DataResponse<Loan>> returnBook(
            @PathVariable Long loanId,
            @RequestBody(required = false) ReturnRequest request) {

        Long userId = getCurrentUserId();
        log.info("User {} returning loan {}", userId, loanId);

        try {
            // Verify the loan belongs to this user (unless admin)
            Optional<Loan> loanOpt = loanService.getLoanById(loanId);
            if (loanOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Loan existingLoan = loanOpt.get();
            if (!existingLoan.getUser().getId().equals(userId) && !isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new DataResponse<>(false, "Vous ne pouvez pas retourner cet emprunt", null));
            }

            String notes = request != null ? request.getNotes() : null;
            Loan loan = loanService.returnBook(loanId, notes);
            return ResponseEntity.ok(new DataResponse<>(true, "Livre retourné avec succès", loan));
        } catch (RuntimeException e) {
            log.error("Error returning book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Mes emprunts en cours
     * GET /api/loans/me
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mes emprunts actifs", description = "Récupère les emprunts en cours de l'utilisateur connecté")
    public ResponseEntity<ListResponse<Loan>> getMyActiveLoans() {
        Long userId = getCurrentUserId();
        List<Loan> loans = loanService.getActiveLoansForUser(userId);
        return ResponseEntity.ok(new ListResponse<>(true, "Emprunts récupérés avec succès", loans));
    }

    /**
     * Mes emprunts en cours (paginé)
     * GET /api/loans/me/paged
     */
    @GetMapping("/me/paged")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mes emprunts actifs (paginé)", description = "Récupère les emprunts en cours avec pagination")
    public ResponseEntity<PageResponse<Loan>> getMyActiveLoansPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Loan> loans = loanService.getActiveLoansForUser(userId, pageable);
        return ResponseEntity.ok(new PageResponse<>(true, "Emprunts récupérés avec succès", loans));
    }

    /**
     * Mon historique d'emprunts
     * GET /api/loans/history
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mon historique", description = "Récupère l'historique des emprunts de l'utilisateur connecté")
    public ResponseEntity<ListResponse<Loan>> getMyLoanHistory() {
        Long userId = getCurrentUserId();
        List<Loan> loans = loanService.getLoanHistoryForUser(userId);
        return ResponseEntity.ok(new ListResponse<>(true, "Historique récupéré avec succès", loans));
    }

    /**
     * Mon historique d'emprunts (paginé)
     * GET /api/loans/history/paged
     */
    @GetMapping("/history/paged")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mon historique (paginé)", description = "Récupère l'historique avec pagination")
    public ResponseEntity<PageResponse<Loan>> getMyLoanHistoryPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Loan> loans = loanService.getLoanHistoryForUser(userId, pageable);
        return ResponseEntity.ok(new PageResponse<>(true, "Historique récupéré avec succès", loans));
    }

    /**
     * Mes emprunts en retard
     * GET /api/loans/overdue
     */
    @GetMapping("/overdue")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mes emprunts en retard", description = "Récupère les emprunts en retard")
    public ResponseEntity<ListResponse<Loan>> getMyOverdueLoans() {
        Long userId = getCurrentUserId();
        List<Loan> loans = loanService.getOverdueLoansForUser(userId);
        return ResponseEntity.ok(new ListResponse<>(true, "Emprunts en retard récupérés", loans));
    }

    /**
     * Mes statistiques d'emprunts
     * GET /api/loans/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mes statistiques", description = "Récupère les statistiques d'emprunts de l'utilisateur")
    public ResponseEntity<DataResponse<LoanService.UserLoanStats>> getMyLoanStats() {
        Long userId = getCurrentUserId();
        LoanService.UserLoanStats stats = loanService.getUserLoanStats(userId);
        return ResponseEntity.ok(new DataResponse<>(true, "Statistiques récupérées avec succès", stats));
    }

    /**
     * Prolonger un emprunt
     * PUT /api/loans/{loanId}/extend
     */
    @PutMapping("/{loanId}/extend")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Prolonger un emprunt", description = "Prolonge la date de retour d'un emprunt")
    public ResponseEntity<DataResponse<Loan>> extendLoan(
            @PathVariable Long loanId,
            @RequestParam(defaultValue = "7") int days) {

        Long userId = getCurrentUserId();
        log.info("User {} extending loan {} by {} days", userId, loanId, days);

        try {
            Optional<Loan> loanOpt = loanService.getLoanById(loanId);
            if (loanOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Loan existingLoan = loanOpt.get();
            if (!existingLoan.getUser().getId().equals(userId) && !isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new DataResponse<>(false, "Vous ne pouvez pas prolonger cet emprunt", null));
            }

            Loan loan = loanService.extendLoan(loanId, days);
            return ResponseEntity.ok(new DataResponse<>(true, "Emprunt prolongé avec succès", loan));
        } catch (RuntimeException e) {
            log.error("Error extending loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    // ============ Admin Endpoints ============

    /**
     * Tous les emprunts (admin)
     * GET /api/loans/admin/all
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tous les emprunts", description = "Récupère tous les emprunts (Admin)")
    public ResponseEntity<ListResponse<Loan>> getAllLoans() {
        List<Loan> loans = loanService.getAllLoans();
        return ResponseEntity.ok(new ListResponse<>(true, "Tous les emprunts récupérés", loans));
    }

    /**
     * Emprunts par statut (admin)
     * GET /api/loans/admin/status/{status}
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Emprunts par statut", description = "Récupère les emprunts par statut (Admin)")
    public ResponseEntity<PageResponse<Loan>> getLoansByStatus(
            @PathVariable LoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Loan> loans = loanService.getLoansByStatus(status, pageable);
        return ResponseEntity.ok(new PageResponse<>(true, "Emprunts récupérés par statut", loans));
    }

    /**
     * Tous les emprunts en retard (admin)
     * GET /api/loans/admin/overdue
     */
    @GetMapping("/admin/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tous les retards", description = "Récupère tous les emprunts en retard (Admin)")
    public ResponseEntity<ListResponse<Loan>> getAllOverdueLoans() {
        List<Loan> loans = loanService.getAllOverdueLoans();
        return ResponseEntity.ok(new ListResponse<>(true, "Emprunts en retard récupérés", loans));
    }

    /**
     * Emprunts à échéance proche (admin)
     * GET /api/loans/admin/due-soon
     */
    @GetMapping("/admin/due-soon")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Échéances proches", description = "Récupère les emprunts à échéance proche (Admin)")
    public ResponseEntity<ListResponse<Loan>> getLoansDueSoon(
            @RequestParam(defaultValue = "3") int daysAhead) {

        List<Loan> loans = loanService.getLoansDueSoon(daysAhead);
        return ResponseEntity.ok(new ListResponse<>(true, "Emprunts à échéance proche récupérés", loans));
    }

    /**
     * Statistiques globales (admin)
     * GET /api/loans/admin/stats
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Statistiques globales", description = "Récupère les statistiques globales (Admin)")
    public ResponseEntity<DataResponse<LoanService.GlobalLoanStats>> getGlobalStats() {
        LoanService.GlobalLoanStats stats = loanService.getGlobalLoanStats();
        return ResponseEntity.ok(new DataResponse<>(true, "Statistiques globales récupérées", stats));
    }

    /**
     * Créer un emprunt pour un utilisateur (admin)
     * POST /api/loans/admin
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un emprunt (Admin)", description = "Crée un emprunt pour un utilisateur spécifique")
    public ResponseEntity<DataResponse<Loan>> adminBorrowBook(@RequestBody AdminBorrowRequest request) {
        log.info("Admin creating loan - User: {}, Book: {}", request.getUserId(), request.getBookId());

        try {
            Loan loan = loanService.borrowBook(request.getUserId(), request.getBookId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Emprunt créé avec succès", loan));
        } catch (RuntimeException e) {
            log.error("Error creating loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Marquer un livre comme perdu (admin)
     * PUT /api/loans/admin/{loanId}/lost
     */
    @PutMapping("/admin/{loanId}/lost")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Marquer comme perdu", description = "Marque un emprunt comme perdu (Admin)")
    public ResponseEntity<DataResponse<Loan>> markAsLost(@PathVariable Long loanId) {
        log.info("Admin marking loan {} as lost", loanId);

        try {
            Loan loan = loanService.markAsLost(loanId);
            return ResponseEntity.ok(new DataResponse<>(true, "Emprunt marqué comme perdu", loan));
        } catch (RuntimeException e) {
            log.error("Error marking loan as lost: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Forcer le retour (admin)
     * PUT /api/loans/admin/{loanId}/return
     */
    @PutMapping("/admin/{loanId}/return")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Forcer le retour (Admin)", description = "Force le retour d'un emprunt (Admin)")
    public ResponseEntity<DataResponse<Loan>> adminReturnBook(
            @PathVariable Long loanId,
            @RequestBody(required = false) ReturnRequest request) {

        log.info("Admin returning loan {}", loanId);

        try {
            String notes = request != null ? request.getNotes() : null;
            Loan loan = loanService.returnBook(loanId, notes);
            return ResponseEntity.ok(new DataResponse<>(true, "Livre retourné avec succès", loan));
        } catch (RuntimeException e) {
            log.error("Error returning book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    // ============ Helper Methods ============

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userPrincipal.getId();
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    // ============ Request DTOs ============

    public static class BorrowRequest {
        private Long bookId;

        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
    }

    public static class ReturnRequest {
        private String notes;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class AdminBorrowRequest {
        private Long userId;
        private Long bookId;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }
    }
}
