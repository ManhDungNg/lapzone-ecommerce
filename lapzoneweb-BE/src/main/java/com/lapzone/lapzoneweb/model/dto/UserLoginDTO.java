package com.lapzone.lapzoneweb.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data; 

@Data
public class UserLoginDTO {
    
    @NotBlank(message = "Vui lòng nhập Email hoặc Số điện thoại")
    private String identifier; 

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}