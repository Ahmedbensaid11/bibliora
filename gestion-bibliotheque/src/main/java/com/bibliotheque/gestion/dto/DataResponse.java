package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataResponse<T> extends ApiResponse {
    private T data;

    public DataResponse(Boolean success, String message, T data) {
        super(success, message);
        this.data = data;
    }
}