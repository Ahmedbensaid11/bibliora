package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.DashboardStatsDTO;
import com.bibliotheque.gestion.dto.DashboardResponse;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.security.UserPrincipal;
import com.bibliotheque.gestion.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final LoanService loanService;

    /**
     * Get dashboard statistics for lecteur
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        try {
            // Get user's loans
            List<Loan> userLoans = loanService.getUserLoans(currentUser.getId());

            // Calculate statistics
            long totalLoans = userLoans.size();
            long activeLoans = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.ACTIVE)
                    .count();
            long overdueLoans = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.OVERDUE)
                    .count();
            long returnedLoans = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.RETURNED)
                    .count();

            // Calculate fines
            double totalFines = userLoans.stream()
                    .mapToDouble(loan -> loan.getFineAmount() != null ? loan.getFineAmount() : 0.0)
                    .sum();

            // Calculate reading progress (simple: based on returned books)
            // You can adjust this logic as needed
            int readingGoal = 50; // Default goal
            int readingProgress = Math.min((int) ((returnedLoans * 100) / readingGoal), 100);

            // Get due soon loans (within 3 days)
            long dueSoonLoans = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.ACTIVE)
                    .filter(loan -> {
                        LocalDate dueDate = loan.getDueDate();
                        LocalDate today = LocalDate.now();
                        return dueDate.isAfter(today) &&
                                dueDate.isBefore(today.plusDays(4)); // Within 3 days
                    })
                    .count();

            // Get next due loan
            Loan nextDueLoan = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.ACTIVE)
                    .filter(loan -> loan.getDueDate().isAfter(LocalDate.now()))
                    .sorted((a, b) -> a.getDueDate().compareTo(b.getDueDate()))
                    .findFirst()
                    .orElse(null);

            // Create stats DTO
            DashboardStatsDTO stats = DashboardStatsDTO.builder()
                    .totalLoans(totalLoans)
                    .activeLoans(activeLoans)
                    .overdueLoans(overdueLoans)
                    .returnedLoans(returnedLoans)
                    .totalFines(totalFines)
                    .readingGoal(readingGoal)
                    .readingProgress(readingProgress)
                    .dueSoonLoans(dueSoonLoans)
                    .build();

            // Add next due book info if available
            if (nextDueLoan != null && nextDueLoan.getBook() != null) {
                stats.setNextDueBookTitle(nextDueLoan.getBook().getTitle());
                stats.setNextDueDate(nextDueLoan.getDueDate());
            }

            DashboardResponse response = DashboardResponse.builder()
                    .success(true)
                    .message("Statistiques récupérées avec succès")
                    .stats(stats)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            DashboardResponse response = DashboardResponse.builder()
                    .success(false)
                    .message("Erreur lors de la récupération des statistiques: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get loans due soon (within X days)
     */
    @GetMapping("/due-soon")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getDueSoonLoans(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "3") int days) {

        try {
            List<Loan> userLoans = loanService.getUserLoans(currentUser.getId());

            List<Loan> dueSoonLoans = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.ACTIVE)
                    .filter(loan -> {
                        LocalDate dueDate = loan.getDueDate();
                        LocalDate today = LocalDate.now();
                        LocalDate thresholdDate = today.plusDays(days + 1); // +1 to include the day itself
                        return !dueDate.isBefore(today) && dueDate.isBefore(thresholdDate);
                    })
                    .collect(Collectors.toList());

            DashboardResponse response = DashboardResponse.builder()
                    .success(true)
                    .message("Emprunts à retourner bientôt récupérés")
                    .items(dueSoonLoans)
                    .totalItems(dueSoonLoans.size())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            DashboardResponse response = DashboardResponse.builder()
                    .success(false)
                    .message("Erreur: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get recent activity (last N loans)
     */
    @GetMapping("/recent-activity")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getRecentActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "5") int limit) {

        try {
            List<Loan> userLoans = loanService.getUserLoans(currentUser.getId());

            // Get most recent loans
            List<Loan> recentLoans = userLoans.stream()
                    .sorted((a, b) -> b.getLoanDate().compareTo(a.getLoanDate())) // Most recent first
                    .limit(limit)
                    .collect(Collectors.toList());

            DashboardResponse response = DashboardResponse.builder()
                    .success(true)
                    .message("Activité récente récupérée")
                    .items(recentLoans)
                    .totalItems(recentLoans.size())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            DashboardResponse response = DashboardResponse.builder()
                    .success(false)
                    .message("Erreur: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get favorite genres based on loan history
     */
    @GetMapping("/favorite-genres")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getFavoriteGenres(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        try {
            List<Loan> userLoans = loanService.getUserLoans(currentUser.getId());

            // Count genres from returned loans
            Map<String, Long> genreCounts = userLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.RETURNED)
                    .filter(loan -> loan.getBook() != null && loan.getBook().getGenre() != null)
                    .collect(Collectors.groupingBy(
                            loan -> loan.getBook().getGenre(),
                            Collectors.counting()
                    ));

            // Get top 3 genres
            List<Map<String, Object>> topGenres = genreCounts.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(3)
                    .map(entry -> {
                        Map<String, Object> genreInfo = new HashMap<>();
                        genreInfo.put("genre", entry.getKey());
                        genreInfo.put("count", entry.getValue());
                        return genreInfo;
                    })
                    .collect(Collectors.toList());

            DashboardResponse response = DashboardResponse.builder()
                    .success(true)
                    .message("Genres préférés récupérés")
                    .data(Map.of("favoriteGenres", topGenres))
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            DashboardResponse response = DashboardResponse.builder()
                    .success(false)
                    .message("Erreur: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }
}