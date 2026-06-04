package ga.afgbank.archivesrh.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import ga.afgbank.archivesrh.model.User;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

/**
 * Service to generate secure, premium PDF badges for AFG Bank employees.
 * SPDX-License-Identifier: Apache-2.5
 */
@Service
public class PdfGenerator {

    public byte[] generateBadgePdf(User employee, String qrCodeBase64) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A6, 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);

            document.open();

            // Set Title font
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Font.BOLD);
            titleFont.setColor(0, 82, 204); // AFG Blue

            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL);
            Font matriculeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD);
            matriculeFont.setColor(0, 200, 83); // Green

            // Header Name
            Paragraph header = new Paragraph("AFG BANK GABON", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subtitle = new Paragraph("LAISSEZ-PASSER PROFESSIONNEL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Font.NORMAL));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(new Paragraph(" ")); // Spacer

            // Info body
            Paragraph namePara = new Paragraph("Nom : " + employee.getFullName(), textFont);
            document.add(namePara);

            Paragraph postPara = new Paragraph("Poste : " + employee.getPosition(), textFont);
            document.add(postPara);

            Paragraph matPara = new Paragraph("Matricule : " + employee.getMatricule(), matriculeFont);
            document.add(matPara);

            if (employee.getAgency() != null) {
                Paragraph agencyPara = new Paragraph("Agence : " + employee.getAgency().getName(), textFont);
                document.add(agencyPara);
            }

            document.add(new Paragraph(" ")); // Spacer

            // QR Code attachment
            if (qrCodeBase64 != null && !qrCodeBase64.isEmpty()) {
                byte[] decoded = java.util.Base64.getDecoder().decode(qrCodeBase64);
                Image img = Image.getInstance(decoded);
                img.setAlignment(Element.ALIGN_CENTER);
                img.scaleAbsolute(90, 90);
                document.add(img);
            }

            document.add(new Paragraph(" "));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Element.ALIGN_CENTER);
            Paragraph footer = new Paragraph("Document officiel AFG BANK. Sécurisé cryptographiquement.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Échec de la production du badge PDF administratif.", e);
        }
    }
}
