package ga.afgbank.archivesrh.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Access request representation returned to client for multi-agency workspace approvals.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessRequestDto {
    private Long id;
    private String requester;
    private String document;
    private String reason;
    private LocalDateTime date;
    private String status;
}
