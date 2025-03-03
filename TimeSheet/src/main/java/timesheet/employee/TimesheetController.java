package timesheet.employee;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.service.TimesheetService;

@RestController
public class TimesheetController {
    
    @Autowired
    private TimesheetService timesheetService;

    @GetMapping("/getTimesheet")
    public ResponseEntity<List<TimesheetEntry>> getTimesheet(
            @RequestParam String username, @RequestParam String period) {
    	System.out.println("Timesheet get function called");
        List<TimesheetEntry> entries = timesheetService.getTimesheet(username, period);
        System.out.println(entries);
        return ResponseEntity.ok(entries);
    }
    
    @PostMapping("/saveTimesheet")
    public ResponseEntity<String> saveTimesheet(@RequestBody List<TimesheetEntry> timesheetEntries) {
    	System.out.println("Timesheet saved function called");
        timesheetService.saveOrUpdateTimesheet(timesheetEntries);
        System.out.println(timesheetEntries);
        return ResponseEntity.ok("Timesheet saved successfully");
    }


}

