package com.lapzone.lapzoneweb.controller;

import com.lapzone.lapzoneweb.model.entity.Category;
import com.lapzone.lapzoneweb.model.repository.CategoryRepository;// Đảm bảo bạn đã có interface này nhé
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")// Giúp mở cổng cho React gọi sang mà không bị chặn CORS
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        // Lấy toàn bộ danh sách Hãng từ database
        List<Category> categories = categoryRepository.findAll();
        
        // Trả về cho Frontend với mã 200 OK
        return ResponseEntity.ok(categories);
    }
}