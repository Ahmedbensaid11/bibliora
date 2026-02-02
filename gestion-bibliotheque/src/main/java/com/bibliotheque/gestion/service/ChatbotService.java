package com.bibliotheque.gestion.service;

import com.bibliotheque.gestion.entity.Book;
import com.bibliotheque.gestion.entity.Loan;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.BookRepository;
import com.bibliotheque.gestion.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class ChatbotService {

    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;
    private final RestTemplate restTemplate;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    public ChatbotService(BookRepository bookRepository, LoanRepository loanRepository, RestTemplateBuilder restTemplateBuilder) {
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
        this.restTemplate = restTemplateBuilder.build();
    }

    /**
     * Process message for guest users
     */
    public String processGuestMessage(String userMessage) {
        log.info("Processing guest message");
        String context = buildGuestContext(userMessage);
        String systemPrompt = buildSystemPrompt(false, null);
        return callOpenRouterAPI(systemPrompt, context, userMessage);
    }

    /**
     * Process message for authenticated users
     */
    public String processAuthenticatedMessage(String userMessage, User user) {
        log.info("Processing authenticated message for user: {}", user.getUsername());
        String context = buildAuthenticatedContext(userMessage, user);
        String systemPrompt = buildSystemPrompt(true, user);
        return callOpenRouterAPI(systemPrompt, context, userMessage);
    }

    /**
     * Build system prompt
     */
    private String buildSystemPrompt(boolean isAuthenticated, User user) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Tu es l'assistant virtuel de BiblioRA, une bibliothèque chaleureuse. ");
        prompt.append("Tu aides les utilisateurs à trouver des livres et à répondre aux questions sur la bibliothèque. ");
        prompt.append("Sois amical, concis et utile. ");

        if (isAuthenticated && user != null) {
            prompt.append(String.format("Tu assistes %s, un membre enregistré. ", user.getUsername()));
            prompt.append("Tu as accès à ses emprunts en cours. ");
        } else {
            prompt.append("Tu assistes un visiteur. ");
            prompt.append("Encourage-le à s'inscrire pour emprunter des livres. ");
        }

        prompt.append("Limite tes réponses à 150 mots. ");
        prompt.append("Réponds toujours en français.");

        return prompt.toString();
    }

    /**
     * Build context for guest users
     */
    private String buildGuestContext(String userMessage) {
        List<Book> relevantBooks = searchRelevantBooks(userMessage);

        StringBuilder context = new StringBuilder();
        context.append("CATALOGUE BIBLIORA:\n");

        if (!relevantBooks.isEmpty()) {
            context.append("Livres pertinents:\n");
            relevantBooks.stream().limit(5).forEach(book -> {
                context.append(String.format("- '%s' par %s (%s) - %d exemplaires disponibles\n",
                        book.getTitle(),
                        book.getAuthor(),
                        book.getGenre() != null ? book.getGenre() : "Non classé",
                        book.getAvailableCopies()));
            });
        } else {
            context.append("Total de livres: ").append(bookRepository.count()).append("\n");
        }

        context.append("\nINFOS GÉNÉRALES:\n");
        context.append("- Durée d'emprunt: 14 jours\n");
        context.append("- Max 5 livres par utilisateur\n");
        context.append("- Frais de retard: 0.50€ par jour\n");

        return context.toString();
    }

    /**
     * Build context for authenticated users
     */
    private String buildAuthenticatedContext(String userMessage, User user) {
        StringBuilder context = new StringBuilder(buildGuestContext(userMessage));

        List<Loan> activeLoans = loanRepository.findByUserIdAndStatus(user.getId(),
                com.bibliotheque.gestion.entity.LoanStatus.ACTIVE);

        context.append("\nEMPRUNTS ACTIFS:\n");
        if (activeLoans.isEmpty()) {
            context.append("Aucun emprunt en cours.\n");
        } else {
            activeLoans.forEach(loan -> {
                context.append(String.format("- '%s' (retour: %s)\n",
                        loan.getBook().getTitle(),
                        loan.getDueDate()));
            });
        }

        return context.toString();
    }

    /**
     * Search relevant books
     */
    private List<Book> searchRelevantBooks(String query) {
        String[] keywords = query.toLowerCase().split("\\s+");

        for (String keyword : keywords) {
            if (keyword.length() > 3) {
                List<Book> books = bookRepository.findByTitleContainingIgnoreCase(keyword);
                if (!books.isEmpty()) return books;

                books = bookRepository.findByAuthorContainingIgnoreCase(keyword);
                if (!books.isEmpty()) return books;
            }
        }

        return new ArrayList<>();
    }

    /**
     * Call OpenRouter API
     */
    private String callOpenRouterAPI(String systemPrompt, String context, String userMessage) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", context + "\n\nQuestion: " + userMessage));

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "https://bibliora.com");
            headers.set("X-Title", "BiblioRA");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    log.info("OpenRouter API response received");
                    return content;
                }
            }

            return getFallbackResponse();

        } catch (Exception e) {
            log.error("Error calling OpenRouter API: {}", e.getMessage(), e);
            return getFallbackResponse();
        }
    }

    /**
     * Fallback response
     */
    private String getFallbackResponse() {
        return "Je suis désolé, je rencontre des difficultés techniques. " +
               "Veuillez réessayer dans quelques instants.";
    }
}
