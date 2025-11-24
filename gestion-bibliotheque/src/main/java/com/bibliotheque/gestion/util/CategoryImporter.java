package com.bibliotheque.gestion.util;

import com.bibliotheque.gestion.entity.Category;
import com.bibliotheque.gestion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

//@Component uncomment this to import
@RequiredArgsConstructor
@Slf4j
public class CategoryImporter implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only run if categories table is empty
        if (categoryRepository.count() > 0) {
            log.info("Categories already exist, skipping import");
            return;
        }

        log.info("Starting category import...");

        try {
            ClassPathResource resource = new ClassPathResource("data/categories.csv");
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
            );

            String line;
            boolean isHeader = true;
            int count = 0;

            while ((line = reader.readLine()) != null) {
                // Skip header
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String categoryName = line.trim();
                if (categoryName.isEmpty()) {
                    continue;
                }

                // Check if category already exists
                if (categoryRepository.findByName(categoryName).isEmpty()) {
                    Category category = Category.builder()
                            .name(categoryName)
                            .description("Books in " + categoryName + " category")
                            .active(true)
                            .build();

                    categoryRepository.save(category);
                    count++;
                    log.info("✅ Imported: {}", categoryName);
                }
            }

            reader.close();
            log.info("✅ Category import complete! {} categories imported.", count);

        } catch (Exception e) {
            log.error("❌ Error importing categories: {}", e.getMessage());
        }
    }
}