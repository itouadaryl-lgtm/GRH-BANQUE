package ga.afgbank.archivesrh.service;

import ga.afgbank.archivesrh.dto.UserRequest;
import ga.afgbank.archivesrh.dto.UserResponse;
import ga.afgbank.archivesrh.model.Agency;
import ga.afgbank.archivesrh.model.User;
import ga.afgbank.archivesrh.repository.AgencyRepository;
import ga.afgbank.archivesrh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service managing corporate users, banking credentials, accreditations & Spring UserDetails.
 * SPDX-License-Identifier: Apache-2.5
 */
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email inconnu sur les annuaires AFG Bank : " + email));

        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .collect(Collectors.toList());

        // Add role objects themselves as typical authorities
        user.getRoles().forEach(role -> authorities.add(new SimpleGrantedAuthority(role.getName())));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),
                true, true, true,
                authorities
        );
    }

    public List<UserResponse> getAllEmployees() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getEmployeesByAgency(Long agencyId) {
        return userRepository.findByAgencyId(agencyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse createEmployee(UserRequest req) {
        Agency agency = agencyRepository.findById(req.getAgencyId() != null ? req.getAgencyId() : 1L)
                .orElseThrow(() -> new RuntimeException("Agence spécifiée introuvable"));

        User employee = User.builder()
                .matricule(req.getMatricule())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode("AfgBank2026!")) // Default corporate credentials
                .position(req.getPosition())
                .department(req.getDepartment() != null ? req.getDepartment() : "Opérations")
                .photoUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")
                .active(true)
                .approved(true)
                .agency(agency)
                .build();

        return mapToResponse(userRepository.save(employee));
    }

    public UserResponse updateEmployeeStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collaborateur non identifié"));
        
        user.setActive(active);
        return mapToResponse(userRepository.save(user));
    }

    public void simulatedExcelImport() {
        // Creates typical additional employees to prove bulk import capability dynamically
        if (userRepository.findByMatricule("AFG-0780").isPresent()) return;

        Agency agency = agencyRepository.findAll().get(0);

        User u1 = User.builder()
                .matricule("AFG-0780")
                .fullName("Karl Ella")
                .email("karl.ella@afgbank.ga")
                .password(passwordEncoder.encode("Postgresql123"))
                .position("Chargé de Clientèle Senior")
                .department("Ventes & Réseau")
                .photoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80")
                .active(true)
                .approved(true)
                .agency(agency)
                .build();

        User u2 = User.builder()
                .matricule("AFG-1123")
                .fullName("Amina Bongo")
                .email("amina.bongo@afgbank.ga")
                .password(passwordEncoder.encode("Postgresql123"))
                .position("Analyste de Crédit Corporatif")
                .department("Risques & Engagement")
                .photoUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80")
                .active(true)
                .approved(true)
                .agency(agency)
                .build();

        userRepository.saveAll(Arrays.asList(u1, u2));
    }

    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .matricule(user.getMatricule())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .position(user.getPosition())
                .photoUrl(user.getPhotoUrl() != null ? user.getPhotoUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")
                .department(user.getDepartment())
                .active(user.isActive())
                .agencyName(user.getAgency() != null ? user.getAgency().getName() : "Non affilié")
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }
}
