package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.ProfessionalCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for ProfessionalCard entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface ProfessionalCardRepository extends JpaRepository<ProfessionalCard, Long> {
    Optional<ProfessionalCard> findByEmployeeId(Long employeeId);
    Optional<ProfessionalCard> findByCardNo(String cardNo);
}
