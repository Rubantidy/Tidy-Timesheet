package timesheet.admin.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.Holidays;

public interface HolidayRepo extends JpaRepository<Holidays, Integer> {

}
