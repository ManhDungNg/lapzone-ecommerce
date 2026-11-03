package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.repository.CategoryRepository;
import com.lapzone.lapzoneweb.model.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Home", description = "API cung cấp dữ liệu hiển thị cho Trang chủ")
public class HomeController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductService productService;

    @GetMapping
    @Operation(summary = "Lấy dữ liệu trang chủ (Danh mục, Sản phẩm theo hãng, Sản phẩm mới)")
    public ResponseEntity<Map<String, Object>> getHomeData(
            @RequestParam(value = "categoryId", required = false) Long categoryId) {
        
        Map<String, Object> response = new HashMap<>();
        
        // 1. LUÔN LUÔN TRUYỀN DANH MỤC: Để giao diện luôn vẽ được các nút bấm tên hãng
        response.put("categories", categoryRepository.findAll());
        response.put("selectedCatId", categoryId);
        
        // 2. XỬ LÝ LOGIC HIỂN THỊ
        if (categoryId != null) {
            // NẾU CÓ CHỌN HÃNG: Lấy danh sách máy của hãng đó
            response.put("products", productService.getProductsByCategoryId(categoryId));
        } else {
            // NẾU KHÔNG CHỌN HÃNG (Trang chủ mặc định): Giữ nguyên các block hiển thị
            response.put("referenceProducts", productService.getNewProducts());
            
            // ĐÃ SỬA: Lấy danh sách sản phẩm mới nhất thay vì chỉ lấy hãng Lenovo
            response.put("laptopProducts", productService.getNewProducts()); 
            
            // Mục riêng cho Apple Macbook (giữ nguyên để đúng thiết kế UI)
            response.put("appleProducts", productService.getProductsByBrand("Apple"));
            
            response.put("newProducts", productService.getNewProducts());
        }
        
        return ResponseEntity.ok(response);
    }
}