package com.lapzone.lapzoneweb.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. KÍCH HOẠT CORS CHO REACT
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. TẮT CSRF
            .csrf(csrf -> csrf.disable())
            
            // 3. VÔ HIỆU HÓA FORM LOGIN CŨ
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            
            // QUAN TRỌNG: Yêu cầu Spring Security tự động duy trì bộ nhớ phân quyền (Session)
            .securityContext(context -> context.requireExplicitSave(false))
            
            // 4. PHÂN QUYỀN CÁC ĐƯỜNG DẪN
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                .requestMatchers("/api/auth/**", "/api/home/**", "/api/categories/**", "/api/products/**").permitAll()
                
                // ĐÃ SỬA: Bổ sung "/assets/**" để React có thể lấy được ảnh hiển thị
                .requestMatchers("/uploads/**", "/assets/**").permitAll()
                
                // Yêu cầu quyền ADMIN
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                
                .anyRequest().permitAll() 
            )
            
            // 5. CẤU HÌNH LOGOUT API
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}