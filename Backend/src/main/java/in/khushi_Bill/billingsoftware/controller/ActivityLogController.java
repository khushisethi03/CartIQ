package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.entity.ActivityLogEntity;
import in.khushi_Bill.billingsoftware.service.ActivityLogService;
import in.khushi_Bill.billingsoftware.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final UserService userService;

    @GetMapping
    public List<ActivityLogEntity> getLogs(Authentication auth) {
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        return activityLogService.getLogs(userId);
    }
}