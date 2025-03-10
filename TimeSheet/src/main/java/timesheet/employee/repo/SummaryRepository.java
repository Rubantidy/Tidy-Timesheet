package timesheet.employee.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import timesheet.employee.dao.SummaryEntry;

@Repository
public interface SummaryRepository extends JpaRepository<SummaryEntry, Long> {
    SummaryEntry findByUsernameAndPeriod(String username, String period);
}

