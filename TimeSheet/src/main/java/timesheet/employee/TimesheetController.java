package timesheet.employee;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import timesheet.employee.dao.Preference;
import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.PreferenceRepository;
import timesheet.employee.repo.TimesheetRepository;
import timesheet.employee.service.TimesheetService;

@RestController
public class TimesheetController {
    
    @Autowired
    private TimesheetService timesheetService;
    
    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private PreferenceRepository preferenceRepository;


    @GetMapping("/getTimesheet")
    public ResponseEntity<List<TimesheetEntry>> getTimesheet(
            @RequestParam String username, @RequestParam String period) {
    	
    

        List<TimesheetEntry> entries = timesheetService.getTimesheet(username, period);

        return ResponseEntity.ok(entries);
    }
    
    @PostMapping("/saveTimesheet")
    public ResponseEntity<String> saveTimesheet(@RequestBody List<TimesheetEntry> timesheetEntries) {

        timesheetService.saveOrUpdateTimesheet(timesheetEntries);

        return ResponseEntity.ok("Timesheet saved successfully");
    }
    
    @DeleteMapping("/deleteRow")
    public ResponseEntity<?> deleteRow(@RequestParam String chargeCode) {
        try {
            String trimmedChargeCode = chargeCode.trim(); // ✅ Remove extra spaces
            
            // 🔥 Get all rows matching the charge code
            List<TimesheetEntry> rowsToDelete = timesheetRepository.findByChargeCode(trimmedChargeCode);

            if (rowsToDelete.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Row not found"));
            }

            // 🔥 Delete all matching rows
            timesheetRepository.deleteAll(rowsToDelete);

            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } catch (Exception e) {
            e.printStackTrace(); // 🔥 Print error in logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to delete row"));
        }
    }


    @GetMapping("/getSummary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam String username, @RequestParam String period) {
        
        System.out.println("Fetching summary for: " + username + " | Period: " + period);

        List<TimesheetEntry> entries = timesheetService.getTimesheet(username, period);

        int totalHours = 0;
        int totalAbsences = 0;

        // Store charge code totals in a Map to merge duplicates
        Map<String, Integer> chargeCodeTotals = new HashMap<>();

        for (TimesheetEntry entry : entries) {
            String code = entry.getChargeCode();
            
            // Exclude "Company Code" & "Work Location"
            if ("Company Code".equals(code) || "Work Location".equals(code)) {
                continue;
            }

            int hours = entry.getHours() == null || entry.getHours().isEmpty() ? 0 : Integer.parseInt(entry.getHours());

            // Merge same charge codes by summing hours
            chargeCodeTotals.put(code, chargeCodeTotals.getOrDefault(code, 0) + hours);

            totalHours += hours;

            // Check for leave codes and count absences
            if ("TdL1 - Sick Leave".equals(code) || "TdL2 - Casual Leave".equals(code)) {
                totalAbsences += hours; //leaves
            } 
        }

        // Convert the merged data into a list for frontend
        List<Map<String, String>> processedEntries = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : chargeCodeTotals.entrySet()) {
            Map<String, String> row = new HashMap<>();
            row.put("chargeCode", entry.getKey());
            row.put("hours", String.valueOf(entry.getValue()));

            processedEntries.add(row);
        }

        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("totalHours", totalHours);
        summaryData.put("totalAbsences", totalAbsences);
        summaryData.put("entries", processedEntries); // Send merged list

        return ResponseEntity.ok(summaryData);
    }
    
    
   
 // Save or update preferences
    @PostMapping("/savePreferences")
    public ResponseEntity<String> savePreferences(@RequestBody Preference preference) {
        Optional<Preference> existingPreference = preferenceRepository.findByPeriod(preference.getPeriod());

        if (existingPreference.isPresent()) {
            Preference updatedPreference = existingPreference.get();
            updatedPreference.setApprovers(preference.getApprovers());
            updatedPreference.setReviewers(preference.getReviewers());
            updatedPreference.setDelegator(preference.getDelegator());
            preferenceRepository.save(updatedPreference);
        } else {
            preferenceRepository.save(preference);
        }

        return ResponseEntity.ok("Preferences saved successfully!");
    }

    // Fetch preferences for a specific period
    @GetMapping("/getPreferences")
    public ResponseEntity<Preference> getPreferences(@RequestParam String period) {
        Optional<Preference> preference = preferenceRepository.findByPeriod(period);
        return ResponseEntity.ok(preference.orElse(new Preference()));
    }
    
    
}





