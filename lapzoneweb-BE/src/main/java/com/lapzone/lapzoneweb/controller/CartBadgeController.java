package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.CartItem;
import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Cart Badge", description = "API quản lý thông tin giỏ hàng cho Client")
public class CartBadgeController {

    @Autowired
    private CartService cartService;

    // Thay thế cho @ModelAttribute("cartItemCount")
    @GetMapping("/count")
    @Operation(summary = "Lấy tổng số lượng sản phẩm trong giỏ hàng (hiển thị trên Badge Header)")
    public ResponseEntity<Map<String, Integer>> getCartItemCount(HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        
        if (currentUser == null) {
            // Nếu chưa đăng nhập, trả về 0 thay vì lỗi để Frontend tự hiểu
            return ResponseEntity.ok(Map.of("count", 0));
        }

        List<CartItem> items = cartService.getCartItems(currentUser.getId());
        int totalCount = 0;
        for (CartItem item : items) {
            totalCount += item.getQuantity();
        }
        
        return ResponseEntity.ok(Map.of("count", totalCount));
    }
}