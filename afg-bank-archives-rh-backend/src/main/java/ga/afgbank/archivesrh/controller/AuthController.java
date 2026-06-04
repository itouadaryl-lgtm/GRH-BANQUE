package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.dto.LoginRequest;
import ga.afgbank.archivesrh.dto.LoginResponse;
import ga.afgbank.archivesrh.model.User;
import ga.afgbank.archivesrh.repository.UserRepository;
import ga.afgbank.archivesrh.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Controller managing banking authentication sessions, profiles queries and active directory checks.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints de connexion et de vérification d'habilitation JWT")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "S'authentifier sur le portail d'archives d'AFG Bank", description = "Vérifie l'adresse email et le mot de passe, puis génère un jeton cryptographique JWT")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non identifié dans la base"));

        LoginResponse response = LoginResponse.builder()
                .token(jwt)
                .id(user.getId())
                .matricule(user.getMatricule())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .position(user.getPosition())
                .photoUrl(user.getPhotoUrl() != null ? user.getPhotoUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")
                .agencyName(user.getAgency() != null ? user.getAgency().getName() : "Siège Gabon")
                .roles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()))
                .permissions(user.getRoles().stream()
                        .flatMap(r -> r.getPermissions().stream())
                        .map(p -> p.getName())
                        .distinct()
                        .collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(response);
    }
}
