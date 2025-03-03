package timesheet.employee.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.TimesheetRepository;

@Service
public class TimesheetService {
    
	 @Autowired
	    private TimesheetRepository timesheetRepository;

	    public List<TimesheetEntry> getTimesheet(String username, String period) {
	        return timesheetRepository.findByUsernameAndPeriod(username, period);
	    }

	    public void saveOrUpdateTimesheet(List<TimesheetEntry> timesheetEntries) {
	        for (TimesheetEntry entry : timesheetEntries) {
	            Optional<TimesheetEntry> existingEntry = timesheetRepository.findByUsernameAndPeriodAndChargeCodeAndCellIndex(
	                    entry.getUsername(), entry.getPeriod(), entry.getChargeCode(), entry.getCellIndex()
	            );

	            if (existingEntry.isPresent()) {
	                TimesheetEntry updateEntry = existingEntry.get();
	                updateEntry.setHours(entry.getHours());
	                timesheetRepository.save(updateEntry);
	            } else {
	                timesheetRepository.save(entry);
	            }
	        }
	    }


}

