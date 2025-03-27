package timesheet.employee.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import timesheet.employee.dao.LeaveEntry;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveEntry, Long> {

    @Query("SELECT COALESCE(SUM(l.leaveDays), 0) FROM LeaveEntry l WHERE l.username = :username AND l.year = :year AND l.month = :month AND l.leaveType = 'Casual Leave'")
    Float getTotalCasualLeave(@Param("username") String username, @Param("year") int year, @Param("month") int month);

    @Query("SELECT COALESCE(SUM(l.leaveDays), 0) FROM LeaveEntry l WHERE l.username = :username AND l.year = :year AND l.leaveType = 'Sick Leave'")
    Float getTotalSickLeave(@Param("username") String username, @Param("year") int year);

    @Modifying
    @Transactional
    @Query("UPDATE LeaveEntry l SET l.leaveDays = :leaveDays WHERE l.username = :username AND l.year = :year AND l.month = :month AND l.leaveType = :leaveType AND l.period = :period")
    int updateLeave(@Param("username") String username, @Param("year") int year, @Param("month") int month, 
                    @Param("leaveType") String leaveType, @Param("leaveDays") float leaveDays, @Param("period") String period);


    @Modifying
    @Transactional
    @Query(value = "INSERT INTO leave_entries (username, year, month, leave_type, leave_days, period) VALUES (:username, :year, :month, :leaveType, :leaveDays, :period)", nativeQuery = true)
    void insertLeave(@Param("username") String username, @Param("year") int year, @Param("month") int month, @Param("leaveType") String leaveType, @Param("leaveDays") float leaveDays, @Param("period") String period);
}



