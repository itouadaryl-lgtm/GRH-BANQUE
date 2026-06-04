package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.SystemParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for SystemParameter entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface SystemParameterRepository extends JpaRepository<SystemParameter, String> {
}
