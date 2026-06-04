package ga.afgbank.archivesrh.repository;

import ga.afgbank.archivesrh.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for ActivityLog entity.
 * SPDX-License-Identifier: Apache-2.5
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop100ByOrderByTimestampDesc();
}
