package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.CartItem;
import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Cart", description = "Các API quản lý giỏ hàng của người dùng")
public class CartController {

    @Autowired
    private CartService cartService;

    // 1. XEM GIỎ HÀNG
    @GetMapping
    @Operation(summary = "Xem chi tiết giỏ hàng của người dùng hiện tại")
    public ResponseEntity<?> viewCart(HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Vui lòng đăng nhập để xem giỏ hàng"));
        }

        List<CartItem> cartItems = cartService.getCartItems(currentUser.getId());
        Double total = cartService.getCartTotal(currentUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("cartItems", cartItems);
        response.put("total", total != null ? total : 0.0);

        return ResponseEntity.ok(response);
    }

    // 2. THÊM VÀO GIỎ HÀNG
    @PostMapping("/add")
    @Operation(summary = "Thêm sản phẩm vào giỏ hàng")
    public ResponseEntity<?> addToCart(
            @RequestBody AddToCartRequest request,
            HttpSession session) {

        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Vui lòng đăng nhập để thêm vào giỏ hàng"));
        }

        try {
            int quantity = request.getQuantity() != null ? request.getQuantity() : 1;
            cartService.addToCart(currentUser.getId(), request.getProductId(), quantity);
            return ResponseEntity.ok(Map.of("message", "Thêm sản phẩm vào giỏ hàng thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. CẬP NHẬT SỐ LƯỢNG
    @PutMapping("/{cartItemId}")
    @Operation(summary = "Cập nhật số lượng của một sản phẩm trong giỏ hàng")
    public ResponseEntity<?> updateQuantity(
            @PathVariable("cartItemId") Long cartItemId,
            @RequestBody UpdateCartRequest request) {
        try {
            cartService.updateQuantity(cartItemId, request.getQuantity());
            return ResponseEntity.ok(Map.of("message", "Cập nhật số lượng thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi cập nhật: " + e.getMessage()));
        }
    }

    // 4. XÓA SẢN PHẨM KHỎI GIỎ
    @DeleteMapping("/{cartItemId}")
    @Operation(summary = "Xóa một sản phẩm khỏi giỏ hàng")
    public ResponseEntity<?> removeItem(@PathVariable("cartItemId") Long cartItemId) {
        try {
            cartService.removeFromCart(cartItemId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa: " + e.getMessage()));
        }
    }

    // --- Các lớp DTO để nhận JSON từ Frontend ---
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartRequest {
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}