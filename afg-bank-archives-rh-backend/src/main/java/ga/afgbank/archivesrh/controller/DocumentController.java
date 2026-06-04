package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.dto.DocumentResponse;
import ga.afgbank.archivesrh.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;

/**
 * REST Endpoint for GED digital archiving, uploading, checking retention and corbeille purges.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
@Tag(name = "GED - Archives", description = "Endpoints d'indexation, consultation et corbeille d'archives")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @Operation(summary = "Lister les documents actifs dans la GED d'AFG Bank")
    public ResponseEntity<List<DocumentResponse>> getActiveDocuments() {
        return ResponseEntity.ok(documentService.getActiveDocuments());
    }

    @GetMapping("/trash")
    @Operation(summary = "Consulter la corbeille de rétention temporaire", description = "Consulter les fichiers supprimés dont la rétention légale de 30 jours est active.")
    public ResponseEntity<List<DocumentResponse>> getDeletedDocuments() {
        return ResponseEntity.ok(documentService.getDeletedDocuments());
    }

    @PostMapping("/upload")
    @Operation(summary = "Indexer et téléverser un nouveau document numérisé", description = "Copie physiquement le fichier et calcule son empreinte d'intégrité SHA-256")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam("typeCode") String typeCode,
            @RequestParam(value = "uploaderId", required = false) Long uploaderId,
            @RequestParam(value = "agencyId", required = false) Long agencyId) {
        
        DocumentResponse response = documentService.uploadDocument(file, employeeId, typeCode, uploaderId, agencyId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Placer un document actif dans la corbeille de rétention", description = "Soft-delete de l'archive avec marquage de l'auteur de la suppression")
    public ResponseEntity<Void> softDelete(@PathVariable Long id, Principal principal) {
        String executor = principal != null ? principal.getName() : "Aimé Mbili";
        documentService.softDeleteDocument(id, executor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restaurer un document depuis la corbeille", description = "Annule la suppression temporaire et réintègre le document dans l'arborescence active.")
    public ResponseEntity<Void> restore(@PathVariable Long id) {
        documentService.restoreDocument(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanent")
    @Operation(summary = "Purger définitivement un document de tous les disques", description = "Suppression physique irréversible de l'archive, conforme aux dictionnaire RGPD.")
    public ResponseEntity<Void> hardDelete(@PathVariable Long id) {
        documentService.hardDeleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/trash/empty")
    @Operation(summary = "Vider intégralement la corbeille de rétention")
    public ResponseEntity<Void> emptyTrash() {
        documentService.emptyTrash();
        return ResponseEntity.noContent().build();
    }
}
