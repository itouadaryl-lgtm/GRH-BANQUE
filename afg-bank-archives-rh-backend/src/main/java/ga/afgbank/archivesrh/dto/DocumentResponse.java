package ga.afgbank.archivesrh.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Details of indexable GED documents returned to client.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {
    private Long id;
    private String originalFileName;
    private Long fileSize;
    private String mimeType;
    private String typeName;
    private String typeCode;
    private String employeeName;
    private String uploadedBy;
    private LocalDateTime uploadDate;
    private boolean isDeleted;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private String hashSha256;
}
