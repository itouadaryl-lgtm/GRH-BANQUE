package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for Agency entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    Optional<Agency> findByCode(String code);
}
