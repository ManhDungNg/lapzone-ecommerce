package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Order;
import com.lapzone.lapzoneweb.model.entity.OrderDetail;
import com.lapzone.lapzoneweb.model.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/invoices")
@PreAuthorize("hasAuthority('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin Invoice", description = "Các API quản lý và thống kê Hóa đơn")
public class AdminInvoiceController {

    @Autowired
    private OrderService orderService;

    // 1. LẤY DANH SÁCH HÓA ĐƠN VÀ THỐNG KÊ DOANH THU THÁNG
    @GetMapping
    @Operation(summary = "Lấy danh sách hóa đơn và doanh thu tháng")
    public ResponseEntity<Map<String, Object>> listInvoices(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {

        if (endDate != null) {
            endDate = adjustEndDate(endDate);
        }
        
        List<Order> invoices = orderService.getValidInvoices(startDate, endDate);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        
        Map<String, Object> response = new HashMap<>();
        response.put("invoices", invoices);
        response.put("monthlyRevenue", orderService.getCurrentMonthRevenue());
        if (startDate != null) response.put("startDate", sdf.format(startDate));
        if (endDate != null) response.put("endDate", sdf.format(endDate));

        return ResponseEntity.ok(response);
    }

    // 1.5. LẤY DỮ LIỆU BÁO CÁO DOANH THU CHI TIẾT
    @GetMapping("/report")
    @Operation(summary = "Lấy dữ liệu báo cáo doanh thu theo hãng (dùng để in hoặc vẽ biểu đồ)")
    public ResponseEntity<Map<String, Object>> getReportData(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {

        if (endDate != null) {
            endDate = adjustEndDate(endDate);
        }
        
        List<Order> invoices = orderService.getValidInvoices(startDate, endDate);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        
        double totalRevenue = invoices.stream().mapToDouble(Order::getTotalAmount).sum();
        
        Map<String, Double> brandRevenue = new HashMap<>();
        Map<String, Integer> brandQuantity = new HashMap<>();

        for (Order order : invoices) {
            if (order.getOrderDetails() != null) {
                for (OrderDetail detail : order.getOrderDetails()) {
                    String brandName = (detail.getProduct() != null && detail.getProduct().getCategory() != null)
                            ? detail.getProduct().getCategory().getName()
                            : "Khác";

                    brandRevenue.put(brandName, brandRevenue.getOrDefault(brandName, 0.0) + (detail.getPrice() * detail.getQuantity()));
                    brandQuantity.put(brandName, brandQuantity.getOrDefault(brandName, 0) + detail.getQuantity());
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("invoices", invoices);
        response.put("startDateStr", startDate != null ? sdf.format(startDate) : "Đầu kỳ");
        response.put("endDateStr", endDate != null ? sdf.format(endDate) : sdf.format(new Date()));
        response.put("totalRevenue", totalRevenue);
        response.put("totalOrders", invoices.size());
        response.put("brandRevenue", brandRevenue);
        response.put("brandQuantity", brandQuantity);

        return ResponseEntity.ok(response);
    }

    // 2. CHỨC NĂNG XUẤT EXCEL CỰC ĐỈNH
    @GetMapping("/export-excel")
    @Operation(summary = "Xuất danh sách hóa đơn ra file Excel")
    public void exportToExcel(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            HttpServletResponse response) throws IOException {

        if (endDate != null) {
            endDate = adjustEndDate(endDate);
        }

        response.setContentType("application/octet-stream");
        String fileName = "ChungTu_Lapzone";
        SimpleDateFormat fileSdf = new SimpleDateFormat("ddMMyyyy");
        if (startDate != null && endDate != null) {
            fileName += "_Tu_" + fileSdf.format(startDate) + "_Den_" + fileSdf.format(endDate);
        } else {
            fileName += "_" + fileSdf.format(new Date());
        }
        fileName += ".xlsx";

        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        List<Order> invoices = orderService.getValidInvoices(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Hóa đơn");
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Mã HĐ", "Khách hàng", "Số điện thoại", "Ngày tạo", "Trạng thái", "Tổng tiền"};
            
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            for (Order order : invoices) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue("#" + order.getId());
                row.createCell(1).setCellValue(order.getCustomerName());
                row.createCell(2).setCellValue(order.getCustomerPhone());
                row.createCell(3).setCellValue(sdf.format(order.getOrderDate()));
                row.createCell(4).setCellValue(order.getStatus());
                row.createCell(5).setCellValue(order.getTotalAmount());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }

    // 3. XỬ LÝ CẬP NHẬT HÓA ĐƠN
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin hóa đơn")
    public ResponseEntity<?> updateInvoice(
            @PathVariable("id") Long invoiceId,
            @RequestBody InvoiceUpdateDTO updateData) {
        try {
            orderService.updateInvoiceDetails(
                    invoiceId, 
                    updateData.getCustomerName(), 
                    updateData.getCustomerPhone(), 
                    updateData.getAddress(), 
                    updateData.getTotalAmount(), 
                    updateData.getStatus()
            );
            return ResponseEntity.ok(Map.of("message", "Cập nhật hóa đơn #" + invoiceId + " thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi cập nhật: " + e.getMessage()));
        }
    }

    // 4. XỬ LÝ XÓA HÓA ĐƠN
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa vĩnh viễn hóa đơn")
    public ResponseEntity<?> deleteInvoice(@PathVariable("id") Long invoiceId) {
        try {
            orderService.deleteInvoiceAndDetails(invoiceId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn hóa đơn #" + invoiceId + " cùng các chứng từ liên quan!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa hóa đơn: " + e.getMessage()));
        }
    }

    // --- Helper Method ---
    private Date adjustEndDate(Date endDate) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(endDate);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        return cal.getTime();
    }

    // --- DTO Class ---
    public static class InvoiceUpdateDTO {
        private String customerName;
        private String customerPhone;
        private String address;
        private Double totalAmount;
        private String status;

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}