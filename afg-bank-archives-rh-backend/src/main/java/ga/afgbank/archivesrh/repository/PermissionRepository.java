package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for Permission entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(String name);
}
