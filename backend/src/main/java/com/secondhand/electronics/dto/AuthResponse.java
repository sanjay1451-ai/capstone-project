package com.secondhand.electronics.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserResponseDTO user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserResponseDTO user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserResponseDTO getUser() {
        return user;
    }

    public void setUser(UserResponseDTO user) {
        this.user = user;
    }
}
