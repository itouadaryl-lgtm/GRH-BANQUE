package ga.afgbank.archivesrh.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Registered activities returned under administrative telemetry.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private String username;
    private String action;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
