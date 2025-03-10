package timesheet.employee;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import timesheet.employee.dao.SummaryEntry;
import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.PreferenceRepository;
import timesheet.employee.repo.SummaryRepository;
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
    
    @Autowired
    private SummaryRepository summaryRepository;


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

        System.out.println("data:" + summaryData);
        return ResponseEntity.ok(summaryData);
    }
    
    
    
    
    
    @PostMapping("/sendForApproval")
    public ResponseEntity<Map<String, Object>> sendForApproval(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String period = request.get("period");

        // ✅ Fetch summary data
        ResponseEntity<Map<String, Object>> responseEntity = getSummary(username, period);
        Map<String, Object> summary = responseEntity.getBody();

        if (summary == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to generate summary"));
        }

        // ✅ Save summary to the database
        saveSummary(username, period, summary);

        return ResponseEntity.ok(Map.of("success", true));
    }

    // ✅ Save Summary to Database
    public void saveSummary(String username, String period, Map<String, Object> summaryData) {
        SummaryEntry summaryEntry = new SummaryEntry(username, period, summaryData);
        summaryRepository.save(summaryEntry);
    }
    
    
    @GetMapping("/getAllSummaries")
    public ResponseEntity<List<Map<String, Object>>> getAllSummaries() {
        List<SummaryEntry> summaries = summaryRepository.findAll(); // Fetch all summaries
        
        List<Map<String, Object>> responseList = new ArrayList<>();
        
        for (SummaryEntry summary : summaries) {
            Map<String, Object> summaryData = new HashMap<>();
            summaryData.put("username", summary.getUsername());
            summaryData.put("period", summary.getPeriod());
            summaryData.put("totalHours", summary.getSummaryData().get("totalHours"));
            summaryData.put("totalAbsences", summary.getSummaryData().get("totalAbsences"));
            summaryData.put("entries", summary.getSummaryData().get("entries")); // Charge Code Data
            
            responseList.add(summaryData);
        }

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/getPendingApprovals")
    public ResponseEntity<List<Map<String, String>>> getPendingApprovals() {
        List<SummaryEntry> pendingSummaries = summaryRepository.findAll();

        List<Map<String, String>> responseList = pendingSummaries.stream().map(summary -> {
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("username", summary.getUsername());
            responseMap.put("period", summary.getPeriod());
            System.out.println("user name and period" + responseMap);
            return responseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }



    
    @PostMapping("/savePreferences")
    public ResponseEntity<String> savePreferences(@RequestBody Preference preference) {

        Optional<Preference> existingPreference = preferenceRepository.findByEmployeenameAndPeriod(
            preference.getEmployeename(), preference.getPeriod()
        );

        if (existingPreference.isPresent()) {
            // ✅ Update existing preference for the user & period
            Preference updatedPreference = existingPreference.get();
            updatedPreference.setApprovers(preference.getApprovers());
            updatedPreference.setReviewers(preference.getReviewers());
            updatedPreference.setDelegator(preference.getDelegator());

            preferenceRepository.save(updatedPreference);
            System.out.println("Updated Preferences for: " + preference.getEmployeename() + " - " + preference.getPeriod());
        } else {
            // ✅ Save new preference
            preferenceRepository.save(preference);
            System.out.println("Saved New Preferences for: " + preference.getEmployeename() + " - " + preference.getPeriod());
        }

        return ResponseEntity.ok("Preferences saved successfully!");
    }



    // Fetch preferences for a specific period
    @GetMapping("/getPreferences")
    public ResponseEntity<Preference> getPreferences(@RequestParam String period, @RequestParam String employeename) {
        Optional<Preference> preference = preferenceRepository.findByEmployeenameAndPeriod(employeename, period);

        if (preference.isPresent()) {
            return ResponseEntity.ok(preference.get());
        } else {
            return ResponseEntity.notFound().build(); // ✅ Return 404 if no preference found
        }
    }

    
    
}





