package com.anuragtt.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotBlank(message = "Faculty name is required")
    String name,

    @Email(message = "Enter a valid email address")
    @NotBlank(message = "Email is required")
    String email,

    @Size(min = 6, message = "Password must be at least 6 characters long")
    String password
) {
}
