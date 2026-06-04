package ga.afgbank.archivesrh.service;

import ga.afgbank.archivesrh.dto.ActivityLogDto;
import ga.afgbank.archivesrh.model.ActivityLog;
import ga.afgbank.archivesrh.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service writing secure administrative logs tracking sensitive operations.
 * SPDX-License-Identifier: Apache-2.5
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final ActivityLogRepository activityLogRepository;

    public void logActivity(String username, String action, String details, String ipAddress) {
        ActivityLog log = ActivityLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLogDto> getGlobalLogs() {
        return activityLogRepository.findTop100ByOrderByTimestampDesc().stream()
                .map(log -> ActivityLogDto.builder()
                        .id(log.getId())
                        .username(log.getUsername())
                        .action(log.getAction())
                        .details(log.getDetails())
                        .ipAddress(log.getIpAddress())
                        .timestamp(log.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }
}
