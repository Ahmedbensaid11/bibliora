package com.bibliotheque.gestion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Configuration pour servir les fichiers uploadés (photos de profil)
 */
@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadConfig.class);

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;

        // Log pour debug
        logger.info("=================================================");
        logger.info("Configuring static resource handler for uploads");
        logger.info("Upload directory: " + uploadPath);
        logger.info("Directory exists: " + new File(uploadPath).exists());

        File profilesDir = new File(uploadPath + "profiles");
        logger.info("Profiles directory: " + profilesDir.getAbsolutePath());
        logger.info("Profiles directory exists: " + profilesDir.exists());

        if (profilesDir.exists()) {
            File[] files = profilesDir.listFiles();
            logger.info("Files in profiles directory: " + (files != null ? files.length : 0));
            if (files != null && files.length > 0) {
                logger.info("First file: " + files[0].getName());
            }
        }
        logger.info("=================================================");

        // Servir les fichiers depuis le dossier uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath)
                .setCachePeriod(0); // Disable cache for development
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}