package com.lapzone.lapzoneweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan("com.lapzone.lapzoneweb.model.entity")
public class LapzonewebApplication {

    public static void main(String[] args) {
        SpringApplication.run(LapzonewebApplication.class, args);
        System.out.println("--- LAPZONE SERVER IS RUNNING ---");
    }

}
//http://localhost:8080/swagger-ui/index.html