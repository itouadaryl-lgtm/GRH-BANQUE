package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entity capturing inter-agency file-share access requests and delegation approvals.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "access_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String requester;

    @Column(nullable = false, length = 200)
    private String document;

    @Column(nullable = false, length = 400)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "En attente"; // En attente, Approuvé, Rejeté
}
