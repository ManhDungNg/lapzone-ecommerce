package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Order;
import com.lapzone.lapzoneweb.model.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Order Lookup", description = "API Tra cứu và xem chi tiết đơn hàng dành cho khách hàng")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 1. Gộp xử lý Tra cứu và Lấy chi tiết vào 1 API duy nhất
    @PostMapping("/lookup")
    @Operation(summary = "Tra cứu đơn hàng bằng Mã đơn và Số điện thoại")
    public ResponseEntity<?> processLookup(@RequestBody OrderLookupRequest request) {
        try {
            // Tìm đơn hàng theo ID
            Order order = orderService.getOrderById(request.getOrderId());
            
            // Bảo mật: Kiểm tra xem Số điện thoại khách nhập có KHỚP với SĐT lúc đặt hàng không
            if (order.getCustomerPhone().equals(request.getCustomerPhone().trim())) {
                // Nếu đúng, trả về luôn dữ liệu đơn hàng
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không khớp với đơn hàng này!"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy mã đơn hàng #" + request.getOrderId()));
        }
    }

    // 2. Lấy chi tiết đơn hàng (Dành cho việc user đã đăng nhập vào xem lịch sử)
    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn hàng theo ID")
    public ResponseEntity<?> viewOrderDetail(@PathVariable("id") Long id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy đơn hàng"));
        }
    }

    // --- DTO để nhận JSON từ Frontend ---
    public static class OrderLookupRequest {
        private Long orderId;
        private String customerPhone;

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    }
}