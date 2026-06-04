package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing an individual fine-grained permission.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 250)
    private String description;
}
