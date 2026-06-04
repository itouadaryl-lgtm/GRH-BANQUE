package ga.afgbank.archivesrh.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO representing user sign-in request.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@Schema(description = "Requête d'authentification pour l'accès au portail d'archives RH")
public class LoginRequest {

    @NotBlank(message = "L'adresse email est requise")
    @Schema(description = "Email professionnel enregistré dans l'Annuaire Actif AFG BANK", example = "hr@afgbank.ga", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "Le mot de passe de session est requis")
    @Schema(description = "Mot de passe d'habilitation LDAP/Interne", example = "Postgresql123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
}

