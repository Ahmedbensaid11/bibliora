package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookImportService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public ImportResult importBooksFromCsv(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int skipCount = 0;

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .setIgnoreEmptyLines(true)
                     .build())) {

            log.info("CSV Headers: {}", csvParser.getHeaderNames());

            for (CSVRecord record : csvParser) {
                long recordNumber = record.getRecordNumber() + 1;

                try {
                    // Get title - try with and without BOM
                    String title = getFieldWithBomFallback(record, "title");
                    String isbnRaw = getField(record, "isbn");

                    // Skip if no title
                    if (title == null || title.isEmpty()) {
                        log.debug("Record {}: Skipping - no title", recordNumber);
                        skipCount++;
                        continue;
                    }

                    // Parse ISBN - convert scientific notation to full number
                    String isbn = parseIsbn(isbnRaw);

                    // Skip if no ISBN
                    if (isbn == null || isbn.isEmpty()) {
                        log.debug("Record {}: Skipping - no ISBN", recordNumber);
                        skipCount++;
                        continue;
                    }

                    // Skip if ISBN already exists
                    if (bookRepository.existsByIsbn(isbn)) {
                        log.debug("Record {}: Skipping - ISBN {} already exists", recordNumber, isbn);
                        skipCount++;
                        continue;
                    }

                    String summary = getField(record, "summary");
                    if (summary != null) {
                        summary = summary.replace("\n", " ").replace("\r", " ").trim();
                    }

                    Book book = Book.builder()
                            .isbn(isbn)
                            .title(title)
                            .author(getField(record, "author"))
                            .summary(summary)
                            .language(getField(record, "language"))
                            .genre(getField(record, "genre"))
                            .publisher(getField(record, "publisher"))
                            .coverUrl(getField(record, "coverUrl"))
                            .numberOfPages(parseInteger(getField(record, "numberOfPages")))
                            .publicationYear(parseInteger(getField(record, "publicationYear")))
                            .price(parseDouble(getField(record, "price")))
                            .totalCopies(5)
                            .availableCopies(5)
                            .status(Book.BookStatus.AVAILABLE)
                            .build();

                    // Handle category
                    String categoryName = getField(record, "category");
                    if (categoryName != null && !categoryName.isEmpty()) {
                        Category category = categoryRepository.findByName(categoryName)
                                .orElseGet(() -> {
                                    Category newCat = Category.builder()
                                            .name(categoryName)
                                            .active(true)
                                            .build();
                                    return categoryRepository.save(newCat);
                                });
                        book.getCategories().add(category);
                    }

                    bookRepository.save(book);
                    successCount++;

                    if (successCount % 50 == 0) {
                        log.info("Progress: {} books imported", successCount);
                    }

                } catch (Exception e) {
                    log.error("Record {}: Error - {}", recordNumber, e.getMessage());
                    errors.add("Record " + recordNumber + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("File error: {}", e.getMessage(), e);
            errors.add("File error: " + e.getMessage());
        }

        log.info("Import complete: {} added, {} skipped, {} errors", successCount, skipCount, errors.size());
        return new ImportResult(successCount, skipCount, errors);
    }

    /**
     * Parse ISBN - converts scientific notation (9.78019E+12) to full ISBN string
     */
    private String parseIsbn(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        value = value.trim();

        try {
            // Check if it's in scientific notation
            if (value.toUpperCase().contains("E")) {
                // Use BigDecimal to avoid floating point precision issues
                BigDecimal bd = new BigDecimal(value);
                // Convert to plain string (no scientific notation)
                String fullIsbn = bd.toPlainString();
                // Remove any decimal point and trailing zeros
                if (fullIsbn.contains(".")) {
                    fullIsbn = fullIsbn.split("\\.")[0];
                }
                return fullIsbn;
            }
            // Already a normal number, just remove decimals if any
            if (value.contains(".")) {
                return value.split("\\.")[0];
            }
            return value;
        } catch (NumberFormatException e) {
            // Return as-is if not a valid number
            return value;
        }
    }

    private String getFieldWithBomFallback(CSVRecord record, String name) {
        // First try normal name
        String value = getField(record, name);
        if (value != null) {
            return value;
        }

        // Try with BOM prefix (UTF-8 BOM = \uFEFF)
        value = getField(record, "\uFEFF" + name);
        if (value != null) {
            return value;
        }

        // Last resort: get first column by index
        if (record.size() > 0) {
            String firstValue = record.get(0);
            return (firstValue == null || firstValue.trim().isEmpty()) ? null : firstValue.trim();
        }

        return null;
    }

    private String getField(CSVRecord record, String name) {
        try {
            if (record.isMapped(name)) {
                String value = record.get(name);
                return (value == null || value.trim().isEmpty()) ? null : value.trim();
            }
        } catch (Exception e) {
            // Field not found
        }
        return null;
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            if (value.toUpperCase().contains("E")) {
                return (int) Double.parseDouble(value);
            }
            if (value.contains(".")) {
                return (int) Double.parseDouble(value);
            }
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public record ImportResult(int successCount, int skipCount, List<String> errors) {}
}