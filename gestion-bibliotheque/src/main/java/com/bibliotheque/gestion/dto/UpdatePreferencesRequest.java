package com.bibliotheque.gestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePreferencesRequest {
    private Boolean emailNotifications;
    private Boolean publicProfile;
    private String language;
    private String theme;
}