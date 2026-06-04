package ga.afgbank.archivesrh.service;

import ga.afgbank.archivesrh.dto.DocumentResponse;
import ga.afgbank.archivesrh.model.*;
import ga.afgbank.archivesrh.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service to manage indexations, folder placements, soft-deletes and hard retention purges of scanned PDF files.
 * SPDX-License-Identifier: Apache-2.5
 */
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final UserRepository userRepository;
    private final AgencyRepository agencyRepository;
    private final FileStorageService fileStorageService;

    public List<DocumentResponse> getActiveDocuments() {
        return documentRepository.findByIsDeleted(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DocumentResponse> getDeletedDocuments() {
        return documentRepository.findByIsDeleted(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DocumentResponse uploadDocument(MultipartFile file, Long employeeId, String typeCode, Long uploaderId, Long agencyId) {
        String storedName = fileStorageService.storeFile(file);
        String sha256 = fileStorageService.computeSHA256(file);

        DocumentType docType = documentTypeRepository.findByCode(typeCode)
                .orElseGet(() -> documentTypeRepository.findAll().get(0));

        User employee = null;
        if (employeeId != null) {
            employee = userRepository.findById(employeeId).orElse(null);
        }

        User uploader = userRepository.findById(uploaderId != null ? uploaderId : 1L)
                .orElseThrow(() -> new RuntimeException("Auteur du dépôt non certifié"));

        Agency agency = agencyRepository.findById(agencyId != null ? agencyId : 1L)
                .orElseGet(() -> agencyRepository.findAll().get(0));

        Document doc = Document.builder()
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedName)
                .hashSha256(sha256)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .documentType(docType)
                .employee(employee)
                .uploadedBy(uploader)
                .uploadDate(LocalDateTime.now())
                .isDeleted(false)
                .agency(agency)
                .build();

        return mapToResponse(documentRepository.save(doc));
    }

    public void softDeleteDocument(Long id, String executorUsername) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archive introuvable"));
        doc.setDeleted(true);
        doc.setDeletedAt(LocalDateTime.now());
        doc.setDeletedBy(executorUsername);
        documentRepository.save(doc);
    }

    public void restoreDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archive introuvable"));
        doc.setDeleted(false);
        doc.setDeletedAt(null);
        doc.setDeletedBy(null);
        documentRepository.save(doc);
    }

    public void hardDeleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Archive introuvable"));
        documentRepository.delete(doc);
    }

    public void emptyTrash() {
        List<Document> deletedDocs = documentRepository.findByIsDeleted(true);
        documentRepository.deleteAll(deletedDocs);
    }

    private DocumentResponse mapToResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .originalFileName(doc.getOriginalFileName())
                .fileSize(doc.getFileSize())
                .mimeType(doc.getMimeType())
                .typeName(doc.getDocumentType() != null ? doc.getDocumentType().getName() : "Inconnue")
                .typeCode(doc.getDocumentType() != null ? doc.getDocumentType().getCode() : "INC")
                .employeeName(doc.getEmployee() != null ? doc.getEmployee().getFullName() : "Général Banque")
                .uploadedBy(doc.getUploadedBy() != null ? doc.getUploadedBy().getFullName() : "Système")
                .uploadDate(doc.getUploadDate())
                .isDeleted(doc.isDeleted())
                .deletedAt(doc.getDeletedAt())
                .deletedBy(doc.getDeletedBy())
                .hashSha256(doc.getHashSha256())
                .build();
    }
}
