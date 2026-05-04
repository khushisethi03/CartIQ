package in.khushi_Bill.billingsoftware.service;

import in.khushi_Bill.billingsoftware.entity.ActivityLogEntity;

import java.util.List;

public interface ActivityLogService {

    void log(Long userId, String action, String description);

    List<ActivityLogEntity> getLogs(Long userId);
}
