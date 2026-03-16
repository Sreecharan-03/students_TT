package com.anuragtt.portal.service;

import com.anuragtt.portal.repository.FacultyUserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class FacultyUserDetailsService implements UserDetailsService {

    private final FacultyUserRepository facultyUserRepository;

    public FacultyUserDetailsService(FacultyUserRepository facultyUserRepository) {
        this.facultyUserRepository = facultyUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return facultyUserRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("Faculty user not found"));
    }
}
