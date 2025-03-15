package timesheet.employee.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import timesheet.employee.dao.SummaryEntry;
import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.SummaryRepository;
import timesheet.employee.repo.TimesheetRepository;

@Service
public class TimesheetService {
    
	 @Autowired
	    private TimesheetRepository timesheetRepository;
	 
	 @Autowired
	    private SummaryRepository summaryRepository;

	    public List<TimesheetEntry> getTimesheet(String username, String period) {
	        return timesheetRepository.findByUsernameAndPeriod(username, period);
	    }
	    
	
 
	    public void saveOrUpdateTimesheet(List<TimesheetEntry> timesheetEntries) {
	        for (TimesheetEntry entry : timesheetEntries) {
	            Optional<TimesheetEntry> existingEntry = timesheetRepository.findByUsernameAndPeriodAndCellIndex(
	                    entry.getUsername(), entry.getPeriod(), entry.getCellIndex()
	            );

	            if (existingEntry.isPresent()) {
	                TimesheetEntry updateEntry = existingEntry.get();

	                if (entry.getHours() == null || entry.getHours().trim().isEmpty()) {
	                    // ✅ Delete the cleared cell entry from the database
	                  
	                    timesheetRepository.delete(updateEntry);
	                } else {
	                    // ✅ Update charge code and hours if a value exists
	                    updateEntry.setChargeCode(entry.getChargeCode());
	                    updateEntry.setHours(entry.getHours());
	                    timesheetRepository.save(updateEntry);
	                }
	            } else {
	                if (entry.getHours() != null && !entry.getHours().trim().isEmpty()) {
	                    // ✅ Save new entry if it has a value
	                    timesheetRepository.save(entry);
	                }
	            }
	        }
	    }

	    public boolean approveTimesheet(String username, String period) {
	        // Fetch the timesheet entry for the user and period
	        SummaryEntry timesheet = summaryRepository.findByUsernameAndPeriod(username, period);
	        
	        if (timesheet != null) { // Check if entry exists
	            timesheet.setStatus("Approved"); // ✅ Update status to Approved
	            summaryRepository.save(timesheet); // ✅ Save the updated status
	            return true; // ✅ Successfully updated
	        }

	        return false; // ❌ No entry found
	    }

	    public boolean raiseIssue(String username, String period, String issueMessage) {
	    	
	    	System.out.println("issue service called");
	        // Fetch the timesheet entry for the user and period
	        SummaryEntry timesheet = summaryRepository.findByUsernameAndPeriod(username, period);

	        if (timesheet != null) { // Entry exists
	            // Log the issue in the database (but don't change status)
	            System.out.println("Issue raised for " + username + " | Period: " + period + " | Issue: " + issueMessage);

	         // ✅ Update status to "Issue"
	            timesheet.setStatus("Issue");
	            summaryRepository.save(timesheet); 
	            // Here you can extend to notify the employee via email/notification if needed

	            return true;
	        }
	        return false; // Entry not found
	    }
}

