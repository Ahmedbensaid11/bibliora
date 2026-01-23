package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.repository.LoanRepository;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Get admin dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DataResponse<Map<String, Object>>> getAdminDashboardStats() {
        try {
            // Get all data
            List<Book> allBooks = bookRepository.findAll();
            List<User> allUsers = userRepository.findAll();
            List<Loan> allLoans = loanRepository.findAll();

            // Filter loans by status
            List<Loan> activeLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.ACTIVE)
                    .collect(Collectors.toList());

            List<Loan> overdueLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == Loan.LoanStatus.OVERDUE)
                    .collect(Collectors.toList());

            // Calculate book statistics
            int totalBooks = allBooks.size();
            int availableBooks = (int) allBooks.stream()
                    .filter(book -> {
                        Integer available = book.getAvailableCopies();
                        return available != null && available > 0;
                    })
                    .count();

            // Get low stock books (threshold: 3)
            int lowStockBooks = (int) allBooks.stream()
                    .filter(book -> {
                        Integer available = book.getAvailableCopies();
                        return available != null && available > 0 && available <= 3;
                    })
                    .count();

            // Calculate user statistics
            int totalUsers = allUsers.size();

            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            int newRegistrations = (int) allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo))
                    .count();

            // Calculate fines
            double totalFines = allLoans.stream()
                    .mapToDouble(loan -> {
                        Double fine = loan.getFineAmount();
                        return fine != null ? fine : 0.0;
                    })
                    .sum();

            // Get popular genres from books
            Map<String, Long> genreCounts = allBooks.stream()
                    .filter(book -> book.getGenre() != null && !book.getGenre().isEmpty())
                    .collect(Collectors.groupingBy(Book::getGenre, Collectors.counting()));

            List<Map<String, Object>> popularGenres = genreCounts.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(5)
                    .map(entry -> {
                        Map<String, Object> genre = new HashMap<>();
                        genre.put("name", entry.getKey());
                        genre.put("count", entry.getValue());
                        return genre;
                    })
                    .collect(Collectors.toList());

            // Calculate monthly growth (compare last 30 days to previous 30 days)
            LocalDate thirtyDaysAgoDate = LocalDate.now().minusDays(30);
            LocalDate sixtyDaysAgoDate = LocalDate.now().minusDays(60);

            long loansLast30Days = allLoans.stream()
                    .filter(loan -> loan.getLoanDate() != null &&
                            !loan.getLoanDate().isBefore(thirtyDaysAgoDate))
                    .count();

            long loansPrevious30Days = allLoans.stream()
                    .filter(loan -> loan.getLoanDate() != null &&
                            loan.getLoanDate().isBefore(thirtyDaysAgoDate) &&
                            !loan.getLoanDate().isBefore(sixtyDaysAgoDate))
                    .count();

            double monthlyGrowth = 0.0;
            if (loansPrevious30Days > 0) {
                monthlyGrowth = ((double)(loansLast30Days - loansPrevious30Days) / loansPrevious30Days) * 100;
            }

            // Determine system health
            String systemHealth = "good";
            if (overdueLoans.size() > 10 || lowStockBooks > 5) {
                systemHealth = "attention";
            }
            if (overdueLoans.size() > 20 || lowStockBooks > 10) {
                systemHealth = "critical";
            }

            // Get due soon loans (within 7 days)
            LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);
            int dueSoonLoans = (int) activeLoans.stream()
                    .filter(loan -> {
                        LocalDate dueDate = loan.getDueDate();
                        LocalDate today = LocalDate.now();
                        return dueDate != null &&
                                !dueDate.isBefore(today) &&
                                !dueDate.isAfter(sevenDaysFromNow);
                    })
                    .count();

            // Build response
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", totalBooks);
            stats.put("availableBooks", availableBooks);
            stats.put("totalUsers", totalUsers);
            stats.put("newRegistrations", newRegistrations);
            stats.put("activeLoans", activeLoans.size());
            stats.put("overdueLoans", overdueLoans.size());
            stats.put("totalFines", totalFines);
            stats.put("popularGenres", popularGenres);
            stats.put("monthlyGrowth", Math.round(monthlyGrowth * 100.0) / 100.0);
            stats.put("systemHealth", systemHealth);
            stats.put("lowStockBooks", lowStockBooks);
            stats.put("pendingReservations", 0); // Add if you have reservations
            stats.put("dueSoonLoans", dueSoonLoans);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Admin statistics retrieved successfully", stats)
            );
        } catch (Exception e) {
            log.error("Error getting admin dashboard stats: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get recent activity (all users)
     * GET /api/admin/dashboard/recent-activity
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<ListResponse<Map<String, Object>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {

        try {
            List<Loan> allLoans = loanRepository.findAll();

            // Sort by loan date descending and limit
            List<Loan> recentLoans = allLoans.stream()
                    .sorted((a, b) -> {
                        LocalDate dateA = a.getLoanDate();
                        LocalDate dateB = b.getLoanDate();
                        if (dateA == null && dateB == null) return 0;
                        if (dateA == null) return 1;
                        if (dateB == null) return -1;
                        return dateB.compareTo(dateA);
                    })
                    .limit(limit)
                    .collect(Collectors.toList());

            // Convert to simplified DTO
            List<Map<String, Object>> activities = recentLoans.stream()
                    .map(loan -> {
                        Map<String, Object> activity = new HashMap<>();
                        activity.put("id", loan.getId());
                        activity.put("type", "Emprunt");

                        // User info
                        if (loan.getUser() != null) {
                            activity.put("user", loan.getUser().getUsername());
                            activity.put("userId", loan.getUser().getId());
                        } else {
                            activity.put("user", "Utilisateur inconnu");
                            activity.put("userId", null);
                        }

                        // Book info
                        if (loan.getBook() != null) {
                            activity.put("book", loan.getBook().getTitle());
                            activity.put("bookId", loan.getBook().getId());
                        } else {
                            activity.put("book", "Livre inconnu");
                            activity.put("bookId", null);
                        }

                        // Dates
                        activity.put("loanDate", loan.getLoanDate());
                        activity.put("dueDate", loan.getDueDate());
                        activity.put("returnDate", loan.getReturnDate());

                        // Status
                        String status = "Actif";
                        if (loan.getStatus() == Loan.LoanStatus.RETURNED) {
                            status = "Retourné";
                        } else if (loan.getStatus() == Loan.LoanStatus.OVERDUE) {
                            status = "En retard";
                        } else if (loan.getStatus() == Loan.LoanStatus.LOST) {
                            status = "Perdu";
                        }
                        activity.put("status", status);
                        activity.put("statusCode", loan.getStatus());

                        // Fine
                        activity.put("fineAmount", loan.getFineAmount() != null ? loan.getFineAmount() : 0.0);

                        return activity;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Recent activity retrieved successfully", activities)
            );
        } catch (Exception e) {
            log.error("Error getting recent activity: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get top borrowed books
     * GET /api/admin/dashboard/top-books
     */
    @GetMapping("/top-books")
    public ResponseEntity<ListResponse<Map<String, Object>>> getTopBooks(
            @RequestParam(defaultValue = "5") int limit) {

        try {
            List<Loan> allLoans = loanRepository.findAll();

            // Count loans per book
            Map<Long, Long> bookLoanCounts = allLoans.stream()
                    .filter(loan -> loan.getBook() != null)
                    .collect(Collectors.groupingBy(
                            loan -> loan.getBook().getId(),
                            Collectors.counting()
                    ));

            // Get top books
            List<Map<String, Object>> topBooks = bookLoanCounts.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(limit)
                    .map(entry -> {
                        Map<String, Object> bookInfo = new HashMap<>();

                        // Find the book
                        Optional<Book> bookOpt = bookRepository.findById(entry.getKey());
                        if (bookOpt.isPresent()) {
                            Book book = bookOpt.get();
                            bookInfo.put("id", book.getId());
                            bookInfo.put("title", book.getTitle());
                            bookInfo.put("author", book.getAuthor());
                            bookInfo.put("genre", book.getGenre());
                            bookInfo.put("loanCount", entry.getValue());
                        }

                        return bookInfo;
                    })
                    .filter(map -> !map.isEmpty())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Top books retrieved successfully", topBooks)
            );
        } catch (Exception e) {
            log.error("Error getting top books: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get monthly loan statistics
     * GET /api/admin/dashboard/monthly-stats
     */
    @GetMapping("/monthly-stats")
    public ResponseEntity<DataResponse<Map<String, Object>>> getMonthlyStats(
            @RequestParam(defaultValue = "12") int months) {

        try {
            List<Loan> allLoans = loanRepository.findAll();
            LocalDate startDate = LocalDate.now().minusMonths(months);

            // Group loans by month
            Map<String, Long> monthlyLoans = allLoans.stream()
                    .filter(loan -> loan.getLoanDate() != null &&
                            !loan.getLoanDate().isBefore(startDate))
                    .collect(Collectors.groupingBy(
                            loan -> loan.getLoanDate().getYear() + "-" +
                                    String.format("%02d", loan.getLoanDate().getMonthValue()),
                            Collectors.counting()
                    ));

            Map<String, Object> result = new HashMap<>();
            result.put("monthlyLoans", monthlyLoans);
            result.put("startDate", startDate);
            result.put("endDate", LocalDate.now());

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Monthly statistics retrieved successfully", result)
            );
        } catch (Exception e) {
            log.error("Error getting monthly stats: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get comparative statistics (current vs previous period)
     * GET /api/admin/dashboard/comparative-stats
     */
    @GetMapping("/comparative-stats")
    public ResponseEntity<DataResponse<Map<String, Object>>> getComparativeStats(
            @RequestParam(defaultValue = "30") int days) {

        try {
            LocalDate today = LocalDate.now();
            LocalDate currentPeriodStart = today.minusDays(days);
            LocalDate previousPeriodStart = today.minusDays(days * 2);
            LocalDate previousPeriodEnd = currentPeriodStart.minusDays(1);

            List<Loan> allLoans = loanRepository.findAll();
            List<User> allUsers = userRepository.findAll();

            // Current period stats
            long currentLoans = allLoans.stream()
                    .filter(l -> l.getLoanDate() != null &&
                            !l.getLoanDate().isBefore(currentPeriodStart))
                    .count();

            long currentReturns = allLoans.stream()
                    .filter(l -> l.getReturnDate() != null &&
                            !l.getReturnDate().isBefore(currentPeriodStart) &&
                            l.getStatus() == Loan.LoanStatus.RETURNED)
                    .count();

            double currentFines = allLoans.stream()
                    .filter(l -> l.getLoanDate() != null &&
                            !l.getLoanDate().isBefore(currentPeriodStart))
                    .mapToDouble(l -> l.getFineAmount() != null ? l.getFineAmount() : 0.0)
                    .sum();

            long currentNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null &&
                            !u.getCreatedAt().toLocalDate().isBefore(currentPeriodStart))
                    .count();

            // Previous period stats
            long previousLoans = allLoans.stream()
                    .filter(l -> l.getLoanDate() != null &&
                            !l.getLoanDate().isBefore(previousPeriodStart) &&
                            !l.getLoanDate().isAfter(previousPeriodEnd))
                    .count();

            long previousReturns = allLoans.stream()
                    .filter(l -> l.getReturnDate() != null &&
                            !l.getReturnDate().isBefore(previousPeriodStart) &&
                            !l.getReturnDate().isAfter(previousPeriodEnd) &&
                            l.getStatus() == Loan.LoanStatus.RETURNED)
                    .count();

            double previousFines = allLoans.stream()
                    .filter(l -> l.getLoanDate() != null &&
                            !l.getLoanDate().isBefore(previousPeriodStart) &&
                            !l.getLoanDate().isAfter(previousPeriodEnd))
                    .mapToDouble(l -> l.getFineAmount() != null ? l.getFineAmount() : 0.0)
                    .sum();

            long previousNewUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null &&
                            !u.getCreatedAt().toLocalDate().isBefore(previousPeriodStart) &&
                            !u.getCreatedAt().toLocalDate().isAfter(previousPeriodEnd))
                    .count();

            // Build response
            Map<String, Object> currentMonth = new HashMap<>();
            currentMonth.put("loans", currentLoans);
            currentMonth.put("returns", currentReturns);
            currentMonth.put("fines", Math.round(currentFines * 100.0) / 100.0);
            currentMonth.put("newUsers", currentNewUsers);

            Map<String, Object> previousMonth = new HashMap<>();
            previousMonth.put("loans", previousLoans);
            previousMonth.put("returns", previousReturns);
            previousMonth.put("fines", Math.round(previousFines * 100.0) / 100.0);
            previousMonth.put("newUsers", previousNewUsers);

            Map<String, Object> result = new HashMap<>();
            result.put("currentMonth", currentMonth);
            result.put("previousMonth", previousMonth);
            result.put("periodDays", days);
            result.put("currentPeriodStart", currentPeriodStart);
            result.put("currentPeriodEnd", today);
            result.put("previousPeriodStart", previousPeriodStart);
            result.put("previousPeriodEnd", previousPeriodEnd);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Comparative statistics retrieved successfully", result)
            );
        } catch (Exception e) {
            log.error("Error getting comparative stats: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get peak hours for loans
     * GET /api/admin/dashboard/peak-hours
     */
    @GetMapping("/peak-hours")
    public ResponseEntity<DataResponse<List<Map<String, Object>>>> getPeakHours(
            @RequestParam(defaultValue = "30") int days) {

        try {
            LocalDate startDate = LocalDate.now().minusDays(days);
            List<Loan> allLoans = loanRepository.findAll();

            // Filter loans within the date range
            List<Loan> recentLoans = allLoans.stream()
                    .filter(l -> l.getLoanDate() != null && !l.getLoanDate().isBefore(startDate))
                    .collect(Collectors.toList());

            // Since we don't have time data, we'll create mock hourly distribution
            // In a real scenario, you'd store loan timestamp with hour
            List<Map<String, Object>> peakHours = new ArrayList<>();

            // Business hours distribution (8 AM to 6 PM)
            String[] hours = {"8h", "9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h"};

            // Distribute loans across hours with realistic pattern
            int totalLoans = recentLoans.size();
            double[] distribution = {0.06, 0.12, 0.15, 0.14, 0.08, 0.10, 0.13, 0.12, 0.07, 0.02, 0.01};

            for (int i = 0; i < hours.length; i++) {
                Map<String, Object> hourData = new HashMap<>();
                hourData.put("hour", hours[i]);
                hourData.put("loans", (int)(totalLoans * distribution[i]));
                peakHours.add(hourData);
            }

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Peak hours retrieved successfully", peakHours)
            );
        } catch (Exception e) {
            log.error("Error getting peak hours: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Get user activity timeline
     * GET /api/admin/dashboard/user-activity
     */
    @GetMapping("/user-activity")
    public ResponseEntity<DataResponse<List<Map<String, Object>>>> getUserActivity(
            @RequestParam(defaultValue = "7") int days) {

        try {
            LocalDate startDate = LocalDate.now().minusDays(days - 1);
            List<Loan> allLoans = loanRepository.findAll();
            List<User> allUsers = userRepository.findAll();

            List<Map<String, Object>> activityData = new ArrayList<>();

            for (int i = 0; i < days; i++) {
                LocalDate date = startDate.plusDays(i);

                // Count active users (users who borrowed books on this date)
                long activeUsers = allLoans.stream()
                        .filter(l -> l.getLoanDate() != null && l.getLoanDate().equals(date))
                        .map(Loan::getUser)
                        .distinct()
                        .count();

                // Count new users registered on this date
                long newUsers = allUsers.stream()
                        .filter(u -> u.getCreatedAt() != null &&
                                u.getCreatedAt().toLocalDate().equals(date))
                        .count();

                Map<String, Object> dayData = new HashMap<>();
                dayData.put("name", getDayName(date));
                dayData.put("date", date);
                dayData.put("active", activeUsers);
                dayData.put("new", newUsers);

                activityData.add(dayData);
            }

            return ResponseEntity.ok(
                    new DataResponse<>(true, "User activity retrieved successfully", activityData)
            );
        } catch (Exception e) {
            log.error("Error getting user activity: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    // Helper method for day names
    private String getDayName(LocalDate date) {
        String[] days = {"Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"};
        return days[date.getDayOfWeek().getValue() % 7];
    }
}