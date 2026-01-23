package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ReadingProgressDTO;
import com.bibliotheque.gestion.dto.ReadingChallengeDTO;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.LoanRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reading")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReadingProgressController {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    /**
     * Get user's reading progress for current year
     */
    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getReadingProgress(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        try {
            Long userId = currentUser.getId();
            int currentYear = Year.now().getValue();

            // Get user's reading goal (default: 12 books/year = 1 book/month)
            Optional<User> userOpt = userRepository.findById(userId);
            int readingGoal = userOpt.map(User::getReadingGoal).orElse(12);

            // Count returned books for current year
            Long booksReadThisYear = loanRepository.countReturnedBooksByUserAndYear(userId, currentYear);

            // Count returned books for current month
            Long booksReadThisMonth = loanRepository.countReturnedBooksByUserAndMonth(userId,
                    LocalDate.now().getYear(), LocalDate.now().getMonthValue());

            // Calculate progress percentage
            int progressPercentage = readingGoal > 0 ?
                    Math.min((int) ((booksReadThisYear * 100) / readingGoal), 100) : 0;

            // Get reading statistics by month
            Map<String, Long> monthlyStats = getMonthlyReadingStats(userId, currentYear);

            // Get genres distribution
            Map<String, Long> genreStats = getGenreStats(userId, currentYear);

            // Calculate average books per month
            int currentMonth = LocalDate.now().getMonthValue();
            double averageBooksPerMonth = currentMonth > 0 ?
                    (double) booksReadThisYear / currentMonth : 0;

            // Create progress DTO
            ReadingProgressDTO progress = ReadingProgressDTO.builder()
                    .goal(readingGoal)
                    .booksReadThisYear(booksReadThisYear.intValue())
                    .booksReadThisMonth(booksReadThisMonth.intValue())
                    .progressPercentage(progressPercentage)
                    .booksRemaining(Math.max(readingGoal - booksReadThisYear.intValue(), 0))
                    .averageBooksPerMonth(averageBooksPerMonth)
                    .monthlyStats(monthlyStats)
                    .genreStats(genreStats)
                    .currentStreak(getCurrentReadingStreak(userId))
                    .longestStreak(getLongestReadingStreak(userId))
                    .recommendation(generateRecommendation(booksReadThisYear.intValue(),
                            readingGoal, currentMonth))
                    .build();

            // Return simple Map instead of DashboardResponse to avoid serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Progrès de lecture récupéré");
            response.put("data", Map.of("progress", progress));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Set or update user's reading goal
     */
    @PutMapping("/goal")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> setReadingGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Integer> request) {

        try {
            Integer goal = request.get("goal");
            if (goal == null || goal < 1 || goal > 100) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Objectif invalide. Doit être entre 1 et 100 livres");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Optional<User> userOpt = userRepository.findById(currentUser.getId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setReadingGoal(goal);
                userRepository.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Objectif de lecture mis à jour: " + goal + " livres/an");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Utilisateur non trouvé");
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get reading challenge with achievements
     */
    @GetMapping("/challenge")
    @PreAuthorize("hasAnyRole('LECTEUR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getReadingChallenge(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        try {
            Long userId = currentUser.getId();
            int currentYear = Year.now().getValue();

            // Get reading goal
            Optional<User> userOpt = userRepository.findById(userId);
            int readingGoal = userOpt.map(User::getReadingGoal).orElse(12);

            // Count returned books this year
            Long booksRead = loanRepository.countReturnedBooksByUserAndYear(userId, currentYear);

            // Create milestones (every 25% of goal)
            List<ReadingChallengeDTO.Milestone> milestones = List.of(
                    ReadingChallengeDTO.Milestone.builder()
                            .percentage(25)
                            .booksRequired((int) Math.ceil(readingGoal * 0.25))
                            .achieved(booksRead >= readingGoal * 0.25)
                            .title("Débutant Lecteur")
                            .description("25% de votre objectif atteint!")
                            .build(),
                    ReadingChallengeDTO.Milestone.builder()
                            .percentage(50)
                            .booksRequired((int) Math.ceil(readingGoal * 0.5))
                            .achieved(booksRead >= readingGoal * 0.5)
                            .title("Lecteur Passionné")
                            .description("La moitié du chemin parcouru!")
                            .build(),
                    ReadingChallengeDTO.Milestone.builder()
                            .percentage(75)
                            .booksRequired((int) Math.ceil(readingGoal * 0.75))
                            .achieved(booksRead >= readingGoal * 0.75)
                            .title("Lecteur Avancé")
                            .description("Plus que quelques livres!")
                            .build(),
                    ReadingChallengeDTO.Milestone.builder()
                            .percentage(100)
                            .booksRequired(readingGoal)
                            .achieved(booksRead >= readingGoal)
                            .title("Expert Lecteur")
                            .description("Objectif annuel atteint! Bravo!")
                            .build()
            );

            // Calculate time-based achievements
            boolean readEveryMonth = hasReadEveryMonth(userId, currentYear);
            boolean diverseGenres = hasDiverseGenres(userId, currentYear);
            boolean consistentReader = isConsistentReader(userId);

            ReadingChallengeDTO challenge = ReadingChallengeDTO.builder()
                    .year(currentYear)
                    .goal(readingGoal)
                    .currentCount(booksRead.intValue())
                    .progressPercentage(Math.min((int) ((booksRead * 100) / readingGoal), 100))
                    .milestones(milestones)
                    .achievements(Map.of(
                            "readEveryMonth", readEveryMonth,
                            "diverseGenres", diverseGenres,
                            "consistentReader", consistentReader,
                            "firstBook", booksRead >= 1
                    ))
                    .estimatedCompletion(getEstimatedCompletionDate(userId, readingGoal, booksRead.intValue()))
                    .build();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Défi de lecture récupéré");
            response.put("data", Map.of("challenge", challenge));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Helper methods
    private Map<String, Long> getMonthlyReadingStats(Long userId, int year) {
        Map<String, Long> stats = new HashMap<>();
        for (int month = 1; month <= 12; month++) {
            Long count = loanRepository.countReturnedBooksByUserAndMonth(userId, year, month);
            stats.put(String.valueOf(month), count);
        }
        return stats;
    }

    private Map<String, Long> getGenreStats(Long userId, int year) {
        try {
            return loanRepository.getGenreStatsByUserAndYear(userId, year);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private int getCurrentReadingStreak(Long userId) {
        try {
            return loanRepository.getCurrentReadingStreak(userId);
        } catch (Exception e) {
            return 0;
        }
    }

    private int getLongestReadingStreak(Long userId) {
        try {
            return loanRepository.getLongestReadingStreak(userId);
        } catch (Exception e) {
            return 0;
        }
    }

    private boolean hasReadEveryMonth(Long userId, int year) {
        for (int month = 1; month <= LocalDate.now().getMonthValue(); month++) {
            Long count = loanRepository.countReturnedBooksByUserAndMonth(userId, year, month);
            if (count == 0) return false;
        }
        return true;
    }

    private boolean hasDiverseGenres(Long userId, int year) {
        Map<String, Long> genreStats = getGenreStats(userId, year);
        return genreStats.size() >= 3;
    }

    private boolean isConsistentReader(Long userId) {
        int streak = getCurrentReadingStreak(userId);
        return streak >= 30;
    }

    private LocalDate getEstimatedCompletionDate(Long userId, int goal, int current) {
        if (current >= goal) return LocalDate.now();

        try {
            double booksPerMonth = loanRepository.getAverageBooksPerMonth(userId, Year.now().getValue());
            if (booksPerMonth <= 0) booksPerMonth = 1.0;

            int booksRemaining = goal - current;
            int monthsRemaining = (int) Math.ceil(booksRemaining / booksPerMonth);

            return LocalDate.now().plusMonths(monthsRemaining);
        } catch (Exception e) {
            return LocalDate.now().plusMonths(12);
        }
    }

    private String generateRecommendation(int booksRead, int goal, int currentMonth) {
        if (booksRead >= goal) {
            return "Bravo! Vous avez atteint votre objectif. Pensez à augmenter votre défi!";
        }

        int booksRemaining = goal - booksRead;
        int monthsRemaining = 12 - currentMonth + 1;
        double booksPerMonth = (double) booksRemaining / monthsRemaining;

        if (booksPerMonth <= 1) {
            return "Vous êtes sur la bonne voie! Continuez à lire régulièrement.";
        } else if (booksPerMonth <= 2) {
            return String.format("Il vous reste %d livres. Essayez de lire %.1f livre(s) par mois.",
                    booksRemaining, booksPerMonth);
        } else {
            return String.format("Défi ambitieux! Il vous faut lire %.1f livres par mois pour atteindre l'objectif.",
                    booksPerMonth);
        }
    }
}