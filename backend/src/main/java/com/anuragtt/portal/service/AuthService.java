package com.anuragtt.portal.service;

import com.anuragtt.portal.dto.AuthResponse;
import com.anuragtt.portal.dto.LoginRequest;
import com.anuragtt.portal.dto.SignupRequest;
import com.anuragtt.portal.entity.FacultyUser;
import com.anuragtt.portal.repository.FacultyUserRepository;
import com.anuragtt.portal.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final FacultyUserRepository facultyUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
        FacultyUserRepository facultyUserRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService
    ) {
        this.facultyUserRepository = facultyUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        if (facultyUserRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Faculty account already exists");
        }

        try {
            FacultyUser facultyUser = new FacultyUser();
            facultyUser.setName(request.name());
            facultyUser.setEmail(request.email().toLowerCase());
            facultyUser.setPassword(passwordEncoder.encode(request.password()));

            FacultyUser savedUser = facultyUserRepository.save(facultyUser);
            String token = jwtService.generateToken(savedUser);
            return new AuthResponse(token, savedUser.getName(), savedUser.getEmail());
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Unable to create faculty account. Check data and try again.",
                exception
            );
        }
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
        );

        FacultyUser facultyUser = facultyUserRepository.findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        String token = jwtService.generateToken(facultyUser);
        return new AuthResponse(token, facultyUser.getName(), facultyUser.getEmail());
    }
}
