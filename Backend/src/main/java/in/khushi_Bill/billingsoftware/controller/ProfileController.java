package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.io.ChangePasswordRequest;
import in.khushi_Bill.billingsoftware.io.UpdateProfileRequest;
import in.khushi_Bill.billingsoftware.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Principal principal
    ) {

        userService.updateName(
                principal.getName(),
                request.getName()
        );

        return ResponseEntity.ok("Profile updated successfully");
    }
    @PutMapping("/profile/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal principal
    ) {

        userService.changePassword(
                principal.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        return ResponseEntity.ok("Password updated successfully");
    }
}