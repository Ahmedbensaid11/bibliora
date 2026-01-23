package com.bibliotheque.gestion.mapper;

import com.bibliotheque.gestion.dto.BookDTO;
import com.bibliotheque.gestion.entity.Book;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BookMapper {

    public BookDTO toDTO(Book book) {
        if (book == null) {
            return null;
        }

        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setGenre(book.getGenre());
        dto.setSummary(book.getSummary());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setStatus(book.getStatus() != null ? book.getStatus().toString() : null);
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());

        // Handle categories (simplified to avoid circular reference)
        if (book.getCategories() != null && !book.getCategories().isEmpty()) {
            Set<BookDTO.CategorySimpleDTO> categoriesSimple = book.getCategories().stream()
                    .map(category -> {
                        BookDTO.CategorySimpleDTO simpleDTO = new BookDTO.CategorySimpleDTO();
                        simpleDTO.setId(category.getId());
                        simpleDTO.setName(category.getName());
                        return simpleDTO;
                    })
                    .collect(Collectors.toSet());
            dto.setCategories(categoriesSimple);
        }

        return dto;
    }
}