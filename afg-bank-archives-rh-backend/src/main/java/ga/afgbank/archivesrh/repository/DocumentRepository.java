package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for Document entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByAgencyIdAndIsDeleted(Long agencyId, boolean isDeleted);
    List<Document> findByIsDeleted(boolean isDeleted);
}
