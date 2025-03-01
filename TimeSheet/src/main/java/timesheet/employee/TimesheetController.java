package timesheet.employee;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.employee.repo.TimesheetEntryRepository;
import timesheet.employee.repo.TimesheetRepository;
import timesheet.employee.timesheetdao.Timesheet;
import timesheet.employee.timesheetdao.TimesheetEntry;

@ComponentScan
@RestController

public class TimesheetController {

    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private TimesheetEntryRepository timesheetEntryRepo;

    // ✅ Save (Update only modified cells, keep old data)
    @PostMapping("/save")
    public String saveTimesheet(@RequestBody Timesheet newTimesheet) {

        Timesheet existingTimesheet = timesheetRepository.findByEmployeeNameAndPeriod(
            newTimesheet.getEmployeeName(), newTimesheet.getPeriod());

        if (existingTimesheet != null) {
            List<TimesheetEntry> existingEntries = existingTimesheet.getEntries();
            List<TimesheetEntry> newEntries = newTimesheet.getEntries();

            for (TimesheetEntry newEntry : newEntries) {
                boolean entryExists = false;

                for (TimesheetEntry existingEntry : existingEntries) {
                    if (existingEntry.getDate().equals(newEntry.getDate()) &&
                        existingEntry.getChargeCode().equals(newEntry.getChargeCode())) {
                        
                        existingEntry.setHours(newEntry.getHours()); // ✅ Update only modified values
                        entryExists = true;
                        break;
                    }
                }

                if (!entryExists) {
                    newEntry.setTimesheet(existingTimesheet);
                    existingEntries.add(newEntry); // ✅ Add new entry if it doesn't exist
                }
            }

            existingTimesheet.setEntries(existingEntries);
        } else {
            // Create a new timesheet if it doesn't exist
            for (TimesheetEntry entry : newTimesheet.getEntries()) {
                entry.setTimesheet(newTimesheet);
            }
            existingTimesheet = newTimesheet;
            existingTimesheet.setStatus("Saved");
        }

        timesheetRepository.save(existingTimesheet);
        return "Timesheet saved successfully.";
    }

    // ✅ Submit (Final save, lock the timesheet)
    @PostMapping("/submit")
    public String submitTimesheet(@RequestBody Timesheet timesheet) {
        Timesheet existingTimesheet = timesheetRepository.findByEmployeeNameAndPeriod(
            timesheet.getEmployeeName(), timesheet.getPeriod());

        if (existingTimesheet == null) {
            return "Error: No saved timesheet found.";
        }

        existingTimesheet.setStatus("Submitted");
        timesheetRepository.save(existingTimesheet);
        return "Timesheet submitted successfully.";
    }

    // ✅ Fetch All Timesheets for Future Reports
    @GetMapping("/all")
    public List<Timesheet> getAllTimesheets() {
        return timesheetRepository.findAll();
    }
    
    @GetMapping("/getTimesheetData")
    public List<Timesheet> getTimesheetData() {
    	System.out.println("Get function called");
    	
        return timesheetRepository.findAll();  
         // Adjust query as needed
    }
}