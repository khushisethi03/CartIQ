package in.khushi_Bill.billingsoftware.io;

import lombok.Data;

@Data
public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;

}