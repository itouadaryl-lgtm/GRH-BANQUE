package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.dto.ActivityLogDto;
import ga.afgbank.archivesrh.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller returning immutable action logs to internally certified bank auditors.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Registre de Sécurité & Audit", description = "Endpoints de consultation des traces d'activité système immutables")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Consulter les 100 dernières actions d'audit", description = "Affiche l'historique complet pour la Direction d'Audit (DRC).")
    public ResponseEntity<List<ActivityLogDto>> getLogs() {
        return ResponseEntity.ok(auditService.getGlobalLogs());
    }
}
