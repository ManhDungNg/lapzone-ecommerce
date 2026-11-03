package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.dto.UserLoginDTO;
import com.lapzone.lapzoneweb.model.dto.UserRegisterDTO;
import com.lapzone.lapzoneweb.model.service.AuthService;
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
import com.lapzone.lapzoneweb.model.entity.User;

// IMPORT BỔ SUNG CHO SPRING SECURITY
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Authentication", description = "API Đăng ký và Xác thực tài khoản")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản người dùng mới")
    public ResponseEntity<?> handleRegister(
            @Valid @RequestBody UserRegisterDTO registerDTO, 
            BindingResult result) {
        
        // 1. Kiểm tra lỗi định dạng từ DTO (Validation)
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            // Trả về HTTP 400 kèm danh sách lỗi chi tiết cho từng field
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        
        // 2. Kiểm tra mật khẩu khớp nhau
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu xác nhận không khớp!"));
        }
        
        // 3. Thực hiện đăng ký qua Service
        if (authService.register(registerDTO)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Đăng ký thành công! Hãy đăng nhập."));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Email hoặc Số điện thoại đã tồn tại!"));
    }
    
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực người dùng bằng Email hoặc Số điện thoại")
    public ResponseEntity<?> handleLogin(
            @Valid @RequestBody UserLoginDTO loginDTO, 
            BindingResult result,
            HttpSession session) { 
        
        // 1. Kiểm tra lỗi không nhập liệu
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }
        
        User loggedInUser = authService.login(loginDTO);
        
        if (loggedInUser != null) {
            // LƯU SESSION: Giúp các Controller thông thường nhận diện được User
            session.setAttribute("currentUser", loggedInUser);
            
            // THÊM MỚI: Khai báo quyền cho Spring Security
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(loggedInUser.getRole())
            );
            
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                loggedInUser.getEmail(), 
                null, 
                authorities
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Lưu Context này vào Session để dữ liệu phân quyền tồn tại ở các API khác (như trang Admin)
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
            
            // Lấy Role từ Database và nhét vào JSON trả về
            return ResponseEntity.ok(Map.of(
                "message", "Đăng nhập thành công!",
                "role", loggedInUser.getRole(),
                "fullName", loggedInUser.getFullName(),
                "token", "chuoi-token-gia-lap-de-test-react"
            ));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tài khoản hoặc mật khẩu không chính xác!"));
    }
}