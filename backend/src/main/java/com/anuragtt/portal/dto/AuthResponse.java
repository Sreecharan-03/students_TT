package com.anuragtt.portal.dto;

public record AuthResponse(
    String token,
    String name,
    String email
) {
}
