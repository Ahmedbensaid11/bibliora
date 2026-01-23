package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListResponse<T> extends ApiResponse {
    private List<T> data;
    private int totalElements;

    public ListResponse(Boolean success, String message, List<T> data) {
        super(success, message);
        this.data = data;
        this.totalElements = data != null ? data.size() : 0;
    }

    private int currentPage;
    private int totalPages;
    private int pageSize;
    public void setTotalElements(int totalElements) {
        this.totalElements = totalElements;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}