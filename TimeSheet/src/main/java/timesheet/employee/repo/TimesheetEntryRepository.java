package timesheet.employee.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.employee.timesheetdao.TimesheetEntry;

public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, Long> {
}
