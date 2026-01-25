package com.bibliotheque.gestion.entity;

/**
 * Enumeration representing the possible states of a loan
 */
public enum LoanStatus {

    ACTIVE("En cours", "Le livre est actuellement emprunté"),
    OVERDUE("En retard", "La date de retour prévue est dépassée"),
    RETURNED("Retourné", "Le livre a été retourné"),
    LOST("Perdu", "Le livre a été déclaré perdu"),
    CANCELLED("Annulé", "L'emprunt a été annulé");

    private final String label;
    private final String description;

    LoanStatus(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }
}
