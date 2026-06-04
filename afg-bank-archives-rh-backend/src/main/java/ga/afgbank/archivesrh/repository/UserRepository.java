package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMatricule(String matricule);
    List<User> findByAgencyId(Long agencyId);
}
