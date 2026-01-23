package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.entity.Book.BookStatus;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.repository.LoanRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/books")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookController {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final LoanRepository loanRepository;

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Get all books with pagination and filters
     * GET /api/admin/books
     */
    @GetMapping
    public ResponseEntity<ListResponse<BookDTO>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Book> bookPage;

            if (search != null && !search.isEmpty()) {
                // Search by title, author, or ISBN
                bookPage = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrIsbnContainingIgnoreCase(
                        search, search, search, pageable);
            } else if (category != null && !category.isEmpty() && !category.equals("all")) {
                // Filter by category name
                bookPage = bookRepository.findByCategoryName(category, pageable);
            } else {
                bookPage = bookRepository.findAll(pageable);
            }

            List<BookDTO> bookDTOs = bookPage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            // Apply status filter
            if (status != null && !status.isEmpty() && !status.equals("all")) {
                if (status.equals("available")) {
                    bookDTOs = bookDTOs.stream()
                            .filter(dto -> dto.getAvailableCopies() > 0)
                            .collect(Collectors.toList());
                } else if (status.equals("unavailable")) {
                    bookDTOs = bookDTOs.stream()
                            .filter(dto -> dto.getAvailableCopies() == 0)
                            .collect(Collectors.toList());
                }
            }

            // Create ListResponse with your structure
            ListResponse<BookDTO> response = new ListResponse<>(
                    true,
                    "Books retrieved successfully",
                    bookDTOs
            );
            response.setTotalElements(bookDTOs.size());

            // Set pagination info
            response.setCurrentPage(page);
            response.setPageSize(size);
            response.setTotalPages(bookPage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting books: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }



    /**
     * Get book by ID
     * GET /api/admin/books/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DataResponse<BookDTO>> getBookById(@PathVariable Long id) {
        try {
            Book book = bookRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

            BookDTO bookDTO = convertToDTO(book);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Book retrieved successfully", bookDTO)
            );
        } catch (Exception e) {
            log.error("Error getting book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get book statistics
     * GET /api/admin/books/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<DataResponse<Map<String, Object>>> getBookStatistics() {
        try {
            List<Book> allBooks = bookRepository.findAll();

            long totalBooks = allBooks.size();
            long availableBooks = allBooks.stream()
                    .filter(book -> book.getAvailableCopies() > 0)
                    .count();

            long borrowedBooks = allBooks.stream()
                    .mapToInt(Book::getTotalCopies)
                    .sum() - allBooks.stream()
                    .mapToInt(Book::getAvailableCopies)
                    .sum();

            // Get categories statistics
            Map<String, Long> categoriesStats = allBooks.stream()
                    .flatMap(book -> book.getCategories().stream())
                    .collect(Collectors.groupingBy(
                            Category::getName,
                            Collectors.counting()
                    ));

            // Count books without category
            long uncategorized = allBooks.stream()
                    .filter(book -> book.getCategories().isEmpty())
                    .count();
            if (uncategorized > 0) {
                categoriesStats.put("Non catégorisé", uncategorized);
            }

            // Find most popular books (by status)
            List<Map<String, Object>> popularBooks = allBooks.stream()
                    .sorted((b1, b2) -> Integer.compare(b2.getAvailableCopies(), b1.getAvailableCopies()))
                    .limit(5)
                    .map(book -> {
                        Map<String, Object> bookInfo = new HashMap<>();
                        bookInfo.put("id", book.getId());
                        bookInfo.put("title", book.getTitle());
                        bookInfo.put("author", book.getAuthor());
                        bookInfo.put("available", book.getAvailableCopies());
                        bookInfo.put("status", book.getStatus().name());
                        return bookInfo;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", totalBooks);
            stats.put("availableBooks", availableBooks);
            stats.put("borrowedBooks", borrowedBooks);
            stats.put("unavailableBooks", totalBooks - availableBooks);
            stats.put("categories", categoriesStats);
            stats.put("popularBooks", popularBooks);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Book statistics retrieved successfully", stats)
            );
        } catch (Exception e) {
            log.error("Error getting book statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Create new book
     * POST /api/admin/books
     */
    @PostMapping
    public ResponseEntity<DataResponse<BookDTO>> createBook(@RequestBody CreateBookRequest request) {
        try {
            // Validate required fields
            if (request.getTitle() == null || request.getTitle().isEmpty()) {
                throw new RuntimeException("Title is required");
            }
            if (request.getAuthor() == null || request.getAuthor().isEmpty()) {
                throw new RuntimeException("Author is required");
            }
            if (request.getIsbn() == null || request.getIsbn().isEmpty()) {
                throw new RuntimeException("ISBN is required");
            }
            if (request.getTotalCopies() == null || request.getTotalCopies() <= 0) {
                throw new RuntimeException("Total copies must be greater than 0");
            }

            // Check if ISBN already exists
            if (bookRepository.existsByIsbn(request.getIsbn())) {
                throw new RuntimeException("ISBN already exists");
            }

            // Create new book
            Book book = Book.builder()
                    .title(request.getTitle())
                    .author(request.getAuthor())
                    .isbn(request.getIsbn())
                    .summary(request.getDescription())
                    .publisher(request.getPublisher())
                    .publicationYear(request.getPublicationYear())
                    .genre(request.getGenre())
                    .totalCopies(request.getTotalCopies())
                    .availableCopies(request.getTotalCopies())
                    .status(BookStatus.AVAILABLE)
                    .build();

            // Set categories if provided
            if (request.getCategoryId() != null) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
                book.addToCategory(category);
            } else if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
                Set<Category> categories = new HashSet<>();
                for (Long categoryId : request.getCategoryIds()) {
                    Category category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                    categories.add(category);
                }
                // Clear and set categories
                book.clearCategories();
                for (Category category : categories) {
                    book.addToCategory(category);
                }
            }

            Book savedBook = bookRepository.save(book);
            BookDTO bookDTO = convertToDTO(savedBook);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Book created successfully", bookDTO));
        } catch (Exception e) {
            log.error("Error creating book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Update book
     * PUT /api/admin/books/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DataResponse<BookDTO>> updateBook(
            @PathVariable Long id,
            @RequestBody UpdateBookRequest request) {

        try {
            Book book = bookRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

            // Update fields if provided
            if (request.getTitle() != null && !request.getTitle().isEmpty()) {
                book.setTitle(request.getTitle());
            }
            if (request.getAuthor() != null && !request.getAuthor().isEmpty()) {
                book.setAuthor(request.getAuthor());
            }
            if (request.getDescription() != null) {
                book.setSummary(request.getDescription());
            }
            if (request.getPublisher() != null) {
                book.setPublisher(request.getPublisher());
            }
            if (request.getPublicationYear() != null) {
                book.setPublicationYear(request.getPublicationYear());
            }
            if (request.getGenre() != null) {
                book.setGenre(request.getGenre());
            }
            if (request.getTotalCopies() != null) {
                int newTotalCopies = request.getTotalCopies();
                int currentAvailable = book.getAvailableCopies();
                int borrowedCopies = book.getTotalCopies() - currentAvailable;

                if (newTotalCopies < borrowedCopies) {
                    throw new RuntimeException("Total copies cannot be less than borrowed copies (" + borrowedCopies + ")");
                }

                book.setTotalCopies(newTotalCopies);
                book.setAvailableCopies(newTotalCopies - borrowedCopies);
            }

            // Update categories if provided
            if (request.getCategoryId() != null) {
                // Clear existing categories
                book.clearCategories();

                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
                book.addToCategory(category);
            } else if (request.getCategoryIds() != null) {
                // Clear existing categories
                book.clearCategories();

                // Add new categories
                for (Long categoryId : request.getCategoryIds()) {
                    Category category = categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                    book.addToCategory(category);
                }
            }

            // Update status based on availability
            if (book.getAvailableCopies() == 0) {
                book.setStatus(BookStatus.OUT_OF_STOCK);
            } else {
                book.setStatus(BookStatus.AVAILABLE);
            }

            Book updatedBook = bookRepository.save(book);
            BookDTO bookDTO = convertToDTO(updatedBook);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Book updated successfully", bookDTO)
            );
        } catch (Exception e) {
            log.error("Error updating book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Delete book
     * DELETE /api/admin/books/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteBook(@PathVariable Long id) {
        try {
            Book book = bookRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

            // Check if book has active loans
            if (book.getAvailableCopies() < book.getTotalCopies()) {
                throw new RuntimeException("Cannot delete book with active loans");
            }

            bookRepository.delete(book);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Book deleted successfully")
            );
        } catch (Exception e) {
            log.error("Error deleting book: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Get all categories
     * GET /api/admin/books/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ListResponse<CategoryDTO>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll(Sort.by("name").ascending());
            List<CategoryDTO> categoryDTOs = categories.stream()
                    .map(this::convertCategoryToDTO)
                    .collect(Collectors.toList());

            ListResponse<CategoryDTO> response = new ListResponse<>(
                    true,
                    "Categories retrieved successfully",
                    categoryDTOs
            );
            response.setTotalElements(categoryDTOs.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting categories: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Create category
     * POST /api/admin/books/categories
     */
    @PostMapping("/categories")
    public ResponseEntity<DataResponse<CategoryDTO>> createCategory(@RequestBody CreateCategoryRequest request) {
        try {
            if (request.getName() == null || request.getName().isEmpty()) {
                throw new RuntimeException("Category name is required");
            }

            // Check if category already exists
            if (categoryRepository.existsByName(request.getName())) {
                throw new RuntimeException("Category already exists");
            }

            Category category = Category.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .active(true)
                    .build();

            // Set parent category if provided
            if (request.getParentId() != null) {
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                category.setParent(parent);
            }

            Category savedCategory = categoryRepository.save(category);
            CategoryDTO categoryDTO = convertCategoryToDTO(savedCategory);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "Category created successfully", categoryDTO));
        } catch (Exception e) {
            log.error("Error creating category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Update category
     * PUT /api/admin/books/categories/{id}
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<DataResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @RequestBody UpdateCategoryRequest request) {

        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

            if (request.getName() != null && !request.getName().isEmpty()) {
                // Check if name already exists (excluding current category)
                Category existing = categoryRepository.findByNameAndIdNot(request.getName(), id);
                if (existing != null) {
                    throw new RuntimeException("Category name already exists");
                }
                category.setName(request.getName());
            }

            if (request.getDescription() != null) {
                category.setDescription(request.getDescription());
            }

            // Update parent category if provided
            if (request.getParentId() != null) {
                if (request.getParentId().equals(id)) {
                    throw new RuntimeException("Category cannot be its own parent");
                }
                Category parent = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                category.setParent(parent);
            } else if (request.getParentId() == null && category.getParent() != null) {
                // Remove parent if null is explicitly provided
                category.setParent(null);
            }

            if (request.getActive() != null) {
                category.setActive(request.getActive());
            }

            Category updatedCategory = categoryRepository.save(category);
            CategoryDTO categoryDTO = convertCategoryToDTO(updatedCategory);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Category updated successfully", categoryDTO)
            );
        } catch (Exception e) {
            log.error("Error updating category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Delete category
     * DELETE /api/admin/books/categories/{id}
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

            // Check if category has books
            if (!category.getBooks().isEmpty()) {
                throw new RuntimeException("Cannot delete category with books. Move books first.");
            }

            // Check if category has subcategories
            boolean hasSubcategories = categoryRepository.existsByParentId(id);
            if (hasSubcategories) {
                throw new RuntimeException("Cannot delete category with subcategories. Delete subcategories first.");
            }

            categoryRepository.delete(category);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Category deleted successfully")
            );
        } catch (Exception e) {
            log.error("Error deleting category: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Export books to Excel/CSV
     * GET /api/admin/books/export
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportBooks(
            @RequestParam(defaultValue = "excel") String format,
            HttpServletResponse response) {

        try {
            List<Book> books = bookRepository.findAll(Sort.by("title").ascending());

            if ("csv".equalsIgnoreCase(format)) {
                return exportToCSV(books);
            } else {
                return exportToExcel(books);
            }
        } catch (Exception e) {
            log.error("Error exporting books: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    private ResponseEntity<byte[]> exportToExcel(List<Book> books) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Books");

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Title", "Author", "ISBN", "Categories", "Publisher", "Year", "Total Copies", "Available", "Status", "Created At"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            CellStyle style = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            style.setFont(font);
            cell.setCellStyle(style);
        }

        // Fill data
        int rowNum = 1;
        for (Book book : books) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(book.getId());
            row.createCell(1).setCellValue(book.getTitle());
            row.createCell(2).setCellValue(book.getAuthor());
            row.createCell(3).setCellValue(book.getIsbn());

            String categories = book.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.joining(", "));
            row.createCell(4).setCellValue(categories.isEmpty() ? "Non catégorisé" : categories);
            row.createCell(5).setCellValue(book.getPublisher() != null ? book.getPublisher() : "");
            row.createCell(6).setCellValue(book.getPublicationYear() != null ? book.getPublicationYear() : 0);
            row.createCell(7).setCellValue(book.getTotalCopies());
            row.createCell(8).setCellValue(book.getAvailableCopies());
            row.createCell(9).setCellValue(book.getStatus().name());
            row.createCell(10).setCellValue(book.getCreatedAt() != null ? book.getCreatedAt().toString() : "");
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Write to byte array
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] bytes = bos.toByteArray();

        return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=books_export.xlsx")
                .body(bytes);
    }

    private ResponseEntity<byte[]> exportToCSV(List<Book> books) throws IOException {
        StringWriter writer = new StringWriter();

        // Fix CSV format - use builder pattern instead of deprecated method
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader("ID", "Title", "Author", "ISBN", "Categories", "Publisher", "Year", "Total Copies", "Available", "Status", "Created At")
                .build();

        CSVPrinter csvPrinter = new CSVPrinter(writer, csvFormat);

        for (Book book : books) {
            String categories = book.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.joining(", "));

            csvPrinter.printRecord(
                    book.getId(),
                    book.getTitle(),
                    book.getAuthor(),
                    book.getIsbn(),
                    categories.isEmpty() ? "Non catégorisé" : categories,
                    book.getPublisher() != null ? book.getPublisher() : "",
                    book.getPublicationYear() != null ? book.getPublicationYear() : 0,
                    book.getTotalCopies(),
                    book.getAvailableCopies(),
                    book.getStatus().name(),
                    book.getCreatedAt() != null ? book.getCreatedAt().toString() : ""
            );
        }

        csvPrinter.flush();
        csvPrinter.close();

        byte[] bytes = writer.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=books_export.csv")
                .body(bytes);
    }

    /**
     * Import books from Excel/CSV
     * POST /api/admin/books/import
     */
    @PostMapping("/import")
    public ResponseEntity<ApiResponse> importBooks(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "excel") String format) {

        try {
            int importedCount = 0;
            List<String> errors = new ArrayList<>();

            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new RuntimeException("Invalid filename");
            }

            if (filename.endsWith(".csv") || format.equalsIgnoreCase("csv")) {
                importedCount = importFromCSV(file, errors);
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                importedCount = importFromExcel(file, errors);
            } else {
                throw new RuntimeException("Unsupported file format. Please use CSV or Excel files.");
            }

            if (!errors.isEmpty()) {
                String errorMessage = String.format("Imported %d books with %d errors: %s",
                        importedCount, errors.size(), String.join("; ", errors));
                return ResponseEntity.ok(new ApiResponse(true, errorMessage));
            }

            return ResponseEntity.ok(
                    new ApiResponse(true, String.format("Successfully imported %d books", importedCount))
            );
        } catch (Exception e) {
            log.error("Error importing books: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Error importing books: " + e.getMessage()));
        }
    }

    private int importFromExcel(MultipartFile file, List<String> errors) throws IOException {
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        int importedCount = 0;

        // Skip header row (row 0)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            try {
                // Required fields
                String title = getCellValue(row.getCell(0));
                String author = getCellValue(row.getCell(1));
                String isbn = getCellValue(row.getCell(2));

                if (title == null || title.trim().isEmpty()) {
                    errors.add("Row " + (i+1) + ": Title is required");
                    continue;
                }
                if (author == null || author.trim().isEmpty()) {
                    errors.add("Row " + (i+1) + ": Author is required");
                    continue;
                }
                if (isbn == null || isbn.trim().isEmpty()) {
                    errors.add("Row " + (i+1) + ": ISBN is required");
                    continue;
                }

                // Check if ISBN already exists
                if (bookRepository.existsByIsbn(isbn.trim())) {
                    errors.add("Row " + (i+1) + ": ISBN already exists: " + isbn);
                    continue;
                }

                Book book = Book.builder()
                        .title(title.trim())
                        .author(author.trim())
                        .isbn(isbn.trim())
                        .build();

                // Optional fields
                book.setPublisher(getCellValue(row.getCell(4)));

                // Parse year
                Cell yearCell = row.getCell(5);
                if (yearCell != null) {
                    try {
                        if (yearCell.getCellType() == CellType.NUMERIC) {
                            double yearValue = yearCell.getNumericCellValue();
                            if (yearValue > 1000 && yearValue < 3000) {
                                book.setPublicationYear((int) yearValue);
                            }
                        } else if (yearCell.getCellType() == CellType.STRING) {
                            String yearStr = yearCell.getStringCellValue().trim();
                            if (!yearStr.isEmpty()) {
                                book.setPublicationYear(Integer.parseInt(yearStr));
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Skip invalid year
                    }
                }

                // Parse total copies
                int totalCopies = 1;
                Cell copiesCell = row.getCell(7);
                if (copiesCell != null) {
                    try {
                        if (copiesCell.getCellType() == CellType.NUMERIC) {
                            totalCopies = (int) copiesCell.getNumericCellValue();
                        } else if (copiesCell.getCellType() == CellType.STRING) {
                            String copiesStr = copiesCell.getStringCellValue().trim();
                            if (!copiesStr.isEmpty()) {
                                totalCopies = Integer.parseInt(copiesStr);
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Use default
                    }
                }

                if (totalCopies <= 0) totalCopies = 1;

                book.setTotalCopies(totalCopies);
                book.setAvailableCopies(totalCopies);
                book.setStatus(BookStatus.AVAILABLE);

                // Save book
                bookRepository.save(book);
                importedCount++;

            } catch (Exception e) {
                errors.add("Row " + (i+1) + ": " + e.getMessage());
                log.error("Error importing row {}: {}", i+1, e.getMessage());
            }
        }

        workbook.close();
        return importedCount;
    }

    private int importFromCSV(MultipartFile file, List<String> errors) throws IOException {
        InputStream is = file.getInputStream();
        String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        String[] lines = content.split("\n");

        int importedCount = 0;

        // Skip header row
        for (int i = 1; i < lines.length; i++) {
            try {
                String line = lines[i].trim();
                if (line.isEmpty()) continue;

                // Simple CSV parsing (assumes no commas in fields)
                String[] fields = line.split(",");
                if (fields.length < 3) {
                    errors.add("Row " + (i+1) + ": Insufficient data");
                    continue;
                }

                String title = fields[0].trim();
                String author = fields[1].trim();
                String isbn = fields[2].trim();

                if (title.isEmpty() || author.isEmpty() || isbn.isEmpty()) {
                    errors.add("Row " + (i+1) + ": Missing required fields");
                    continue;
                }

                // Check if ISBN already exists
                if (bookRepository.existsByIsbn(isbn)) {
                    errors.add("Row " + (i+1) + ": ISBN already exists: " + isbn);
                    continue;
                }

                Book book = Book.builder()
                        .title(title)
                        .author(author)
                        .isbn(isbn)
                        .build();

                // Optional fields
                if (fields.length > 4) book.setPublisher(fields[4].trim());
                if (fields.length > 5) {
                    try {
                        book.setPublicationYear(Integer.parseInt(fields[5].trim()));
                    } catch (NumberFormatException e) {
                        // Skip invalid year
                    }
                }

                book.setTotalCopies(1);
                book.setAvailableCopies(1);
                book.setStatus(BookStatus.AVAILABLE);

                bookRepository.save(book);
                importedCount++;

            } catch (Exception e) {
                errors.add("Row " + (i+1) + ": " + e.getMessage());
            }
        }

        return importedCount;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double value = cell.getNumericCellValue();
                    if (value == Math.floor(value)) {
                        return String.valueOf((int) value);
                    } else {
                        return String.valueOf(value);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    // Helper method to convert Book to BookDTO
    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getSummary());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setGenre(book.getGenre());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setStatus(book.getStatus().name());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());

        // Convert categories
        if (book.getCategories() != null && !book.getCategories().isEmpty()) {
            Set<Long> categoryIds = new HashSet<>();
            Set<String> categoryNames = new HashSet<>();
            StringBuilder categoryDisplay = new StringBuilder();

            for (Category category : book.getCategories()) {
                categoryIds.add(category.getId());
                categoryNames.add(category.getName());

                if (categoryDisplay.length() > 0) {
                    categoryDisplay.append(", ");
                }
                categoryDisplay.append(category.getName());
            }

            dto.setCategoryIds(categoryIds);
            dto.setCategoryNames(categoryNames);
            dto.setCategoryName(categoryDisplay.toString());
        } else {
            dto.setCategoryIds(new HashSet<>());
            dto.setCategoryNames(new HashSet<>());
            dto.setCategoryName("Non catégorisé");
        }

        return dto;
    }

    // Helper method to convert Category to CategoryDTO
    private CategoryDTO convertCategoryToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setActive(category.getActive());

        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
            dto.setParentName(category.getParent().getName());
        }

        return dto;
    }

    // ==================== DTOs ====================

    public static class BookDTO {
        private Long id;
        private String title;
        private String author;
        private String isbn;
        private String description;
        private String publisher;
        private Integer publicationYear;
        private String genre;
        private Integer totalCopies;
        private Integer availableCopies;
        private String status;
        private Set<Long> categoryIds;
        private Set<String> categoryNames;
        private String categoryName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }

        public Integer getTotalCopies() { return totalCopies; }
        public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

        public Integer getAvailableCopies() { return availableCopies; }
        public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Set<Long> getCategoryIds() { return categoryIds; }
        public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }

        public Set<String> getCategoryNames() { return categoryNames; }
        public void setCategoryNames(Set<String> categoryNames) { this.categoryNames = categoryNames; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CategoryDTO {
        private Long id;
        private String name;
        private String description;
        private Long parentId;
        private String parentName;
        private Boolean active;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }

        public String getParentName() { return parentName; }
        public void setParentName(String parentName) { this.parentName = parentName; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    public static class CreateBookRequest {
        private String title;
        private String author;
        private String isbn;
        private String description;
        private String publisher;
        private Integer publicationYear;
        private String genre;
        private Integer totalCopies;
        private Long categoryId;
        private Set<Long> categoryIds;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }

        public Integer getTotalCopies() { return totalCopies; }
        public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public Set<Long> getCategoryIds() { return categoryIds; }
        public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
    }

    public static class UpdateBookRequest {
        private String title;
        private String author;
        private String description;
        private String publisher;
        private Integer publicationYear;
        private String genre;
        private Integer totalCopies;
        private Long categoryId;
        private Set<Long> categoryIds;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }

        public Integer getTotalCopies() { return totalCopies; }
        public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public Set<Long> getCategoryIds() { return categoryIds; }
        public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
    }

    public static class CreateCategoryRequest {
        private String name;
        private String description;
        private Long parentId;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
    }

    public static class UpdateCategoryRequest {
        private String name;
        private String description;
        private Long parentId;
        private Boolean active;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    /**
     * Get category statistics with loan counts
     * GET /api/admin/books/categories/statistics
     */
    @GetMapping("/categories/statistics")
    public ResponseEntity<DataResponse<List<Map<String, Object>>>> getCategoryStatistics() {
        try {
            List<Category> allCategories = categoryRepository.findAll();
            List<Loan> allLoans = loanRepository.findAll();

            List<Map<String, Object>> categoryStats = allCategories.stream()
                    .filter(Category::getActive)
                    .map(category -> {
                        Map<String, Object> stat = new HashMap<>();
                        stat.put("id", category.getId());
                        stat.put("name", category.getName());

                        // Count books in this category
                        long bookCount = category.getBooks() != null ? category.getBooks().size() : 0;
                        stat.put("bookCount", bookCount);

                        // Count loans for books in this category
                        long loanCount = allLoans.stream()
                                .filter(loan -> loan.getBook() != null &&
                                        loan.getBook().getCategories() != null &&
                                        loan.getBook().getCategories().contains(category))
                                .count();
                        stat.put("loanCount", loanCount);

                        return stat;
                    })
                    .filter(stat -> (long)stat.get("bookCount") > 0) // Only categories with books
                    .sorted((a, b) -> Long.compare((long)b.get("loanCount"), (long)a.get("loanCount")))
                    .limit(10) // Top 10 categories
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Category statistics retrieved successfully", categoryStats)
            );
        } catch (Exception e) {
            log.error("Error getting category statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get top borrowed books
     * GET /api/admin/books/top-borrowed
     */
    @GetMapping("/top-borrowed")
    public ResponseEntity<ListResponse<Map<String, Object>>> getTopBorrowedBooks(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            List<Loan> allLoans = loanRepository.findAll();

            // Filter by date range if provided
            if (startDate != null && endDate != null) {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);

                allLoans = allLoans.stream()
                        .filter(l -> l.getLoanDate() != null &&
                                !l.getLoanDate().isBefore(start) &&
                                !l.getLoanDate().isAfter(end))
                        .collect(Collectors.toList());
            }

            // Count loans per book
            Map<Long, Long> bookLoanCounts = allLoans.stream()
                    .filter(loan -> loan.getBook() != null)
                    .collect(Collectors.groupingBy(
                            loan -> loan.getBook().getId(),
                            Collectors.counting()
                    ));

            // Get top books with details
            List<Map<String, Object>> topBooks = bookLoanCounts.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(limit)
                    .map(entry -> {
                        Map<String, Object> bookInfo = new HashMap<>();

                        Optional<Book> bookOpt = bookRepository.findById(entry.getKey());
                        if (bookOpt.isPresent()) {
                            Book book = bookOpt.get();
                            bookInfo.put("id", book.getId());
                            bookInfo.put("title", book.getTitle());
                            bookInfo.put("author", book.getAuthor());
                            bookInfo.put("isbn", book.getIsbn());
                            bookInfo.put("genre", book.getGenre());
                            bookInfo.put("loans", entry.getValue());

                            // Calculate average rating (mock - you'd need a ratings table)
                            bookInfo.put("rating", 4.5 + (Math.random() * 0.5));
                        }

                        return bookInfo;
                    })
                    .filter(map -> !map.isEmpty())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Top borrowed books retrieved successfully", topBooks)
            );
        } catch (Exception e) {
            log.error("Error getting top borrowed books: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }
}