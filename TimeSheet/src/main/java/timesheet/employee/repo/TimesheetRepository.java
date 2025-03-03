package timesheet.employee.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import timesheet.employee.dao.TimesheetEntry;

@Repository
public interface TimesheetRepository extends JpaRepository<TimesheetEntry, Long> {
    
    List<TimesheetEntry> findByUsernameAndPeriod(String username, String period);

    Optional<TimesheetEntry> findByUsernameAndPeriodAndChargeCodeAndCellIndex(
            String username, String period, String chargeCode, String cellIndex
    );
}


