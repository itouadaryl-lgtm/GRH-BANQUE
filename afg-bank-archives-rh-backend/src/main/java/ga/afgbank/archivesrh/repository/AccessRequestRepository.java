package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.AccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for AccessRequest entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, Long> {
}
