package com.lapzone.lapzoneweb.model.service;

import com.lapzone.lapzoneweb.model.entity.Product;
import com.lapzone.lapzoneweb.model.entity.ProductImage;
import com.lapzone.lapzoneweb.model.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // Đã import MultipartFile

import java.io.InputStream;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getNewProducts() {
        return productRepository.findTop8ByOrderByIdDesc();
    }

    public List<Product> getReferenceProducts() {
        return productRepository.findTop4ByOrderByIdDesc();
    }

    public List<Product> getProductsByBrand(String brand) {
        return productRepository.findByCategory_Name(brand);
    }

    public List<Product> getRelatedProducts(Long categoryId, Long productId) {
        return productRepository.findTop4ByCategoryIdAndIdNot(categoryId, productId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public org.springframework.data.domain.Page<Product> searchProducts(
            String keyword, Long categoryId, Double minPrice, Double maxPrice, 
            String cpu, String gpu, String ram, String storage, String screen, 
            org.springframework.data.domain.Pageable pageable) {
        String kw = (keyword != null) ? keyword : ""; 
        String cpuFilter = (cpu != null && !cpu.trim().isEmpty()) ? cpu : null;
        String gpuFilter = (gpu != null && !gpu.trim().isEmpty()) ? gpu : null;
        String ramFilter = (ram != null && !ram.trim().isEmpty()) ? ram : null;
        String storageFilter = (storage != null && !storage.trim().isEmpty()) ? storage : null;
        String screenFilter = (screen != null && !screen.trim().isEmpty()) ? screen : null;
        
        return productRepository.searchAndFilterProducts(kw, categoryId, minPrice, maxPrice, cpuFilter, gpuFilter, ramFilter, storageFilter, screenFilter, pageable);
    }

    @Transactional
    public void saveProduct(Product product) {
        productRepository.save(product);
    }
   
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    // ==========================================
    // LOGIC UPLOAD ẢNH ĐƯỢC CHUYỂN TỪ DỰ ÁN CŨ SANG
    // ==========================================

    @Transactional
    public void saveProductWithImages(Product product, MultipartFile imageFile, MultipartFile[] subImages) {
      
        if (imageFile != null && !imageFile.isEmpty()) {
            String mainName = imageFile.getOriginalFilename();
            saveFileToFolder(imageFile, mainName);
            product.setImage(mainName);
        }
        if (subImages != null && subImages.length > 0) {
            List<ProductImage> listSubImages = new ArrayList<>();
            int limit = Math.min(subImages.length, 4); 
            for (int i = 0; i < limit; i++) {
                MultipartFile file = subImages[i];
                if (!file.isEmpty()) {
                    String subName = file.getOriginalFilename();
                    saveFileToFolder(file, subName);
                    
                    ProductImage pi = new ProductImage();
                    pi.setImageUrl(subName);
                    pi.setProduct(product);
                    listSubImages.add(pi);
                }
            }
            if (!listSubImages.isEmpty()) {
                product.setImages(listSubImages);
            }
        }
        productRepository.save(product);
    }

    private void saveFileToFolder(MultipartFile file, String fileName) {
        try {
            // Có thể đổi đường dẫn này trỏ sang thư mục React nếu muốn (vd: "../lapzoneweb-fe/public/assets/")
            Path path = Paths.get("src/main/resources/static/assets/");
            if (!Files.exists(path)) Files.createDirectories(path);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) { 
            e.printStackTrace(); 
        }
    }
}