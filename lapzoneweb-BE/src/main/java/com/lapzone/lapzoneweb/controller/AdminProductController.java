package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Category;
import com.lapzone.lapzoneweb.model.entity.Product;
import com.lapzone.lapzoneweb.model.entity.ProductDetail;
import com.lapzone.lapzoneweb.model.service.ProductService; // Dùng ProductService chuẩn của dự án mới
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Tag(name = "Admin Product", description = "Các API quản lý kho sản phẩm dành cho Admin")
public class AdminProductController {

    @Autowired
    private ProductService productService; 

    @GetMapping
    @Operation(summary = "Lấy danh sách toàn bộ sản phẩm")
    public ResponseEntity<?> listProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Thêm mới hoặc cập nhật sản phẩm")
    public ResponseEntity<?> saveProduct(
            @ModelAttribute Product product,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "subImages", required = false) MultipartFile[] subImages) {
        
        try {
            // Gắn Category ID để tránh lỗi null khóa ngoại như trong Terminal báo
            if (categoryId != null) {
                Category cat = new Category();
                cat.setId(categoryId);
                product.setCategory(cat);
            }

            // Gắn liên kết 2 chiều cho ProductDetail để lưu đủ cấu hình máy
            if (product.getProductDetail() != null) {
                product.getProductDetail().setProduct(product);
            } else {
                product.setProductDetail(new ProductDetail());
                product.getProductDetail().setProduct(product);
            }

            // Mặc định số lượng
            if (product.getStock() == null) {
                product.setStock(1);
            }

            // Lưu sản phẩm và ảnh
            productService.saveProductWithImages(product, imageFile, subImages);
            return ResponseEntity.ok(Map.of("message", "Thêm/Cập nhật sản phẩm thành công!"));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi lưu sản phẩm: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công!"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa sản phẩm vì đang có trong đơn hàng hoặc giỏ hàng."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa sản phẩm: " + e.getMessage()));
        }
    }

    // LẤY CHI TIẾT SẢN PHẨM ĐỂ ĐỔ VÀO FORM SỬA
    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết một sản phẩm theo ID")
    public ResponseEntity<?> getProductById(@PathVariable("id") Long id) {
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy sản phẩm"));
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

 // CẬP NHẬT SẢN PHẨM (Đã sửa lỗi mất ảnh cũ và mất hãng)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật sản phẩm (Hỗ trợ upload ảnh)")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") Long id,
            @ModelAttribute Product product,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "subImages", required = false) MultipartFile[] subImages) {
        
        try {
            // 1. Lấy sản phẩm hiện tại trong Database ra
            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy sản phẩm"));
            }
            
            // 2. Chép dữ liệu text từ form sang sản phẩm cũ (Giữ nguyên ảnh cũ nếu không up ảnh mới)
            existingProduct.setName(product.getName());
            existingProduct.setPrice(product.getPrice());
            if (product.getStock() != null) {
                existingProduct.setStock(product.getStock());
            }
            
            // 3. Cập nhật Hãng (Category)
            if (categoryId != null) {
                com.lapzone.lapzoneweb.model.entity.Category cat = new com.lapzone.lapzoneweb.model.entity.Category();
                cat.setId(categoryId);
                existingProduct.setCategory(cat);
            }

            // 4. Cập nhật Cấu hình (ProductDetail)
            if (product.getProductDetail() != null) {
                if (existingProduct.getProductDetail() == null) {
                    existingProduct.setProductDetail(new com.lapzone.lapzoneweb.model.entity.ProductDetail());
                    existingProduct.getProductDetail().setProduct(existingProduct);
                }
                existingProduct.getProductDetail().setCpu(product.getProductDetail().getCpu());
                existingProduct.getProductDetail().setRam(product.getProductDetail().getRam());
                existingProduct.getProductDetail().setGpu(product.getProductDetail().getGpu());
                existingProduct.getProductDetail().setScreen(product.getProductDetail().getScreen());
                existingProduct.getProductDetail().setMoreInfo(product.getProductDetail().getMoreInfo());
            }

            
            productService.saveProductWithImages(existingProduct, imageFile, subImages);
            return ResponseEntity.ok(Map.of("message", "Cập nhật sản phẩm thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi cập nhật sản phẩm: " + e.getMessage()));
        }
    }
}