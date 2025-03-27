package timesheet.employee;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;

import timesheet.admin.dao.Assignment;
import timesheet.admin.repo.AssignmentRepository;
import timesheet.employee.dao.EmpExpensedao;
import timesheet.employee.dao.Preference;
import timesheet.employee.dao.SummaryEntry;
import timesheet.employee.dao.TimesheetEntry;
import timesheet.employee.repo.EmpExpenseRepository;

import timesheet.employee.repo.PreferenceRepository;
import timesheet.employee.repo.SummaryRepository;
import timesheet.employee.repo.TimesheetRepository;
import timesheet.employee.service.TimesheetService;
import timesheet.notification.NotificationService;

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
    
    @Autowired
    private AssignmentRepository assignrepo;

  

    
    private EmpExpenseRepository expenseRepository;
    
    
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    
    private static final String UPLOAD_DIR = "uploads/receipts/";

 // ✅ Correct Constructor Injection

    public TimesheetController(
            TimesheetService timesheetService,
            NotificationService notificationService,
            SimpMessagingTemplate messagingTemplate,
            EmpExpenseRepository expenseRepository) {
        this.timesheetService = timesheetService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
        this.expenseRepository = expenseRepository;
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
    public ResponseEntity<?> deleteRow(@RequestParam String chargeCode, @RequestParam String period) {
        try {
            String trimmedChargeCode = chargeCode.trim();
        

            // 🔥 Find only the entries matching the charge code AND the period
            List<TimesheetEntry> rowsToDelete = timesheetRepository.findByChargeCodeAndPeriod(trimmedChargeCode, period);

            if (rowsToDelete.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Row not found for the selected period"));
            }

            // 🔥 Delete only the matching row(s) for the selected period
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

        List<TimesheetEntry> entries = timesheetService.getTimesheet(username, period);

        float totalHours = 0;
        float totalAbsences = 0;
        float totalExpense = 0; // New total expense variable

        // Store charge code totals in a Map to merge duplicates
        Map<String, Float> chargeCodeTotals = new HashMap<>();

        float casualLeaveThisMonth = 0;
        float sickLeaveThisYear = 0;
        float paidLeave = 0;

        for (TimesheetEntry entry : entries) {
            String code = entry.getChargeCode();
            if ("Company Code".equals(code) || "Work Location".equals(code)) {
                continue;
            }

            float hours = (entry.getHours() == null || entry.getHours().isEmpty()) ? 0 : Float.parseFloat(entry.getHours());
            float leaveDays = hours / 9.0f;

            chargeCodeTotals.put(code, chargeCodeTotals.getOrDefault(code, 0f) + hours);
            totalHours += hours;

            // Update leave counts based on charge codes
            if (code.endsWith("Casual Leave")) { 
                casualLeaveThisMonth += leaveDays;
            } else if (code.endsWith("Sick Leave")) { 
                sickLeaveThisYear += leaveDays;
            } else if (code.endsWith("Loss of Pay")) { 
                paidLeave += leaveDays;
            }

            if (code.endsWith("Leave") || code.endsWith("Loss of Pay")) {
                totalAbsences += hours;
            }
        }

        // Fetch total expense from database for the given user and period
        List<EmpExpensedao> expenses = expenseRepository.findByUsernameAndPeriod(username, period);
        for (EmpExpensedao expense : expenses) {
            totalExpense += expense.getAmount();
        }

        List<Map<String, String>> processedEntries = new ArrayList<>();
        for (Map.Entry<String, Float> entry : chargeCodeTotals.entrySet()) {
            Map<String, String> row = new HashMap<>();
            row.put("chargeCode", entry.getKey());
            row.put("hours", String.valueOf(entry.getValue()));
            processedEntries.add(row);
        }

        Map<String, Object> summaryData = new HashMap<>();
        summaryData.put("totalHours", totalHours);
        summaryData.put("totalAbsences", totalAbsences);
        summaryData.put("casualLeaveDays", casualLeaveThisMonth);
        summaryData.put("sickLeaveDays", sickLeaveThisYear);
        summaryData.put("paidLeaveDays", paidLeave);
        summaryData.put("totalExpense", totalExpense); // Send total expense to frontend
        summaryData.put("entries", processedEntries);

        return ResponseEntity.ok(summaryData);
    }



    
    
    
    @PostMapping("/sendForApproval")
    public ResponseEntity<Map<String, Object>> sendForApproval(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String period = request.get("period");
        String status = request.getOrDefault("status", "Pending"); // ✅ Get status from request

        // ✅ Fetch summary data
        ResponseEntity<Map<String, Object>> responseEntity = getSummary(username, period);
        Map<String, Object> summary = responseEntity.getBody();

        if (summary == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to generate summary"));
        }

        // ✅ Save summary to the database with given status
        saveSummary(username, period, summary, status);

        // ✅ Send notifications based on status
        if (status.equals("Pending")) {
            notificationService.sendAdminNotification(username + " is waiting for Timesheet approval on this Period: " + period);
        } else if (status.equals("Approved")) {
            notificationService.sendNotification(username, "Your timesheet for " + period + " has been Submited.");
        }

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
        List<String> statuses = Arrays.asList("Pending"); // ✅ Define required statuses
        List<SummaryEntry> pendingSummaries = summaryRepository.findByStatusIn(statuses); // ✅ Fetch entries with "Pending" or "Issue"

        List<Map<String, String>> responseList = pendingSummaries.stream().map(summary -> {
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("username", summary.getUsername());
            responseMap.put("period", summary.getPeriod());


            return responseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    
    @GetMapping("/getApprovalslist")
    public ResponseEntity<List<Map<String, String>>> getApprovalslist() {
        List<String> statuses = Arrays.asList("Approved"); // ✅ Define required statuses
        List<SummaryEntry> pendingSummaries = summaryRepository.findByStatusIn(statuses); // ✅ Fetch entries with "Pending" or "Issue"

        List<Map<String, String>> responseList = pendingSummaries.stream().map(summary -> {
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("username", summary.getUsername());
            responseMap.put("period", summary.getPeriod());


            return responseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }
    
    @GetMapping("/getIssuelist")
    public ResponseEntity<List<Map<String, String>>> getIssuelist() {
        List<String> statuses = Arrays.asList("Issue"); // ✅ Define required statuses
        List<SummaryEntry> pendingSummaries = summaryRepository.findByStatusIn(statuses); // ✅ Fetch entries with "Pending" or "Issue"

        List<Map<String, String>> responseList = pendingSummaries.stream().map(summary -> {
            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("username", summary.getUsername());
            responseMap.put("period", summary.getPeriod());


            return responseMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Integer>> getCounts() {
    	 Map<String, Integer> counts = new HashMap<>();
         counts.put("pending", summaryRepository.countByStatus("Pending"));
         counts.put("approved", summaryRepository.countByStatus("Approved"));
         counts.put("issue", summaryRepository.countByStatus("Issue"));
     


        return ResponseEntity.ok(counts);
    }
    
    @PostMapping("/approve")
    public ResponseEntity<Map<String, String>> approveTimesheet(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String period = request.get("period");

        boolean success = timesheetService.approveTimesheet(username, period);

        if (success) {
        	  notificationService.sendNotification(username, "Your timesheet has been approved on this Period: " + period);
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


        String username = request.get("username");
        String period = request.get("period");
        String issueMessage = request.get("issueMessage");

        boolean success = timesheetService.raiseIssue(username, period, issueMessage);

        if (success) {
        	notificationService.sendNotification(username,  
        		    "Timesheet has an issue on this period: " + period + "<br><strong>The Issue is: " + issueMessage + "</strong>");

            return ResponseEntity.ok(Collections.singletonMap("message", "Issue raised successfully."));
        } 
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Timesheet entry not found."));
        
    }
       
    
    @GetMapping("/assigned-employees")
    public List<Assignment> getAssignedEmployees() {
    	
        return assignrepo.findAll(); // Directly fetching from the database
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


        } else {
            // ✅ Save new preference
            preferenceRepository.save(preference);


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

    
    
    
    // Save Expense API
    @PostMapping("/saveEmpExpense")
    public EmpExpensedao saveExpense(
            @RequestParam("username") String username,
            @RequestParam("period") String period,
            @RequestParam("expenseType") String expenseType, // Full type stored here
            @RequestParam("amount") double amount,
            @RequestParam("invoice") String invoice,
            @RequestParam("gst") String gst,
            @RequestParam(value = "receipt", required = false) MultipartFile receipt,
            @RequestParam("description") String description) {

    	EmpExpensedao expense = new EmpExpensedao();
        expense.setUsername(username);
        expense.setPeriod(period);
        expense.setExpenseType(expenseType); // Store full type here
        expense.setAmount(amount);
        expense.setInvoiceNumber(invoice);
        expense.setGstNumber(gst);
        expense.setDescription(description);

        // Handle File Upload with Directory Check
        if (receipt != null && !receipt.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + receipt.getOriginalFilename();
                Path uploadPath = Paths.get(UPLOAD_DIR);
                
                // Ensure directory exists
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                Files.write(filePath, receipt.getBytes());
                expense.setReceiptPath(filePath.toString());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return expenseRepository.save(expense);
    }

    // Fetch Expenses for a Specific Employee and Period
    @GetMapping("/getEmpExpenses")
    public List<EmpExpensedao> getExpenses(
            @RequestParam("username") String username,
            @RequestParam("period") String period) {
        return expenseRepository.findByUsernameAndPeriod(username, period);
    }


}





