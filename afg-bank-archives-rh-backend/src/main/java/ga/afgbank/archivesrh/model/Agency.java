package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing an AFG Bank Agency.
 * Multi-Agency segregation element.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "agencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    @Column(name = "director_name", length = 100)
    private String directorName;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
