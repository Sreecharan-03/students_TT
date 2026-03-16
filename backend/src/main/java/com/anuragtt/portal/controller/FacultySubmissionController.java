package com.anuragtt.portal.controller;

import com.anuragtt.portal.dto.SubmissionResponse;
import com.anuragtt.portal.service.SubmissionService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculty/submissions")
public class FacultySubmissionController {

    private final SubmissionService submissionService;

    public FacultySubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping
    public List<SubmissionResponse> getSubmissions(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String year,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) String section
    ) {
        return submissionService.getSubmissions(search, year, department, section);
    }

    @PatchMapping("/{submissionId}/star")
    public SubmissionResponse toggleStar(@PathVariable Long submissionId) {
        return submissionService.toggleStar(submissionId);
    }

    @DeleteMapping("/{submissionId}")
    public void deleteSubmission(@PathVariable Long submissionId) {
        submissionService.deleteSubmission(submissionId);
    }
}
