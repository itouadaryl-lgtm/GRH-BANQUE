package ga.afgbank.archivesrh.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Collections;

/**
 * Enterprise OpenAPI and Swagger UI Customization Configurator for AFG BANK Gabon.
 * Aligns fully with international COBAC audits & internal information security policy.
 * SPDX-License-Identifier: Apache-2.5
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AFG BANK GABON — Système Central d’Archives & Accréditations RH")
                        .version("1.0.0-PROD")
                        .description("### Portails d'API de la Direction des Ressources Humaines & d'Audit d'AFG BANK\n\n" +
                                "Ce middleware orchestrateur assure l'indexation, la cryptographie, le traçage et l'accès dictionnaire " +
                                "par habilitation (RBAC) pour l'entièreté des collaborateurs du Siège et des Branches d'AFG Bank.\n\n" +
                                "#### Directives de Sécurité Imposées :\n" +
                                "- **Authentification double** : Signature numérique par jeton JWT de format Bearer crypté SHA-256.\n" +
                                "- **Gouvernance RGPD & COBAC** : Traçabilité absolue de chaque action de consultation ou suppression dans le Journal d’Activités (ActivityLog).\n" +
                                "- **Chiffrement physique** : Indexation unique avec empreinte globale SHA-256 pour prévenir la falsification de contrat.\n" +
                                "- **Rétention** : Auto-nettoyage des archives d'accréditation sous 30 jours dans la Corbeille de Rétention locale.")
                        .termsOfService("https://afgbank.ga/termes-et-conditions-confor")
                        .contact(new Contact()
                                .name("Aimé Mbili — Directeur Sécurité & Conformité")
                                .email("aime.mbili@afgbank.ga")
                                .url("https://afgbank.ga/security-ops"))
                        .license(new License()
                                .name("Propriété Exclusive d'AFG Bank Gabon S.A.")
                                .url("https://afgbank.ga/legal-notices")))
                .servers(Arrays.asList(
                        new Server().url("/api").description("Serveur de Développement Local (Vite Reverse Proxy)"),
                        new Server().url("https://archives-api.afgbank.ga/api").description("Passerelle de Production Cloud DMZ Sécurisée")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)
                                .description("Saisissez votre jeton JWT de session dans le format : `Bearer <votre_token>`")));
    }
}
