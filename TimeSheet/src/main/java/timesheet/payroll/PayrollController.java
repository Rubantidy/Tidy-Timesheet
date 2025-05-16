package timesheet.payroll;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.payroll.dao.AddSalary;
import timesheet.payroll.dao.ApprovedPayslip;
import timesheet.payroll.dao.Bankdetails;
import timesheet.payroll.dao.MonthlySummary;
import timesheet.payroll.repo.AddSalaryRepo;
import timesheet.payroll.repo.ApprovedPayslipRepo;
import timesheet.payroll.repo.BankDetailsRepo;
import timesheet.payroll.repo.MonthlySummaryRepository;

@RestController
@RequestMapping("/payslip")
public class PayrollController {

	@Autowired
	private EmployeeRepo EmpRepo;
	
	    @Autowired
	    private MonthlySummaryRepository monthlySummaryRepository;
	    
	    @Autowired
	    private AddSalaryRepo addSalaryrepo;
	    
	    @Autowired
	    private BankDetailsRepo bankdetailsrepo;
	    
	    
	    @Autowired
	    private ApprovedPayslipRepo approvedPayslip;
	 
	    @GetMapping("/EmployePayslip/{month}")
	    public ResponseEntity<List<Map<String, String>>> getUsersForMonth(@PathVariable String month) {
	        
	        // Get summaries for that month where payslip is NOT generated
	        List<MonthlySummary> summaries = monthlySummaryRepository.findByMonthAndIsPayslipGeneratedFalse(month);

	        Set<String> uniqueUsernames = new HashSet<>();
	        List<Map<String, String>> result = new ArrayList<>();

	        for (MonthlySummary summary : summaries) {
	            String username = summary.getUsername(); // e.g., "Ruban M"
	            if (uniqueUsernames.add(username)) {
	                
	                Employeedao emp = EmpRepo.findByeName(username);
	                if (emp != null) {
	                    String displayName = emp.geteName() + " - " + emp.getDesignation();

	                    Map<String, String> map = new HashMap<>();
	                    map.put("username", username); // e.g., "Ruban M"
	                    map.put("display", displayName); // e.g., "Ruban M - Software Developer"
	                    result.add(map);
	                }
	            }
	        }

	        return ResponseEntity.ok(result);
	    }
	    
	    
	    @GetMapping("/details")
	    public ResponseEntity<?> getPayslipDetails(
	            @RequestParam String username,
	            @RequestParam String month) {

	        // Trim inputs to prevent issues from trailing/leading spaces
	        username = username.trim();
	        month = month.trim();


	        Map<String, Object> result = new HashMap<>();

	        // Find Monthly Summary
	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, month);
	        if (summaryOpt.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Summary not found"));
	        }
	        MonthlySummary summary = summaryOpt.get();

	        result.put("stddays", summary.getTotalWorkingDays());
	        result.put("totalworked", summary.getTotalWorkingDays() - summary.getTotalAbsences());
	        result.put("totalleaves", summary.getTotalAbsences());
	        result.put("lop", summary.getTotalLOPDays());

	        // Find Salary details
	        List<AddSalary> salaryList = addSalaryrepo.findByEmployeename(username);
	        if (salaryList.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Salary details not found"));
	        }
	        AddSalary salary = salaryList.get(0);
	        double basicSalary = Double.parseDouble(salary.getMonthsalary());
	        result.put("basicSalary", basicSalary);

	        // Find Employee details
	        Employeedao employee = EmpRepo.findByeName(username);
	        if (employee == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee details not found"));
	        }

	        result.put("name", employee.geteName());
	        result.put("onboardDate", employee.getOnboard());
	        result.put("designation", employee.getDesignation());

	        // Calculate deductions based on LOP
	        double lopDays = summary.getTotalLOPDays() != null ? summary.getTotalLOPDays() : 0.0;
	        double deductionPerLop = basicSalary / 30;
	        double deductions = deductionPerLop * lopDays;

	        result.put("deduction", deductions);

	        double netPay = basicSalary - deductions;
	        result.put("netPay", netPay);

	        return ResponseEntity.ok(result);
	    }


	    @PostMapping("/approvepayslip")
	    public ResponseEntity<?> approvePayslip(@RequestBody ApprovedPayslip payslipData) {

	        String username = payslipData.getUsername().trim();

	        // Fetch bank details for employee
	        Bankdetails bankDetails = bankdetailsrepo.findByEmployeenameIgnoreCase(username);
	        if (bankDetails == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(Map.of("error", "Bank details not found for employee: " + username));
	        }

	        // Set bank info & location on payslip entity
	        payslipData.setAccountHolder(bankDetails.getAccountHolder());
	        payslipData.setBankName(bankDetails.getBankName());
	        payslipData.setAccountNumber(bankDetails.getAccountNumber());
	        payslipData.setLocation("Salem");  // default location

	        // Set local date and time in "yyyy-MM-dd: HH:mm" format
	        LocalDateTime now = LocalDateTime.now();
	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd: HH:mm");

	        String formattedDateTime = now.format(formatter);
	        payslipData.setSalaryProcessAt(formattedDateTime);
	        payslipData.setApprovedAt(formattedDateTime);

	        // Save approved payslip
	        approvedPayslip.save(payslipData);

	        // Set PayslipGenerated = true in MonthlySummary
	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, payslipData.getMonth());
	        if (summaryOpt.isPresent()) {
	            MonthlySummary summary = summaryOpt.get();
	            summary.setIsPayslipGenerated(true);
	            monthlySummaryRepository.save(summary);
	        }

	        return ResponseEntity.ok(Map.of("message", "Payslip approved and saved successfully"));
	    }
	    

}
