package timesheet.employee.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.dao.TimesheetTemplate;
import timesheet.employee.repo.TemplateRepository;
import timesheet.employee.repo.TimesheetRepository;

@Service
public class TimesheetService {
    
	 @Autowired
	    private TimesheetRepository timesheetRepository;
	 
	 @Autowired
	    private TemplateRepository templateRepository;

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

	    
	    public void saveTemplate(List<TimesheetTemplate> templateEntries) {
	        for (TimesheetTemplate template : templateEntries) {
	            TimesheetTemplate existingTemplate = templateRepository.findByUsernameAndChargeCode(
	                template.getUsername(), template.getChargeCode());

	            if (existingTemplate != null) {
	                existingTemplate.setWeekdays(template.getWeekdays());
	                templateRepository.save(existingTemplate); // ✅ Update existing template
	            } else {
	            	templateRepository.save(template); // ✅ Save new template
	            }
	        }
	    }

	    public List<TimesheetTemplate> getTemplateByUsername(String username) {
	        return templateRepository.findByUsername(username);
	    }



}

