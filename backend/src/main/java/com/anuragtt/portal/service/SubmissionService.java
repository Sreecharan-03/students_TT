package com.anuragtt.portal.service;

import com.anuragtt.portal.dto.SubmissionResponse;
import com.anuragtt.portal.entity.ProjectSubmission;
import com.anuragtt.portal.repository.ProjectSubmissionRepository;
import java.io.IOException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SubmissionService {

    private final ProjectSubmissionRepository projectSubmissionRepository;

    public SubmissionService(ProjectSubmissionRepository projectSubmissionRepository) {
        this.projectSubmissionRepository = projectSubmissionRepository;
    }

    public SubmissionResponse createSubmission(
        String name,
        String rollNo,
        String year,
        String department,
        String section,
        String projectTitle,
        String githubLink,
        String liveLink,
        MultipartFile prototypePdf
    ) {
        String fileName = null;
        String pdfContentType = null;
        byte[] pdfContent = null;

        if (prototypePdf != null && !prototypePdf.isEmpty()) {
            fileName = prototypePdf.getOriginalFilename() == null ? "prototype.pdf" : prototypePdf.getOriginalFilename();
            boolean isPdf = "application/pdf".equalsIgnoreCase(prototypePdf.getContentType())
                || fileName.toLowerCase().endsWith(".pdf");

            if (!isPdf) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
            }

            pdfContentType = prototypePdf.getContentType() == null ? "application/pdf" : prototypePdf.getContentType();
        }

        try {
            ProjectSubmission submission = new ProjectSubmission();
            submission.setName(name);
            submission.setRollNo(rollNo);
            submission.setYear(year);
            submission.setDepartment(department);
            submission.setSection(section);
            submission.setProjectTitle(projectTitle);
            submission.setGithubLink(githubLink);
            submission.setLiveLink(liveLink);
            submission.setPdfName(fileName);
            submission.setPdfContentType(pdfContentType);
            submission.setPdfContent(prototypePdf == null || prototypePdf.isEmpty() ? null : prototypePdf.getBytes());
            submission.setStarred(false);
            submission.setSubmittedAt(Instant.now());

            return toResponse(projectSubmissionRepository.save(submission));
        } catch (DataIntegrityViolationException exception) {
            String details = exception.getMostSpecificCause() == null
                ? "Invalid data for submission"
                : exception.getMostSpecificCause().getMessage();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, details, exception);
        } catch (RuntimeException exception) {
            String details = exception.getCause() == null
                ? exception.getMessage()
                : exception.getCause().getMessage();
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                details == null ? "Unable to save submission" : details,
                exception
            );
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store PDF file", exception);
        }
    }

    public List<SubmissionResponse> getSubmissions(String search, String year, String department, String section) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();

        return projectSubmissionRepository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt")).stream()
            .filter(submission -> normalizedSearch.isBlank()
                || String.join(" ",
                    submission.getName(),
                    submission.getRollNo(),
                    submission.getProjectTitle(),
                    submission.getDepartment(),
                    submission.getSection())
                    .toLowerCase()
                    .contains(normalizedSearch))
            .filter(submission -> year == null || year.isBlank() || year.equals(submission.getYear()))
            .filter(submission -> department == null || department.isBlank() || department.equals(submission.getDepartment()))
            .filter(submission -> section == null || section.isBlank() || section.equals(submission.getSection()))
            .sorted(Comparator.comparing(ProjectSubmission::isStarred).reversed()
                .thenComparing(ProjectSubmission::getSubmittedAt).reversed())
            .map(this::toResponse)
            .toList();
    }

    public SubmissionResponse toggleStar(Long submissionId) {
        ProjectSubmission submission = findById(submissionId);
        submission.setStarred(!submission.isStarred());
        return toResponse(projectSubmissionRepository.save(submission));
    }

    public void deleteSubmission(Long submissionId) {
        ProjectSubmission submission = findById(submissionId);
        projectSubmissionRepository.delete(submission);
    }

    private ProjectSubmission findById(Long submissionId) {
        return projectSubmissionRepository.findById(submissionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
    }

    private SubmissionResponse toResponse(ProjectSubmission submission) {
        return new SubmissionResponse(
            submission.getId(),
            submission.getName(),
            submission.getRollNo(),
            submission.getYear(),
            submission.getDepartment(),
            submission.getSection(),
            submission.getProjectTitle(),
            submission.getGithubLink(),
            submission.getLiveLink(),
            submission.getPdfName(),
            submission.isStarred(),
            submission.getSubmittedAt()
        );
    }
}
