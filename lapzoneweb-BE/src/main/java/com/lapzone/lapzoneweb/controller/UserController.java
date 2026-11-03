package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.dto.UserUpdateDTO;
import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "User Profile", description = "API quản lý thông tin hồ sơ cá nhân của người dùng")
public class UserController {

    @Autowired
    private UserService userService;

    // 1. LẤY THÔNG TIN HỒ SƠ
    @GetMapping
    @Operation(summary = "Lấy thông tin hồ sơ người dùng hiện tại đang đăng nhập")
    public ResponseEntity<?> showProfile(HttpSession session) {
        User sessionUser = (User) session.getAttribute("currentUser");
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Vui lòng đăng nhập để xem hồ sơ!"));
        }

        User currentUser = userService.findById(sessionUser.getId());
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Không tìm thấy thông tin người dùng!"));
        }

        UserUpdateDTO dto = new UserUpdateDTO(
            currentUser.getId(),
            currentUser.getFullName(),
            currentUser.getPhone(),
            currentUser.getAddress()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("user", currentUser); // Thông tin chi tiết hiển thị
        response.put("userForm", dto);     // Dữ liệu mồi để Frontend fill vào các ô input của form

        return ResponseEntity.ok(response);
    }

    // 2. CẬP NHẬT THÔNG TIN HỒ SƠ
    @PutMapping
    @Operation(summary = "Cập nhật thông tin hồ sơ")
    public ResponseEntity<?> handleUpdateProfile(
            @Valid @RequestBody UserUpdateDTO dto,
            BindingResult result,
            HttpSession session) {
        
        User sessionUser = (User) session.getAttribute("currentUser");
        if (sessionUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Vui lòng đăng nhập để cập nhật hồ sơ!"));
        }

        // Ép cứng ID bằng ID trong session để tránh việc truyền ID giả mạo qua API
        dto.setId(sessionUser.getId());

        // Nếu dữ liệu đầu vào (DTO) vi phạm validation (vd: số điện thoại sai định dạng, tên trống)
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Cập nhật vào DB
        User updatedUser = userService.updateProfileFromDTO(dto);
        
        if (updatedUser != null) {
            // Cập nhật lại thông tin mới nhất vào Session
            session.setAttribute("currentUser", updatedUser);
            
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin thành công!",
                "user", updatedUser
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Có lỗi xảy ra khi lưu vào hệ thống!"));
        }
    }
}