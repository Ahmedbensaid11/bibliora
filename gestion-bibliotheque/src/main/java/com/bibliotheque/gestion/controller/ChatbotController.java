package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    /**
     * Chat endpoint - public access for both guests and authenticated users
     * POST /api/chatbot/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<DataResponse<Map<String, Object>>> chat(@RequestBody Map<String, String> request) {
        log.info("Received chat message");

        try {
            String userMessage = request.get("message");
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new DataResponse<>(false, "Message cannot be empty", null));
            }

            // Check authentication
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = auth != null && auth.isAuthenticated()
                    && !auth.getPrincipal().equals("anonymousUser");

            String response;
            String username = null;

            if (isAuthenticated) {
                String usernamePrincipal = auth.getName();
                User user = userRepository.findByUsername(usernamePrincipal)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                response = chatbotService.processAuthenticatedMessage(userMessage, user);
                username = user.getUsername();
            } else {
                response = chatbotService.processGuestMessage(userMessage);
            }

            Map<String, Object> responseData = Map.of(
                    "response", response,
                    "isAuthenticated", isAuthenticated,
                    "username", username != null ? username : ""
            );

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Response generated", responseData)
            );

        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataResponse<>(false, "Error processing message", null));
        }
    }

    /**
     * Health check
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<DataResponse<String>> health() {
        return ResponseEntity.ok(
                new DataResponse<>(true, "Chatbot service is running", "OK")
        );
    }
}
