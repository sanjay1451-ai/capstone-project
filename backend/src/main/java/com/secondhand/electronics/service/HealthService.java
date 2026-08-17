package com.secondhand.electronics.service;

import com.secondhand.electronics.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    public HealthResponse checkHealth() {
        return new HealthResponse(
                "Backend is running",
                activeProfile,
                appVersion
        );
    }
}
