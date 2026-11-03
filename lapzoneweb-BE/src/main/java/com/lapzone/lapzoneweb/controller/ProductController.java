package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Product;
import com.lapzone.lapzoneweb.model.repository.CategoryRepository;
import com.lapzone.lapzoneweb.model.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Product (Public)", description = "Các API hiển thị và tìm kiếm sản phẩm dành cho Khách hàng")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. CHI TIẾT SẢN PHẨM
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một sản phẩm và các sản phẩm liên quan")
    public ResponseEntity<?> getProductDetail(@PathVariable("id") Long id) {
        Product product = productService.getProductById(id);
        
        if (product != null) {
            List<Product> relatedProducts = productService.getRelatedProducts(
                    product.getCategory().getId(), 
                    product.getId()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("product", product);
            response.put("relatedProducts", relatedProducts);
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Không tìm thấy sản phẩm"));
        }
    }

    // 2. TÌM KIẾM VÀ LỌC SẢN PHẨM CÓ PHÂN TRANG
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm và lọc sản phẩm (hỗ trợ phân trang và sắp xếp)")
    public ResponseEntity<?> searchProducts(
            @RequestParam(value = "query", required = false, defaultValue = "") String query,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "cpu", required = false) String cpu,     
            @RequestParam(value = "gpu", required = false) String gpu,
            @RequestParam(value = "ram", required = false) String ram,
            @RequestParam(value = "storage", required = false) String storage,
            @RequestParam(value = "screen", required = false) String screen,
            @RequestParam(value = "sort", defaultValue = "newest") String sort,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        
        int pageSize = 9;
        Sort sortObj;
        
        if ("price_asc".equals(sort)) {
            sortObj = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equals(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "price");
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "id");
        }
        
        Pageable pageable = PageRequest.of(page, pageSize, sortObj);
        Page<Product> productPage = productService.searchProducts(
                query, categoryId, minPrice, maxPrice, cpu, gpu, ram, storage, screen, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("currentPage", productPage.getNumber());
        response.put("totalPages", productPage.getTotalPages());
        response.put("totalElements", productPage.getTotalElements());
        
        // Hỗ trợ thêm tên danh mục nếu Frontend cần hiển thị tiêu đề "Sản phẩm thuộc hãng X"
        if (categoryId != null) {
            categoryRepository.findById(categoryId).ifPresent(cat -> 
                response.put("selectedCategoryName", cat.getName())
            );
        }
        
        return ResponseEntity.ok(response);
    }
}