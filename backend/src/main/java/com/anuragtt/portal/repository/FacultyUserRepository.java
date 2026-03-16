package com.anuragtt.portal.repository;

import com.anuragtt.portal.entity.FacultyUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyUserRepository extends JpaRepository<FacultyUser, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<FacultyUser> findByEmailIgnoreCase(String email);
}
