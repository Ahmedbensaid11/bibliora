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
}