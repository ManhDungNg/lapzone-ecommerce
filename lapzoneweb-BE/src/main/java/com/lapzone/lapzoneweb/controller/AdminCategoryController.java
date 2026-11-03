package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Category;
import com.lapzone.lapzoneweb.model.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController // Đổi thành RestController để trả về JSON
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/admin/categories") // Thêm tiền tố /api để tách biệt rõ ràng
@Tag(name = "Admin Category", description = "Các API quản lý danh mục sản phẩm dành cho Admin")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;

    // 1. Hiển thị danh sách danh mục
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả danh mục")
    public ResponseEntity<List<Category>> listCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // 2. Thêm mới danh mục (Dùng POST)
    @PostMapping
    @Operation(summary = "Thêm mới một danh mục")
    public ResponseEntity<?> createCategory(@RequestBody Category categoryRequest) {
        try {
            Category category = new Category();
            category.setName(categoryRequest.getName());
            
            Category savedCategory = categoryService.saveCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi thêm mới: " + e.getMessage()));
        }
    }

    // 3. Cập nhật danh mục (Dùng PUT và truyền ID lên URL)
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục theo ID")
    public ResponseEntity<?> updateCategory(@PathVariable("id") Long id, @RequestBody Category categoryRequest) {
        try {
            Category existingCategory = categoryService.getCategoryById(id);
            if (existingCategory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy danh mục với ID: " + id));
            }
            
            existingCategory.setName(categoryRequest.getName());
            Category updatedCategory = categoryService.saveCategory(existingCategory);
            
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi cập nhật: " + e.getMessage()));
        }
    }

    // 4. Xóa danh mục (Dùng DELETE và truyền ID lên URL)
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục theo ID")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa danh mục thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa! (Có thể do danh mục này đang chứa sản phẩm)"));
        }
    }
}