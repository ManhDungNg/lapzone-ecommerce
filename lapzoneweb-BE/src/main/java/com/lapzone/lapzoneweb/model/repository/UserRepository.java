package com.lapzone.lapzoneweb.model.repository;

import com.lapzone.lapzoneweb.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByEmail(String email);
    User findByPhone(String phone);
    User findByEmailOrPhone(String email, String phone);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    User findByEmailAndPhone(String email, String phone);
}