package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * REST Endpoint supporting natural language inquiries on regulation databases.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Tag(name = "Assistant Intelligent - ARHI", description = "Endpoints de conversation réglementaire avec l'agent Gemini")
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final GeminiService geminiService;

    @PostMapping("/ask")
    @Operation(summary = "Adresser une question réglementaire ou d'audit à l'agent ARHI")
    public ResponseEntity<Map<String, String>> askArhi(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("response", "Le message ne peut pas être vide."));
        }
        String answer = geminiService.askGemini(prompt);
        return ResponseEntity.ok(Map.of("response", answer));
    }
}
