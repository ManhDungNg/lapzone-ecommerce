package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Order;
import com.lapzone.lapzoneweb.model.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin General", description = "Các API thống kê Dashboard dành cho Admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ======================= DASHBOARD & BÁO CÁO =======================
    @GetMapping("/dashboard")
    @Operation(summary = "Lấy dữ liệu thống kê cho Dashboard")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        
        if (startDate == null || endDate == null) {
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            endDate = cal.getTime();
            cal.add(Calendar.DAY_OF_MONTH, -7);
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            startDate = cal.getTime();
        } else {
            Calendar cal = Calendar.getInstance();
            cal.setTime(endDate);
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            endDate = cal.getTime();
        }

        List<Order> orders = adminService.getCompletedOrdersBetweenDates(startDate, endDate);
        Double totalRevenue = adminService.calculateRevenueBetweenDates(startDate, endDate);
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("startDate", sdf.format(startDate));
        responseData.put("endDate", sdf.format(endDate));
        responseData.put("countProducts", adminService.countProducts());
        responseData.put("countUsers", adminService.countUsers());
        responseData.put("countOrders", orders.size());
        responseData.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        responseData.put("orders", orders);
        
        return ResponseEntity.ok(responseData);
    }

    @GetMapping(value = "/dashboard/export", produces = "text/csv")
    @Operation(summary = "Xuất báo cáo doanh thu ra file CSV")
    public void exportReportCSV(
            @RequestParam(value = "startDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(value = "endDate") @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            HttpServletResponse response) {
        try {
            Calendar cal = Calendar.getInstance();
            cal.setTime(endDate);
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            endDate = cal.getTime();
            
            List<Order> orders = adminService.getCompletedOrdersBetweenDates(startDate, endDate);
            Double totalRevenue = adminService.calculateRevenueBetweenDates(startDate, endDate);
            
            response.setContentType("text/csv; charset=UTF-8");
            String fileName = "BaoCao_DoanhThu_Lapzone";
            SimpleDateFormat fileSdf = new SimpleDateFormat("ddMMyyyy");
            if (startDate != null && endDate != null) {
                fileName += "_Tu_" + fileSdf.format(startDate) + "_Den_" + fileSdf.format(endDate);
            } else {
                fileName += "_" + fileSdf.format(new Date());
            }
            fileName += ".csv";
            
            response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
            PrintWriter writer = response.getWriter();
            writer.write('\ufeff'); // BOM
            writer.println("Mã đơn hàng,Khách hàng,Số điện thoại,Ngày tạo,Trạng thái,Tổng tiền (VNĐ)");
            
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            for (Order o : orders) {
                String line = String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",%.0f",
                        o.getId(),
                        o.getCustomerName().replace("\"", "\"\""),
                        o.getCustomerPhone(),
                        sdf.format(o.getOrderDate()),
                        o.getStatus(),
                        o.getTotalAmount()
                );
                writer.println(line);
            }
            writer.println(",,,,Tổng Doanh Thu:," + String.format("%.0f", totalRevenue != null ? totalRevenue : 0.0));
            writer.flush();
            writer.close();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    // ======================= BẢO MẬT =======================
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất Admin")
    public ResponseEntity<?> logout(HttpSession session) {
        session.removeAttribute("currentUser");
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Đã đăng xuất thành công"));
    }
}