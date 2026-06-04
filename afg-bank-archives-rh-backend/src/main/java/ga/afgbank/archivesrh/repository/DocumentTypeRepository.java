package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for DocumentType entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {
    Optional<DocumentType> findByCode(String code);
}
