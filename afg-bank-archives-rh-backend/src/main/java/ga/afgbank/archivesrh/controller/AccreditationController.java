package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.dto.AccessRequestDto;
import ga.afgbank.archivesrh.model.AccessRequest;
import ga.afgbank.archivesrh.repository.AccessRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller to support inter-agency file share permissions and delegation flow alerts.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/access-requests")
@RequiredArgsConstructor
@Tag(name = "Accréditations - Décloisonnement", description = "Endpoints de gestion d'accès temporaires inter-agences")
@CrossOrigin(origins = "*")
public class AccreditationController {

    private final AccessRequestRepository accessRequestRepository;

    @GetMapping
    @Operation(summary = "Lister les demandes de décloisonnement", description = "Affiche les requêtes d'accès temporaires en cours d'évaluation.")
    public ResponseEntity<List<AccessRequestDto>> listRequests() {
        return ResponseEntity.ok(accessRequestRepository.findAll().stream()
                .map(r -> AccessRequestDto.builder()
                        .id(r.getId())
                        .requester(r.getRequester())
                        .document(r.getDocument())
                        .reason(r.getReason())
                        .date(r.getDate())
                        .status(r.getStatus())
                        .build())
                .collect(Collectors.toList()));
    }

    @PostMapping
    @Operation(summary = "Émettre une demande de décloisonnement temporaire")
    public ResponseEntity<AccessRequestDto> createRequest(@RequestBody AccessRequestDto req) {
        AccessRequest request = AccessRequest.builder()
                .requester(req.getRequester())
                .document(req.getDocument())
                .reason(req.getReason())
                .date(LocalDateTime.now())
                .status("En attente")
                .build();

        AccessRequest saved = accessRequestRepository.save(request);
        return ResponseEntity.ok(AccessRequestDto.builder()
                .id(saved.getId())
                .requester(saved.getRequester())
                .document(saved.getDocument())
                .reason(saved.getReason())
                .date(saved.getDate())
                .status(saved.getStatus())
                .build());
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approuver une accréditation")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        AccessRequest r = accessRequestRepository.findById(id).orElseThrow();
        r.setStatus("Approuvé");
        accessRequestRepository.save(r);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Rejeter une accréditation")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        AccessRequest r = accessRequestRepository.findById(id).orElseThrow();
        r.setStatus("Rejeté");
        accessRequestRepository.save(r);
        return ResponseEntity.noContent().build();
    }
}
