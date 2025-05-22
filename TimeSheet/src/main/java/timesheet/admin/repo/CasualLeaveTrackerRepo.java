package timesheet.admin.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.CasualLeaveTracker;

public interface CasualLeaveTrackerRepo extends JpaRepository<CasualLeaveTracker, Long> {
    boolean existsByUsernameAndYearAndMonth(String username, int year, int month);

	CasualLeaveTracker findByUsernameAndYearAndMonth(String username, int currentYear, int currentMonth);
}

