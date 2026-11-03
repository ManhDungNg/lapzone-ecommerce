package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin User", description = "Các API quản lý tài khoản và phân quyền dành cho Admin")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // 1. Hiển thị danh sách khách hàng / người dùng
    @GetMapping
    @Operation(summary = "Lấy danh sách toàn bộ người dùng")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 2. Thay đổi quyền (Role)
    @PutMapping("/{id}/role")
    @Operation(summary = "Cập nhật quyền (Role) cho người dùng")
    public ResponseEntity<?> updateRole(
            @PathVariable("id") Long userId, 
            @RequestParam("role") String role) {
        try {
            User user = userService.getUserById(userId);
            user.setRole(role); // Vd: "ROLE_ADMIN" hoặc "ROLE_USER"
            userService.saveUser(user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật quyền cho người dùng thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. Xóa tài khoản
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài khoản người dùng")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa tài khoản thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa do người này đã có lịch sử mua hàng!"));
        }
    }
}