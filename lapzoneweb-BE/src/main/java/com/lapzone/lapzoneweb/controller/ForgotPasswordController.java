package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Forgot Password", description = "API Quên mật khẩu và Cấp lại mật khẩu")
public class ForgotPasswordController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Kiểm tra xem Email và SĐT có khớp không
    @PostMapping("/verify")
    @Operation(summary = "Xác minh Email và Số điện thoại")
    public ResponseEntity<?> verifyPhone(@RequestBody VerifyRequest request) {
        User user = userRepository.findByEmailAndPhone(request.getEmail(), request.getPhoneNumber());
        
        if (user != null) {
            // Khớp -> Trả về JSON thành công để Frontend chuyển sang trang đặt mật khẩu mới
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xác minh thành công, vui lòng nhập mật khẩu mới.",
                "verifiedEmail", request.getEmail()
            ));
        } else {
            // Không khớp -> Báo lỗi HTTP 400
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Email hoặc Số điện thoại không chính xác!"
            ));
        }
    }

    // 2. Xử lý lưu mật khẩu mới
    @PostMapping("/reset")
    @Operation(summary = "Đặt lại mật khẩu mới")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        
        if (user != null) {
            // Đã kích hoạt mã hóa BCrypt
            user.setPassword(passwordEncoder.encode(request.getNewPassword())); 
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay."
            ));
        }
        
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "error", "Không tìm thấy người dùng với email này!"
        ));
    }

    // --- DTOs để nhận JSON từ Frontend ---
    public static class VerifyRequest {
        private String email;
        private String phoneNumber;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}