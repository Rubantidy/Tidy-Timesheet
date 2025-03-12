package timesheet.employee;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import timesheet.employee.dao.Preference;
import timesheet.employee.dao.SummaryEntry;
import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.PreferenceRepository;
import timesheet.employee.repo.SummaryRepository;
import timesheet.employee.repo.TimesheetRepository;
import timesheet.employee.service.TimesheetService;
import timesheet.notification.NotificationController;

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

    private final SimpMessagingTemplate messagingTemplate;
    
    private final NotificationController notificationController;

    public TimesheetController(TimesheetService timesheetService, NotificationController notificationController, SimpMessagingTemplate messagingTemplate) {
        this.timesheetService = timesheetService;
        this.notificationController = notificationController;
        this.messagingTemplate = messagingTemplate;
    }
    

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
        String status = "Pending";

        // ✅ Fetch summary data
        ResponseEntity<Map<String, Object>> responseEntity = getSummary(username, period);
        Map<String, Object> summary = responseEntity.getBody();

        if (summary == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to generate summary"));
        }

        // ✅ Save summary to the database
        saveSummary(username, period, summary, status);

        
        notificationController.sendAdminNotification(username + " is waiting for Timesheet approval on this Period: " + period );
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    public void saveSummary(String username, String period, Map<String, Object> summaryData, String status) {
        // ✅ Check if an existing entry is present
        SummaryEntry existingEntry = summaryRepository.findByUsernameAndPeriod(username, period);

        if (existingEntry != null) {
            // ✅ Update existing record
            existingEntry.setSummaryData(new Gson().toJson(summaryData));
            existingEntry.setStatus(status);
            summaryRepository.save(existingEntry); // ✅ Save updated record
        } else {
            // ✅ Create a new entry if no existing record
            SummaryEntry newEntry = new SummaryEntry(username, period, summaryData, status);
            summaryRepository.save(newEntry);
        }
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
        List<String> statuses = Arrays.asList("Pending", "Issue"); // ✅ Define required statuses
        List<SummaryEntry> pendingSummaries = summaryRepository.findByStatusIn(statuses); // ✅ Fetch entries with "Pending" or "Issue"

        List<Map<String, String>> responseList = pendingSummaries.stream().map(summary -> {
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("username", summary.getUsername());
            responseMap.put("period", summary.getPeriod());
            System.out.println("User: " + summary.getUsername() + ", Period: " + summary.getPeriod());
            return responseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }



    @PostMapping("/approve")
    public ResponseEntity<Map<String, String>> approveTimesheet(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String period = request.get("period");

        boolean success = timesheetService.approveTimesheet(username, period);

        if (success) {
        	 notificationController.sendNotification(username, "Your timesheet has been approved.");
            return ResponseEntity.ok(Collections.singletonMap("message", "Timesheet approved successfully."));
        } 
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Timesheet entry not found."));     
		
    }
    
    
    @GetMapping("/getApprovalStatus")
    public ResponseEntity<Map<String, String>> getApprovalStatus(
            @RequestParam String username, @RequestParam String period) {

        SummaryEntry summaryEntry = summaryRepository.findByUsernameAndPeriod(username, period);

        Map<String, String> response = new HashMap<>();
        if (summaryEntry != null) {
            response.put("status", summaryEntry.getStatus()); // Return actual status
        } else {
            response.put("status", "Not Found"); // No data exists
        }

        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/raiseIssue")
    public ResponseEntity<Map<String, String>> raiseIssue(@RequestBody Map<String, String> request) {
    	System.out.println("issue controller called");
        String username = request.get("username");
        String period = request.get("period");
        String issueMessage = request.get("issueMessage");

        boolean success = timesheetService.raiseIssue(username, period, issueMessage);

        if (success) {
        	notificationController.sendNotification(username, "Timesheet has an issue: " + issueMessage);
            return ResponseEntity.ok(Collections.singletonMap("message", "Issue raised successfully."));
        } 
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Timesheet entry not found."));
        
    }
    

//    @PostMapping("/raiseIssue")
//    public ResponseEntity<Map<String, String>> raiseIssue(@RequestBody Map<String, String> request) {
//        String username = request.get("username");
//        String period = request.get("period");
//        String issueMessage = request.get("issueMessage");
//
//        // ✅ Store issue in the database
//        timesheetService.raiseIssue(username, period, issueMessage);
//
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Issue raised successfully!");
//        return ResponseEntity.ok(response);
//    }

    
    
    
    
    
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





