package in.khushi_Bill.billingsoftware.service;

import in.khushi_Bill.billingsoftware.entity.UserEntity;
import in.khushi_Bill.billingsoftware.io.UserRequest;
import in.khushi_Bill.billingsoftware.io.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    String getUserRole(String email);

    UserEntity getUserByEmail(String email); // new add

    List<UserResponse> readUsers();

    void deleteUser(String id);
}
