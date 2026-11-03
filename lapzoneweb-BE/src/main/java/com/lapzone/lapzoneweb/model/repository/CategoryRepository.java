package com.lapzone.lapzoneweb.model.repository;

import com.lapzone.lapzoneweb.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}