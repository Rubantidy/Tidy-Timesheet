package timesheet.nextYear;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import timesheet.admin.dao.AllowedLeaves;
import timesheet.admin.dao.CasualLeaveTracker;
import timesheet.admin.repo.AllowedLeavesRepository;
import timesheet.admin.repo.CasualLeaveTrackerRepo;
import timesheet.admin.repo.EmployeeRepo;

@Component
public class YearlyLeaveResetJob {

    private final AllowedLeavesRepository allowedLeaveRepo;
    private final CasualLeaveTrackerRepo casualLeaveTrackerRepo;
    private final EmployeeRepo employeeRepo;

    public YearlyLeaveResetJob(AllowedLeavesRepository allowedLeaveRepo, CasualLeaveTrackerRepo casualLeaveTrackerRepo, EmployeeRepo employeeRepo) {
        this.allowedLeaveRepo = allowedLeaveRepo;
        this.casualLeaveTrackerRepo = casualLeaveTrackerRepo;
        this.employeeRepo = employeeRepo;
    }

    // Run this job every year on January 1st at 00:05 am
    @Scheduled(cron = "0 5 0 1 1 *")
    public void createLeaveRecordsForNewYear() {
        int newYear = LocalDate.now().getYear(); 
        List<String> allUsernames = employeeRepo.findAllUsernames(); // get all active usernames
        
        for (String username : allUsernames) {
            // Create AllowedLeaves if not exists for new year
            if (!allowedLeaveRepo.existsByUsernameAndYear(username, newYear)) {
                AllowedLeaves allowedLeaves = new AllowedLeaves(username, newYear);
                // Reset leave counters to zero
                allowedLeaves.setBaseCasualTaken(0);
                allowedLeaves.setSickTaken(0);
                allowedLeaves.setFloatingTaken(0);
                allowedLeaves.setCasualTaken(0);
                allowedLeaves.setEarncasualLeave(0);
                allowedLeaveRepo.save(allowedLeaves);
            }

            // Create CasualLeaveTracker for all months in the new year
            for (int month = 1; month <= 12; month++) {
                if (!casualLeaveTrackerRepo.existsByUsernameAndYearAndMonth(username, newYear, month)) {
                    CasualLeaveTracker tracker = new CasualLeaveTracker(username, newYear, month);
                    casualLeaveTrackerRepo.save(tracker);
                }
            }
        }

        System.out.println("Leave records for year " + newYear + " created and reset.");
    }
}
