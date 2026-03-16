package com.anuragtt.portal.controller;

import com.anuragtt.portal.dto.SubmissionResponse;
import com.anuragtt.portal.service.SubmissionService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/public/submissions")
public class PublicSubmissionController {

    private final SubmissionService submissionService;

    public PublicSubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public SubmissionResponse createSubmission(
        @RequestParam String name,
        @RequestParam String rollNo,
        @RequestParam String year,
        @RequestParam String department,
        @RequestParam String section,
        @RequestParam String projectTitle,
        @RequestParam String githubLink,
        @RequestParam String liveLink,
        @RequestPart(required = false) MultipartFile prototypePdf
    ) {
        return submissionService.createSubmission(
            name,
            rollNo,
            year,
            department,
            section,
            projectTitle,
            githubLink,
            liveLink,
            prototypePdf
        );
    }
}
