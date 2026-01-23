package com.bibliotheque.gestion.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanBookDTO {
    private Long id;
    private String isbn;
    private String title;
    private String author;
 //   private String coverImage;
}