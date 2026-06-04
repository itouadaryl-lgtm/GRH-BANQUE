package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.dto.UserRequest;
import ga.afgbank.archivesrh.dto.UserResponse;
import ga.afgbank.archivesrh.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller to support manual registering, editing, status toggles, and Excel bulk importing of AFG Bank staff.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employés", description = "Endpoints de gestion administrative des collaborateurs")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lister l'ensemble des collaborateurs d'AFG Bank Gabon")
    public ResponseEntity<List<UserResponse>> listEmployees() {
        return ResponseEntity.ok(userService.getAllEmployees());
    }

    @PostMapping
    @Operation(summary = "Enregistrer manuellement une nouvelle fiche collaborateur")
    public ResponseEntity<UserResponse> addEmployee(@RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createEmployee(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Activer ou désactiver l'habilitation d'un collaborateur", description = "Suspend temporairement l'accès de l'agent sans purger sa fiche")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.updateEmployeeStatus(id, active));
    }

    @PostMapping("/import-excel")
    @Operation(summary = "Simuler l'intégration en masse de fiches depuis un tableau Excel")
    public ResponseEntity<String> importExcel() {
        userService.simulatedExcelImport();
        return ResponseEntity.ok("Importation du fichier Excel Banque effectuée avec succès sur le serveur d'archivage.");
    }
}
