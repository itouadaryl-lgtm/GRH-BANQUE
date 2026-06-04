package ga.afgbank.archivesrh.dto;

import lombok.*;
import java.util.List;

/**
 * DTO containing token info and user meta back upon successful sign-in.
 * SPDX-License-Identifier: Apache-2.5
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private Long id;
    private String matricule;
    private String fullName;
    private String email;
    private String position;
    private String photoUrl;
    private String agencyName;
    private List<String> roles;
    private List<String> permissions;
}
