package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing indexable document categories.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "document_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 250)
    private String description;

    @Column(name = "retention_period", length = 50)
    private String expectedRetentionPeriod;
}
