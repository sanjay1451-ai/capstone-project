package com.secondhand.electronics.dto;

import java.time.LocalDateTime;

public class HealthResponse {

    private String status;
    private String environment;
    private LocalDateTime timestamp;
    private String version;

    public HealthResponse() {
    }

    public HealthResponse(String status) {
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.version = "1.0.0";
    }

    public HealthResponse(String status, String environment, String version) {
        this.status = status;
        this.environment = environment;
        this.timestamp = LocalDateTime.now();
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
