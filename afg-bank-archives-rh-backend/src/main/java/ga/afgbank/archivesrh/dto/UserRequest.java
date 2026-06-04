package ga.afgbank.archivesrh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request DTO representing a newly registered / updated employee.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Données d'enregistrement ou de mise à jour d'un collaborateur AFG Bank")
public class UserRequest {

    @NotBlank(message = "Le matricule unique est obligatoire")
    @Schema(description = "Matricule unique officiel de l'employé", example = "AFG-0524", requiredMode = Schema.RequiredMode.REQUIRED)
    private String matricule;

    @NotBlank(message = "Le nom complet est obligatoire")
    @Schema(description = "Nom et Prénom complets", example = "Sophie Dougou", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;

    @NotBlank(message = "L'adresse email est de rigueur")
    @Email(message = "Format email non réglementaire")
    @Schema(description = "Adresse email professionnelle au format afgbank.ga", example = "sophie.dougou@afgbank.ga", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Le poste désigné est requis")
    @Schema(description = "Désignation officielle du poste de l'agent", example = "Analyste de Crédit Senior", requiredMode = Schema.RequiredMode.REQUIRED)
    private String position;

    @Schema(description = "Département ou pôle d'affectation réglementaire", example = "Risques & Gestion de Crédit")
    private String department;

    @Schema(description = "Identifiant numérique de l'agence affiliée locale", example = "1")
    private Long agencyId;
}

