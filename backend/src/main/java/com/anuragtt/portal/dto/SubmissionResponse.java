package com.anuragtt.portal.dto;

import java.time.Instant;

public record SubmissionResponse(
    Long id,
    String name,
    String rollNo,
    String year,
    String department,
    String section,
    String projectTitle,
    String githubLink,
    String liveLink,
    String pdfName,
    boolean starred,
    Instant submittedAt
) {
}
