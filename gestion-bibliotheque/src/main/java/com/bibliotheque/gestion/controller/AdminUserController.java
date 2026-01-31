package com.bibliotheque.gestion.controller;

import com.bibliotheque.gestion.dto.ApiResponse;
import com.bibliotheque.gestion.dto.ListResponse;
import com.bibliotheque.gestion.dto.DataResponse;
import com.bibliotheque.gestion.entity.User;
import com.bibliotheque.gestion.entity.Role;
import com.bibliotheque.gestion.repository.UserRepository;
import com.bibliotheque.gestion.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${cors.allowed-origins}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users
     * GET /api/admin/users
     */
    @GetMapping
    public ResponseEntity<ListResponse<UserDTO>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserDTO> userDTOs = users.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ListResponse<>(true, "Users retrieved successfully", userDTOs)
            );
        } catch (Exception e) {
            log.error("Error getting all users: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ListResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get user by ID
     * GET /api/admin/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DataResponse<UserDTO>> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            UserDTO userDTO = convertToDTO(user);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "User retrieved successfully", userDTO)
            );
        } catch (Exception e) {
            log.error("Error getting user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Get user statistics
     * GET /api/admin/users/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<DataResponse<Map<String, Object>>> getUserStatistics() {
        try {
            List<User> allUsers = userRepository.findAll();

            long totalUsers = allUsers.size();
            long activeUsers = allUsers.stream()
                    .filter(User::isEnabled)
                    .count();

            // Count admin users
            long adminUsers = allUsers.stream()
                    .filter(u -> {
                        Set<Role> roles = u.getRoles();
                        if (roles == null) return false;
                        return roles.stream()
                                .anyMatch(role -> {
                                    Role.RoleName roleName = role.getName();
                                    return roleName == Role.RoleName.ROLE_ADMIN;
                                });
                    })
                    .count();

            // Count new users (last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            long newUsers = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("adminUsers", adminUsers);
            stats.put("newUsers", newUsers);
            stats.put("inactiveUsers", totalUsers - activeUsers);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "Statistics retrieved successfully", stats)
            );
        } catch (Exception e) {
            log.error("Error getting user statistics: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Create new user (Admin only)
     * POST /api/admin/users
     */
    @PostMapping
    public ResponseEntity<DataResponse<UserDTO>> createUser(@RequestBody CreateUserRequest request) {
        try {
            // Validate required fields
            if (request.getUsername() == null || request.getUsername().isEmpty()) {
                throw new RuntimeException("Username is required");
            }
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            if (request.getIdentityCard() == null || request.getIdentityCard().isEmpty()) {
                throw new RuntimeException("Carte d'identité (CIN) is required");
            }

            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }

            // Check if identity card already exists
            if (userRepository.existsByIdentityCard(request.getIdentityCard())) {
                throw new RuntimeException("Carte d'identité déjà utilisée");
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setIdentityCard(request.getIdentityCard());
            user.setPhoneNumber(request.getPhoneNumber());
            user.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);
            user.setCreatedAt(LocalDateTime.now());

            // Set default role (ROLE_LECTEUR)
            Role defaultRole = roleRepository.findByName(Role.RoleName.ROLE_LECTEUR)
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            user.setRoles(Set.of(defaultRole));

            User savedUser = userRepository.save(user);
            UserDTO userDTO = convertToDTO(savedUser);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new DataResponse<>(true, "User created successfully", userDTO));
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Update user
     * PUT /api/admin/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DataResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request) {

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            // Update fields if provided
            if (request.getUsername() != null && !request.getUsername().isEmpty()) {
                if (userRepository.existsByUsername(request.getUsername()) &&
                        !user.getUsername().equals(request.getUsername())) {
                    throw new RuntimeException("Username already exists");
                }
                user.setUsername(request.getUsername());
            }

            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                if (userRepository.existsByEmail(request.getEmail()) &&
                        !user.getEmail().equals(request.getEmail())) {
                    throw new RuntimeException("Email already exists");
                }
                user.setEmail(request.getEmail());
            }

            if (request.getFirstName() != null) {
                user.setFirstName(request.getFirstName());
            }

            if (request.getLastName() != null) {
                user.setLastName(request.getLastName());
            }

            if (request.getIdentityCard() != null && !request.getIdentityCard().isEmpty()) {
                if (userRepository.existsByIdentityCard(request.getIdentityCard()) &&
                        !request.getIdentityCard().equals(user.getIdentityCard())) {
                    throw new RuntimeException("Carte d'identité déjà utilisée");
                }
                user.setIdentityCard(request.getIdentityCard());
            }

            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber());
            }

            if (request.getEnabled() != null) {
                user.setEnabled(request.getEnabled());
            }

            user.setUpdatedAt(LocalDateTime.now());
            User updatedUser = userRepository.save(user);
            UserDTO userDTO = convertToDTO(updatedUser);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "User updated successfully", userDTO)
            );
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Delete user
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            userRepository.delete(user);

            return ResponseEntity.ok(
                    new ApiResponse(true, "User deleted successfully")
            );
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    /**
     * Toggle user activation
     * PUT /api/admin/users/{id}/toggle-activation
     */
    @PutMapping("/{id}/toggle-activation")
    public ResponseEntity<DataResponse<UserDTO>> toggleUserActivation(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            user.setEnabled(!user.isEnabled());
            User updatedUser = userRepository.save(user);
            UserDTO userDTO = convertToDTO(updatedUser);

            String message = updatedUser.isEnabled() ?
                    "User activated successfully" : "User deactivated successfully";

            return ResponseEntity.ok(
                    new DataResponse<>(true, message, userDTO)
            );
        } catch (Exception e) {
            log.error("Error toggling user activation: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Update user role
     * PUT /api/admin/users/{id}/role
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<DataResponse<UserDTO>> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            String roleStr = request.getRole();
            if (roleStr == null || roleStr.isEmpty()) {
                throw new RuntimeException("Role cannot be empty");
            }

            Role.RoleName roleName;
            try {
                roleName = Role.RoleName.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                try {
                    roleName = Role.RoleName.valueOf("ROLE_" + roleStr.toUpperCase());
                } catch (IllegalArgumentException e2) {
                    throw new RuntimeException("Invalid role: " + roleStr + ". Valid roles are: ROLE_ADMIN, ROLE_LECTEUR");
                }
            }

            final Role.RoleName finalRoleName = roleName;
            Role role = roleRepository.findByName(finalRoleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + finalRoleName));

            Set<Role> newRoles = new HashSet<>();
            newRoles.add(role);
            user.setRoles(newRoles);

            User updatedUser = userRepository.save(user);
            UserDTO userDTO = convertToDTO(updatedUser);

            return ResponseEntity.ok(
                    new DataResponse<>(true, "User role updated successfully", userDTO)
            );
        } catch (Exception e) {
            log.error("Error updating user role: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new DataResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Reset user password
     * PUT /api/admin/users/{id}/reset-password
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse> resetUserPassword(
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request) {

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            String newPassword = request.getNewPassword();
            if (newPassword == null || newPassword.length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters");
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Password reset successfully")
            );
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Helper method to convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setIdentityCard(user.getIdentityCard());

        if (user.getRoles() != null) {
            Set<String> roleNames = user.getRoles().stream()
                    .map(role -> role.getName().toString())
                    .collect(Collectors.toSet());
            dto.setRoles(roleNames);
        } else {
            dto.setRoles(new HashSet<>());
        }

        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setReadingGoal(user.getReadingGoal());
        dto.setTotalBooksRead(user.getTotalBooksRead());

        return dto;
    }

    // ==================== DTOs ====================

    public static class UserDTO {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String identityCard;
        private String phoneNumber;
        private String photoUrl;
        private Set<String> roles;
        private boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer readingGoal;
        private Integer totalBooksRead;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getIdentityCard() { return identityCard; }
        public void setIdentityCard(String identityCard) { this.identityCard = identityCard; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

        public Set<String> getRoles() { return roles; }
        public void setRoles(Set<String> roles) { this.roles = roles; }

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

        public Integer getReadingGoal() { return readingGoal; }
        public void setReadingGoal(Integer readingGoal) { this.readingGoal = readingGoal; }

        public Integer getTotalBooksRead() { return totalBooksRead; }
        public void setTotalBooksRead(Integer totalBooksRead) { this.totalBooksRead = totalBooksRead; }
    }

    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String identityCard;
        private String phoneNumber;
        private Boolean enabled;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getIdentityCard() { return identityCard; }
        public void setIdentityCard(String identityCard) { this.identityCard = identityCard; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }

    public static class UpdateUserRequest {
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String identityCard;
        private String phoneNumber;
        private Boolean enabled;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getIdentityCard() { return identityCard; }
        public void setIdentityCard(String identityCard) { this.identityCard = identityCard; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }

    public static class UpdateRoleRequest {
        private String role;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class ResetPasswordRequest {
        private String newPassword;

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
