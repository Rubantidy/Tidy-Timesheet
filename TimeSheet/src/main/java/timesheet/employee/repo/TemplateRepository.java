package timesheet.employee.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import timesheet.employee.dao.TimesheetTemplate;



@Repository
public interface TemplateRepository extends JpaRepository<TimesheetTemplate, Long> {
    List<TimesheetTemplate> findByUsername(String username);
    TimesheetTemplate findByUsernameAndChargeCode(String username, String chargeCode);
}