package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Order;
import com.lapzone.lapzoneweb.model.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin Order", description = "Các API quản lý đơn hàng dành cho Admin")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    @Operation(summary = "Tìm kiếm và lấy danh sách đơn hàng theo bộ lọc")
    public ResponseEntity<Map<String, Object>> listOrders(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        
        // BƯỚC 1: Xóa sổ chuỗi rỗng từ React. Nếu là chuỗi rỗng thì chuyển thành null để bỏ qua bộ lọc này
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        if (status != null && status.trim().isEmpty()) {
            status = null;
        }

        if (endDate != null) {
            Calendar cal = Calendar.getInstance();
            cal.setTime(endDate);
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            endDate = cal.getTime();
        }

        List<Order> orders = orderService.searchOrders(keyword, status, startDate, endDate);

        Map<String, Object> response = new HashMap<>();
        // Đóng gói mảng đúng vào key "orders" khớp với cấu hình bóc tách ở Frontend
        response.put("orders", orders);
        response.put("keyword", keyword);
        response.put("status", status);

        return ResponseEntity.ok(response);
    }

    // BƯỚC 2: Đồng bộ hóa đường dẫn và cấu trúc dữ liệu JSON với Frontend React
    @PutMapping("/update-status")
    @Operation(summary = "Cập nhật trạng thái của một đơn hàng")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> payload) {
        try {
            // Lấy ID và trạng thái mới từ JSON Object React gửi lên
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            String newStatus = payload.get("newStatus").toString();
            
            orderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok(Map.of("message", "Cập nhật đơn hàng #" + orderId + " thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi cập nhật: " + e.getMessage()));
        }
    }
}