package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.model.SystemParameter;
import ga.afgbank.archivesrh.repository.SystemParameterRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller to look up or write key settings (system values like institution name, date format, etc.).
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/parameters")
@RequiredArgsConstructor
@Tag(name = "Paramètres Système", description = "Endpoints de gestion de l'identité et configuration d'AFG Bank")
@CrossOrigin(origins = "*")
public class ParameterController {

    private final SystemParameterRepository systemParameterRepository;

    @GetMapping
    @Operation(summary = "Obtenir tous les paramètres globaux configurés")
    public ResponseEntity<List<SystemParameter>> getAll() {
        return ResponseEntity.ok(systemParameterRepository.findAll());
    }

    @PutMapping("/{key}")
    @Operation(summary = "Mettre à jour la valeur d'une clé de configuration")
    public ResponseEntity<SystemParameter> update(@PathVariable String key, @RequestParam String value) {
        SystemParameter param = systemParameterRepository.findById(key)
                .orElse(SystemParameter.builder().paramKey(key).description("Paramètre dynamique").build());
        param.setParamValue(value);
        return ResponseEntity.ok(systemParameterRepository.save(param));
    }
}
