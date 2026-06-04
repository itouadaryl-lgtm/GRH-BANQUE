package ga.afgbank.archivesrh.config;

import ga.afgbank.archivesrh.model.*;
import ga.afgbank.archivesrh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Bootstraps initial DB parameters: Agencies, Permissions, Default Roles, System config variables, and seed users.
 * SPDX-License-Identifier: Apache-2.5
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AgencyRepository agencyRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final SystemParameterRepository systemParameterRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (agencyRepository.count() > 0) return; // Prevent double bootstrapping

        // 1. Setup Agencies
        Agency siege = Agency.builder().code("AGO-LBV-S1").name("Siège Libreville - Boulevard Triomphal").address("B.P. 2231 Libreville, Gabon").directorName("Christian Ogoula").employeeCount(45).active(true).build();
        Agency akanda = Agency.builder().code("AGO-AKD-A1").name("Agence Akanda - Dispensaire Avorbam").address("Route Nationale, Akanda, Gabon").directorName("Martine Gassita").employeeCount(12).active(true).build();
        Agency pgentil = Agency.builder().code("AGO-POG-P1").name("Agence Port-Gentil").address("Quartier Château, Port-Gentil, Gabon").directorName("Lucien Ndong").employeeCount(18).active(true).build();

        agencyRepository.saveAll(Arrays.asList(siege, akanda, pgentil));

        // 2. Setup System configurations
        systemParameterRepository.save(new SystemParameter("INSTITUTION_NAME", "AFG BANK GABON", "Nom de l'institution"));
        systemParameterRepository.save(new SystemParameter("SYSTEM_TIMEZONE", "Africa/Libreville (WAT)", "Fuseau horaire"));
        systemParameterRepository.save(new SystemParameter("DATE_FORMAT", "Format 2 (DD/MM/YYYY HH:mm)", "Format de date global"));

        // 3. Setup Permissions
        String[] permissionList = {
            "DOCUMENT_READ", "DOCUMENT_CREATE", "DOCUMENT_UPDATE", "DOCUMENT_DELETE", "DOCUMENT_RESTORE",
            "EMPLOYEE_READ", "EMPLOYEE_CREATE", "EMPLOYEE_UPDATE", "EMPLOYEE_DELETE",
            "ACCESS_REQUEST_READ", "ACCESS_REQUEST_CREATE", "ACCESS_REQUEST_APPROVE", "ACCESS_REQUEST_REJECT",
            "AUDIT_LOG_READ", "AUDIT_LOG_EXPORT"
        };

        Map<String, Permission> permMap = new HashMap<>();
        for (String permName : permissionList) {
            Permission p = Permission.builder().name(permName).description("Accréditation : dictionnaire d'actions " + permName).build();
            permissionRepository.save(p);
            permMap.put(permName, p);
        }

        // 4. Setup Roles
        Role superAdminRole = Role.builder().name("ROLE_SUPER_ADMIN").description("Administrateur Général des Systèmes AFG Bank").permissions(new HashSet<>(permMap.values())).build();

        Set<Permission> rhPermissions = new HashSet<>();
        rhPermissions.add(permMap.get("DOCUMENT_READ"));
        rhPermissions.add(permMap.get("DOCUMENT_CREATE"));
        rhPermissions.add(permMap.get("DOCUMENT_UPDATE"));
        rhPermissions.add(permMap.get("DOCUMENT_DELETE"));
        rhPermissions.add(permMap.get("EMPLOYEE_READ"));
        rhPermissions.add(permMap.get("EMPLOYEE_CREATE"));
        rhPermissions.add(permMap.get("EMPLOYEE_UPDATE"));
        Role rhRole = Role.builder().name("ROLE_RH_MANAGER").description("Directeur des Ressources Humaines & Gestionnaire").permissions(rhPermissions).build();

        Set<Permission> auditeurPermissions = new HashSet<>();
        auditeurPermissions.add(permMap.get("DOCUMENT_READ"));
        auditeurPermissions.add(permMap.get("AUDIT_LOG_READ"));
        auditeurPermissions.add(permMap.get("EMPLOYEE_READ"));
        Role auditeurRole = Role.builder().name("ROLE_AUDITEUR").description("Auditeur d'Intégrité Interne & DRC").permissions(auditeurPermissions).build();

        roleRepository.saveAll(Arrays.asList(superAdminRole, rhRole, auditeurRole));

        // 5. Setup Documents categorisation
        DocumentType dtContrat = DocumentType.builder().code("CONTRAT").name("Contrats & Avenants").expectedRetentionPeriod("10 ans").build();
        DocumentType dtSalaire = DocumentType.builder().code("PAYES").name("Bulletins de Salaire").expectedRetentionPeriod("30 ans").build();
        DocumentType dtIdentite = DocumentType.builder().code("IDENTITE").name("Pièces d'identité & Passeports").expectedRetentionPeriod("5 ans").build();
        DocumentType dtAcquisition = DocumentType.builder().code("DIPLOME").name("Diplômes & Certifications").expectedRetentionPeriod("Indéterminé").build();

        documentTypeRepository.saveAll(Arrays.asList(dtContrat, dtSalaire, dtIdentite, dtAcquisition));

        // 6. Setup Seed Users
        User superAdmin = User.builder()
                .matricule("AFG-0010")
                .fullName("Aimé Mbili")
                .email("admin@afgbank.ga")
                .password(passwordEncoder.encode("Postgresql123"))
                .position("Directeur de la Sécurité & DRC")
                .department("Conformité")
                .photoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80")
                .active(true)
                .approved(true)
                .agency(siege)
                .roles(Collections.singleton(superAdminRole))
                .build();

        User rhManager = User.builder()
                .matricule("AFG-0412")
                .fullName("Sophie Dougou")
                .email("hr@afgbank.ga")
                .password(passwordEncoder.encode("Postgresql123"))
                .position("Directrice Générale Adjointe RH")
                .department("Ressources Humaines")
                .photoUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80")
                .active(true)
                .approved(true)
                .agency(siege)
                .roles(Collections.singleton(rhRole))
                .build();

        User auditeur = User.builder()
                .matricule("AFG-0988")
                .fullName("Jean-Marc Ndong")
                .email("audit@afgbank.ga")
                .password(passwordEncoder.encode("Postgresql123"))
                .position("Chef de Mission Audit Interne")
                .department("Audit & Risques")
                .photoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                .active(true)
                .approved(true)
                .agency(akanda)
                .roles(Collections.singleton(auditeurRole))
                .build();

        userRepository.saveAll(Arrays.asList(superAdmin, rhManager, auditeur));
    }
}
