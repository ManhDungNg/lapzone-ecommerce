package com.lapzone.lapzoneweb.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    private String name; 
    private Double price; 
    private Integer stock; 
    private String image; 

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    // THAY ĐỔI Ở ĐÂY: Dùng JsonIgnoreProperties để React vẫn nhận được ID và Tên Hãng
    @JsonIgnoreProperties("products") 
    private Category category; 

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private ProductDetail productDetail; 

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> images; 
}