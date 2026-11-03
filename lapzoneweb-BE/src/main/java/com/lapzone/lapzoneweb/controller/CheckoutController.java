package com.lapzone.lapzoneweb.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lapzone.lapzoneweb.model.entity.CartItem;
import com.lapzone.lapzoneweb.model.entity.Order;
import com.lapzone.lapzoneweb.model.entity.Product;
import com.lapzone.lapzoneweb.model.entity.User;
import com.lapzone.lapzoneweb.model.service.OrderService;
import com.lapzone.lapzoneweb.model.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Checkout", description = "API Xử lý thanh toán và đặt hàng")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private PayOS payOS;

    @PostMapping("/process")
    @Operation(summary = "Xử lý chốt đơn hàng (Hỗ trợ cả Giỏ hàng và Mua ngay)")
    public ResponseEntity<?> processCheckout(@RequestBody CheckoutRequestDTO request, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        try {
            Order newOrder;
            if (request.getSelectedItemIds() != null && !request.getSelectedItemIds().isEmpty()) {
                if (currentUser == null) {
                    return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để thanh toán giỏ hàng!"));
                }
                newOrder = orderService.placeOrder(
                        currentUser, request.getCustomerName(), request.getCustomerPhone(),
                        request.getAddress(), request.getSelectedItemIds(), request.getPaymentMethod()
                );
            } else if (request.getBuyNowProductId() != null) {
                Product product = productService.getProductById(request.getBuyNowProductId());
                if (product == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Sản phẩm không tồn tại!"));
                }
                CartItem buyNowItem = new CartItem();
                buyNowItem.setProduct(product);
                buyNowItem.setQuantity(request.getBuyNowQuantity() != null ? request.getBuyNowQuantity() : 1);

                newOrder = orderService.placeOrderBuyNow(
                        currentUser, request.getCustomerName(), request.getCustomerPhone(),
                        request.getAddress(), buyNowItem, request.getPaymentMethod()
                );
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Dữ liệu thanh toán không hợp lệ (Không có sản phẩm nào)!"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đặt hàng thành công!");
            response.put("orderId", newOrder.getId());
            response.put("totalAmount", newOrder.getTotalAmount());
            response.put("paymentMethod", request.getPaymentMethod());

            if ("CHUYEN_KHOAN".equalsIgnoreCase(request.getPaymentMethod())) {
                long orderCode = newOrder.getId();
                long amount = newOrder.getTotalAmount().longValue();
                String description = "Thanh toan don " + orderCode;
                String returnUrl = "http://localhost:5173/thanh-toan-thanh-cong";
                String cancelUrl = "http://localhost:5173/thanh-toan-that-bai";

                CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                        .orderCode(orderCode)
                        .amount(amount)
                        .description(description)
                        .returnUrl(returnUrl)
                        .cancelUrl(cancelUrl)
                        .build();

                var paymentLink = payOS.paymentRequests().create(paymentRequest);
                response.put("checkoutUrl", paymentLink.getCheckoutUrl());
            }
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    // =======================================================
    // API WEBHOOK: Lắng nghe phản hồi tự động từ máy chủ PayOS
    // Đọc trực tiếp JSON bằng ObjectNode của Spring Boot, 100% không lỗi thư viện
    // =======================================================
    @PostMapping("/webhook")
    @Operation(summary = "Webhook nhận kết quả thanh toán tự động từ PayOS")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody ObjectNode webhookBody) {
        try {
            String code = webhookBody.has("code") ? webhookBody.get("code").asText() : "";
            boolean success = webhookBody.has("success") && webhookBody.get("success").asBoolean();
            JsonNode dataNode = webhookBody.get("data");

            // Kiểm tra giao dịch thành công và có dữ liệu đơn hàng
            if (("00".equals(code) || success) && dataNode != null && dataNode.has("orderCode")) {
                long orderId = dataNode.get("orderCode").asLong();

                // Tránh lỗi khi PayOS gửi request test kết nối (orderCode mặc định của PayOS test là 123)
                try {
                    orderService.updateOrderStatus(orderId, "Đã thanh toán");
                    System.out.println("✅ THÀNH CÔNG: Đã nhận được tiền cho đơn hàng LAPZONE-" + orderId);
                } catch (Exception ex) {
                    System.out.println("ℹ️ Nhận tín hiệu test Webhook từ PayOS cho mã đơn: " + orderId);
                }
            }

            Map<String, Object> res = new HashMap<>();
            res.put("error", 0);
            res.put("message", "Ok");
            res.put("data", null);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            System.err.println("❌ LỖI WEBHOOK: " + e.getMessage());
            Map<String, Object> err = new HashMap<>();
            err.put("error", 1);
            err.put("message", e.getMessage());
            err.put("data", null);
            return ResponseEntity.ok(err);
        }
    }

    public static class CheckoutRequestDTO {
        private String customerName;
        private String customerPhone;
        private String address;
        private String paymentMethod;
        private List<Long> selectedItemIds;
        private Long buyNowProductId;
        private Integer buyNowQuantity;

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public List<Long> getSelectedItemIds() { return selectedItemIds; }
        public void setSelectedItemIds(List<Long> selectedItemIds) { this.selectedItemIds = selectedItemIds; }
        public Long getBuyNowProductId() { return buyNowProductId; }
        public void setBuyNowProductId(Long buyNowProductId) { this.buyNowProductId = buyNowProductId; }
        public Integer getBuyNowQuantity() { return buyNowQuantity; }
        public void setBuyNowQuantity(Integer buyNowQuantity) { this.buyNowQuantity = buyNowQuantity; }
    }
}