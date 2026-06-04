package ga.afgbank.archivesrh.dto;

import lombok.*;
import java.util.List;

/**
 * Details of an activated employee returned to frontend.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String matricule;
    private String fullName;
    private String email;
    private String position;
    private String photoUrl;
    private String department;
    private boolean active;
    private String agencyName;
    private List<String> roles;
}
