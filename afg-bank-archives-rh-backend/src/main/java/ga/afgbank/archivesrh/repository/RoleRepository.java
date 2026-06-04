package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for Role entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
