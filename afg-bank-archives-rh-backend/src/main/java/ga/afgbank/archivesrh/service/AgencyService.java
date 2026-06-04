package ga.afgbank.archivesrh.service;

import ga.afgbank.archivesrh.model.Agency;
import ga.afgbank.archivesrh.repository.AgencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service to manage AFG Bank corporate agencies query.
 * SPDX-License-Identifier: Apache-2.5
 */
@Service
@RequiredArgsConstructor
public class AgencyService {

    private final AgencyRepository agencyRepository;

    public List<Agency> getAllAgencies() {
        return agencyRepository.findAll();
    }

    public Agency getAgencyById(Long id) {
        return agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agence bancaire non identifiée"));
    }
}
