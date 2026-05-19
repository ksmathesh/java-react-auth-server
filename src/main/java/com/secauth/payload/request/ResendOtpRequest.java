package com.secauth.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ResendOtpRequest {
    @NotBlank
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
