package in.khushi_Bill.billingsoftware.service.impl;

import in.khushi_Bill.billingsoftware.entity.ActivityLogEntity;
import in.khushi_Bill.billingsoftware.repository.ActivityLogRepository;
import in.khushi_Bill.billingsoftware.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void log(Long userId, String action, String description) {
        ActivityLogEntity log = ActivityLogEntity.builder()
                .userId(userId)
                .action(action)
                .description(description)
                .build();

        activityLogRepository.save(log);
    }

    @Override
    public List<ActivityLogEntity> getLogs(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}