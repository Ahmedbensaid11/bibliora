package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> extends ApiResponse {
    private List<T> data;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    // Constructor from Spring Page object
    public PageResponse(Boolean success, String message, Page<T> page) {
        super(success, message);
        this.data = page.getContent();
        this.page = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
    }
}