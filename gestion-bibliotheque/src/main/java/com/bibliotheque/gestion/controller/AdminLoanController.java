package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.LoanStatus;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.repository.LoanRepository;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.repository.BookRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/loans")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLoanController {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final com.bibliotheque.gestion.service.LoanService loanService;

    /**
     * Get all loans with pagination and filters
     * GET /api/admin/loans
     */
    @GetMapping
    public ResponseEntity<ListResponse<AdminLoanDTO>> getAllLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) String dateFilter) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Loan> loanPage;

            if (search != null && !search.isEmpty()) {
                loanPage = loanRepository.searchLoans(search, pageable);
            } else if (userId != null) {
                loanPage = loanRepository.findByUserId(userId, pageable);
            } else if (bookId != null) {
                loanPage = loanRepository.findByBookId(bookId, pageable);
            } else if (status != null && !status.isEmpty()) {
                LoanStatus loanStatus = LoanStatus.valueOf(status.toUpperCase());
                loanPage = loanRepository.findByStatus(loanStatus, pageable);
            } else {
                loanPage = loanRepository.findAll(pageable);
            }

            // Apply additional date filters
            List<Loan> filteredLoans = loanPage.getContent();

            if (dateFilter != null && !dateFilter.isEmpty()) {
                LocalDate today = LocalDate.now();
                filteredLoans = filteredLoans.stream().filter(loan -> {
                    LocalDate dueDate = loan.getDueDate();

                    if (dueDate == null) return false;

                    switch (dateFilter.toLowerCase()) {
                        case "today":
                            return dueDate.isEqual(today);
                        case "tomorrow":
                            return dueDate.isEqual(today.plusDays(1));
                        case "thisweek":
                            LocalDate endOfWeek = today.plusDays(7);
                            return !dueDate.isBefore(today) &&
                                    !dueDate.isAfter(endOfWeek);
                        case "overdue":
                            return dueDate.isBefore(today) &&
                                    loan.getStatus() == LoanStatus.ACTIVE;
                        default:
                            return true;
                    }
                }).collect(Collectors.toList());
            }

            List<AdminLoanDTO> loanDTOs = filteredLoans.stream()
                    .map(this::convertToAdminDTO)
                    .collect(Collectors.toList());

            ListResponse<AdminLoanDTO> response = new ListResponse<>(
                    true,
                    "Loans retrieved successfully",
                    loanDTOs
            );
            response.setTotalElements(loanDTOs.size());
            response.setCurrentPage(page);
            response.setPageSize(size);
            response.setTotalPages(loanPage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting loans: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get loan statistics
     * GET /api/admin/loans/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<DataResponse<Map<String, Object>>> getLoanStatistics() {
        try {
            List<Loan> allLoans = loanRepository.findAll();
            LocalDate today = LocalDate.now();

            long totalLoans = allLoans.size();
            long activeLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.ACTIVE)
                    .count();

            long overdueLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.ACTIVE &&
                            loan.getDueDate().isBefore(today))
                    .count();

            long returnedLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.RETURNED)
                    .count();

            long todayReturns = allLoans.stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.ACTIVE &&
                            loan.getDueDate().isEqual(today))
                    .count();

            double totalFines = allLoans.stream()
                    .mapToDouble(loan -> loan.getLateFee() != null ? loan.getLateFee().doubleValue() : 0.0)
                    .sum();

            long completedLoans = allLoans.stream()
                    .filter(loan -> loan.getStatus() == LoanStatus.RETURNED ||
                            loan.getStatus() == LoanStatus.CANCELLED)
                    .count();
            double returnRate = totalLoans > 0 ? ((double) completedLoans / totalLoans) * 100 : 0;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalLoans", totalLoans);
            stats.put("activeLoans", activeLoans);
            stats.put("overdueLoans", overdueLoans);
            stats.put("returnedLoans", returnedLoans);
            stats.put("todayReturns", todayReturns);
            stats.put("totalLateFees", totalFines);
            stats.put("returnRate", Math.round(returnRate));

            // Get top borrowers
            Map<String, Long> topBorrowers = allLoans.stream()
                    .filter(loan -> loan.getUser() != null)
                    .collect(Collectors.groupingBy(
                            loan -> {
                                String firstName = loan.getUser().getFirstName();
                                String lastName = loan.getUser().getLastName();
                                return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
                            },
                            Collectors.counting()
                    ))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            Map.Entry::getValue,
                            (e1, e2) -> e1,
                            LinkedHashMap::new
                    ));

            stats.put("topBorrowers", topBorrowers);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Loan statistics retrieved successfully", stats)
            );
        } catch (Exception e) {
            log.error("Error getting loan statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Create new loan (admin only)
     * POST /api/admin/loans
     */
    @PostMapping
    public ResponseEntity<DataResponse<AdminLoanDTO>> createLoan(@RequestBody CreateAdminLoanRequest request) {
        try {
            if (request.getUserId() == null) {
                throw new RuntimeException("User ID is required");
            }
            if (request.getBookId() == null) {
                throw new RuntimeException("Book ID is required");
            }

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

            Book book = bookRepository.findById(request.getBookId())
                    .orElseThrow(() -> new RuntimeException("Book not found with id: " + request.getBookId()));

            if (book.getAvailableCopies() <= 0) {
                throw new RuntimeException("Book is not available for loan");
            }

            Loan loan = new Loan();
            loan.setUser(user);
            loan.setBook(book);
            loan.setBorrowDate(LocalDate.now());

            if (request.getDueDate() != null) {
                loan.setDueDate(request.getDueDate());
            } else {
                loan.setDueDate(LocalDate.now().plusDays(14));
            }

            loan.setStatus(LoanStatus.ACTIVE);
            loan.setNotes(request.getNotes());

            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.save(book);

            Loan savedLoan = loanRepository.save(loan);
            AdminLoanDTO loanDTO = convertToAdminDTO(savedLoan);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Loan created successfully", loanDTO));
        } catch (Exception e) {
            log.error("Error creating loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Mark loan as returned
     * PUT /api/admin/loans/{id}/return
     */
    @PutMapping("/{id}/return")
    public ResponseEntity<DataResponse<AdminLoanDTO>> returnLoan(
            @PathVariable Long id,
            @RequestBody(required = false) ReturnLoanAdminRequest request) {

        try {
            Loan loan = loanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));

            if (loan.getStatus() != LoanStatus.ACTIVE && loan.getStatus() != LoanStatus.OVERDUE) {
                throw new RuntimeException("Loan is not active");
            }

            loan.setReturnDate(LocalDate.now());
            loan.setStatus(LoanStatus.RETURNED);

            // Calculate fine if overdue
            LocalDate today = LocalDate.now();
            if (loan.getDueDate().isBefore(today)) {
                long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), today);
                BigDecimal fine = BigDecimal.valueOf(daysLate * 0.5);
                loan.setLateFee(fine);

                if (request != null) {
                    String fineInfo = request.isFinePaid() ? "Fine paid: " + fine : "Fine unpaid: " + fine;
                    String notes = (loan.getNotes() != null ? loan.getNotes() + "\n" : "") + fineInfo;
                    loan.setNotes(notes);
                }
            }

            if (request != null) {
                if (request.getCondition() != null) {
                    String notes = (loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                            "Condition on return: " + request.getCondition();
                    loan.setNotes(notes);
                }
                if (request.getNotes() != null) {
                    String notes = (loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                            "Return notes: " + request.getNotes();
                    loan.setNotes(notes);
                }
            }

            // Return book copy
            Book book = loan.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);

            Loan updatedLoan = loanRepository.save(loan);
            AdminLoanDTO loanDTO = convertToAdminDTO(updatedLoan);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Loan returned successfully", loanDTO)
            );
        } catch (Exception e) {
            log.error("Error returning loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Extend loan due date
     * PUT /api/admin/loans/{id}/extend
     */
    @PutMapping("/{id}/extend")
    public ResponseEntity<DataResponse<AdminLoanDTO>> extendLoan(
            @PathVariable Long id,
            @RequestBody ExtendLoanRequest request) {

        try {
            Loan loan = loanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));

            if (loan.getStatus() != LoanStatus.ACTIVE && loan.getStatus() != LoanStatus.OVERDUE) {
                throw new RuntimeException("Loan is not active");
            }

            if (request.getNewDueDate() != null) {
                loan.setDueDate(request.getNewDueDate());
            } else {
                loan.setDueDate(loan.getDueDate().plusDays(7));
            }

            if (request.getReason() != null) {
                String notes = (loan.getNotes() != null ? loan.getNotes() + "\n" : "") +
                        "Extended: " + request.getReason();
                loan.setNotes(notes);
            }

            // Reset to active if was overdue
            if (loan.getStatus() == LoanStatus.OVERDUE && !loan.getDueDate().isBefore(LocalDate.now())) {
                loan.setStatus(LoanStatus.ACTIVE);
            }

            Loan updatedLoan = loanRepository.save(loan);
            AdminLoanDTO loanDTO = convertToAdminDTO(updatedLoan);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Loan extended successfully", loanDTO)
            );
        } catch (Exception e) {
            log.error("Error extending loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Activate a pending delivery loan
     * PUT /api/admin/loans/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<DataResponse<AdminLoanDTO>> activateLoan(@PathVariable Long id) {
        try {
            Loan activatedLoan = loanService.activateLoan(id);
            AdminLoanDTO loanDTO = convertToAdminDTO(activatedLoan);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Loan activated successfully", loanDTO)
            );
        } catch (Exception e) {
            log.error("Error activating loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Delete loan
     * DELETE /api/admin/loans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteLoan(@PathVariable Long id) {
        try {
            Loan loan = loanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));

            if (loan.getStatus() == LoanStatus.ACTIVE || loan.getStatus() == LoanStatus.OVERDUE) {
                Book book = loan.getBook();
                book.setAvailableCopies(book.getAvailableCopies() + 1);
                bookRepository.save(book);
            }

            loanRepository.delete(loan);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Loan deleted successfully")
            );
        } catch (Exception e) {
            log.error("Error deleting loan: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Get all active users for dropdown
     * GET /api/admin/loans/users
     */
    @GetMapping("/users")
    public ResponseEntity<ListResponse<UserDTO>> getActiveUsers() {
        try {
            List<User> users = userRepository.findByEnabledTrue();
            List<UserDTO> userDTOs = users.stream()
                    .map(this::convertUserToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Active users retrieved successfully", userDTOs)
            );
        } catch (Exception e) {
            log.error("Error getting users: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get all available books for dropdown
     * GET /api/admin/loans/books/available
     */
    @GetMapping("/books/available")
    public ResponseEntity<ListResponse<BookDTO>> getAvailableBooks() {
        try {
            List<Book> books = bookRepository.findAvailableBooks();
            List<BookDTO> bookDTOs = books.stream()
                    .map(this::convertBookToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Available books retrieved successfully", bookDTOs)
            );
        } catch (Exception e) {
            log.error("Error getting available books: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get loan activity timeline
     * GET /api/admin/loans/activity-timeline
     */
    @GetMapping("/activity-timeline")
    public ResponseEntity<DataResponse<List<Map<String, Object>>>> getLoanActivityTimeline(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "daily") String groupBy) {

        try {
            LocalDate startDate = LocalDate.now().minusDays(days - 1);
            List<Loan> allLoans = loanRepository.findAll();

            List<Map<String, Object>> timeline = new ArrayList<>();

            if ("daily".equalsIgnoreCase(groupBy)) {
                for (int i = 0; i < days; i++) {
                    LocalDate date = startDate.plusDays(i);

                    long loansOnDate = allLoans.stream()
                            .filter(l -> l.getBorrowDate() != null && l.getBorrowDate().equals(date))
                            .count();

                    long returnsOnDate = allLoans.stream()
                            .filter(l -> l.getReturnDate() != null &&
                                    l.getReturnDate().equals(date) &&
                                    l.getStatus() == LoanStatus.RETURNED)
                            .count();

                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", date);
                    dayData.put("label", date.toString());
                    dayData.put("loans", loansOnDate);
                    dayData.put("returns", returnsOnDate);

                    timeline.add(dayData);
                }
            } else {
                int weeks = days / 7;
                for (int i = 0; i < weeks; i++) {
                    LocalDate weekStart = startDate.plusWeeks(i);
                    LocalDate weekEnd = weekStart.plusDays(6);

                    final LocalDate finalWeekStart = weekStart;
                    final LocalDate finalWeekEnd = weekEnd;

                    long loansInWeek = allLoans.stream()
                            .filter(l -> l.getBorrowDate() != null &&
                                    !l.getBorrowDate().isBefore(finalWeekStart) &&
                                    !l.getBorrowDate().isAfter(finalWeekEnd))
                            .count();

                    long returnsInWeek = allLoans.stream()
                            .filter(l -> l.getReturnDate() != null &&
                                    !l.getReturnDate().isBefore(finalWeekStart) &&
                                    !l.getReturnDate().isAfter(finalWeekEnd) &&
                                    l.getStatus() == LoanStatus.RETURNED)
                            .count();

                    Map<String, Object> weekData = new HashMap<>();
                    weekData.put("weekStart", weekStart);
                    weekData.put("weekEnd", weekEnd);
                    weekData.put("label", "Semaine " + (i + 1));
                    weekData.put("loans", loansInWeek);
                    weekData.put("returns", returnsInWeek);

                    timeline.add(weekData);
                }
            }

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Loan activity timeline retrieved successfully", timeline)
            );
        } catch (Exception e) {
            log.error("Error getting loan activity timeline: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    // Helper methods for conversion
    private AdminLoanDTO convertToAdminDTO(Loan loan) {
        AdminLoanDTO dto = new AdminLoanDTO();
        dto.setId(loan.getId());
        dto.setUserId(loan.getUser().getId());
        dto.setUserFirstName(loan.getUser().getFirstName());
        dto.setUserLastName(loan.getUser().getLastName());
        dto.setUserEmail(loan.getUser().getEmail());
        dto.setBookId(loan.getBook().getId());
        dto.setBookTitle(loan.getBook().getTitle());
        dto.setBookAuthor(loan.getBook().getAuthor());
        dto.setBookIsbn(loan.getBook().getIsbn());
        dto.setLoanDate(loan.getBorrowDate());
        dto.setDueDate(loan.getDueDate());
        dto.setReturnDate(loan.getReturnDate());
        dto.setStatus(loan.getStatus().name());
        dto.setFineAmount(loan.getLateFee() != null ? loan.getLateFee().doubleValue() : 0.0);
        dto.setFinePaid(loan.getLateFee() != null && loan.getLateFee().doubleValue() > 0);
        dto.setNotes(loan.getNotes());

        dto.setOverdue(loan.getStatus() == LoanStatus.ACTIVE &&
                loan.getDueDate().isBefore(LocalDate.now()));

        return dto;
    }

    private UserDTO convertUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEnabled(user.isEnabled());
        return dto;
    }

    private BookDTO convertBookToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setTotalCopies(book.getTotalCopies());
        return dto;
    }

    // ==================== DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminLoanDTO {
        private Long id;
        private Long userId;
        private String userFirstName;
        private String userLastName;
        private String userEmail;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String bookIsbn;
        private LocalDate loanDate;
        private LocalDate dueDate;
        private LocalDate returnDate;
        private String status;
        private Double fineAmount;
        private boolean finePaid;
        private boolean overdue;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private boolean enabled;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookDTO {
        private Long id;
        private String title;
        private String author;
        private String isbn;
        private Integer availableCopies;
        private Integer totalCopies;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAdminLoanRequest {
        private Long userId;
        private Long bookId;
        private LocalDate dueDate;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnLoanAdminRequest {
        private String condition;
        private String notes;
        private boolean finePaid;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtendLoanRequest {
        private LocalDate newDueDate;
        private String reason;
    }
}
