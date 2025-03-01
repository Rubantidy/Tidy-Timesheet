package timesheet.employee.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.employee.timesheetdao.Timesheet;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    Timesheet findByEmployeeNameAndPeriod(String employeeName, String period);
}
