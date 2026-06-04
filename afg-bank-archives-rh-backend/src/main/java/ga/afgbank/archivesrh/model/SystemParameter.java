package ga.afgbank.archivesrh.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity to persist key-value pairs of general settings/parameters.
 * SPDX-License-Identifier: Apache-2.5
 */
@Entity
@Table(name = "system_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemParameter {

    @Id
    @Column(name = "param_key", nullable = false, length = 100)
    private String paramKey;

    @Column(name = "param_value", nullable = false, columnDefinition = "TEXT")
    private String paramValue;

    @Column(length = 250)
    private String description;
}
