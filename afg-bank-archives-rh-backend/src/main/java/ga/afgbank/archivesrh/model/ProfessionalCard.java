package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity governing professional cards / access credentials generated in PDF.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "professional_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(name = "card_no", nullable = false, unique = true, length = 50)
    private String cardNo;

    @Lob
    @Column(name = "qr_code_base64")
    private String qrCodeBase64;

    @Column(name = "pdf_path", length = 300)
    private String pdfPath;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
