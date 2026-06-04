package ga.afgbank.archivesrh.controller;

import ga.afgbank.archivesrh.model.User;
import ga.afgbank.archivesrh.repository.UserRepository;
import ga.afgbank.archivesrh.service.PdfGenerator;
import ga.afgbank.archivesrh.service.QRCodeGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Endpoint to issue secure, QR-coded PDF Badges / Professional Cards.
 * SPDX-License-Identifier: Apache-2.5
 */
@RestController
@RequestMapping("/professional-cards")
@RequiredArgsConstructor
@Tag(name = "Badges & Cartes Professionnelles", description = "Endpoints de production de cartes d'identité professionnelles QR & PDF")
@CrossOrigin(origins = "*")
public class CardController {

    private final UserRepository userRepository;
    private final QRCodeGenerator qrCodeGenerator;
    private final PdfGenerator pdfGenerator;

    @GetMapping("/employee/{employeeId}/qrcode")
    @Operation(summary = "Obtenir l'image QR d'accréditation en Base64 pour l'écran badge")
    public ResponseEntity<String> getQRCode(@PathVariable Long employeeId) {
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Collaborateur non présent dans la base"));

        String accreditationInfo = "AFG BANK GABON \n" +
                "Nom : " + user.getFullName() + "\n" +
                "Poste : " + user.getPosition() + "\n" +
                "Matricule : " + user.getMatricule();

        String qrBase64 = qrCodeGenerator.generateQRCodeBase64(accreditationInfo, 200, 200);
        return ResponseEntity.ok(qrBase64);
    }

    @GetMapping("/employee/{employeeId}/download")
    @Operation(summary = "Télécharger le laisser-passer PDF haute définition pour impression physique")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long employeeId) {
        User user = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Collaborateur non présent dans la base"));

        String accreditationInfo = "AFG BANK GABON \n" +
                "Nom : " + user.getFullName() + "\n" +
                "Poste : " + user.getPosition() + "\n" +
                "Matricule : " + user.getMatricule();

        String qrBase64 = qrCodeGenerator.generateQRCodeBase64(accreditationInfo, 150, 150);
        byte[] pdfBytes = pdfGenerator.generateBadgePdf(user, qrBase64);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Badge_" + user.getMatricule() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
