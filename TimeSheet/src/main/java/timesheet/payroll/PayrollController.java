package timesheet.payroll;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

import jakarta.mail.MessagingException;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.dao.Holidays;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.admin.repo.HolidayRepo;
import timesheet.emails.EmailServiceController;
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
	    
	    @Autowired
	    private HolidayRepo holidayrepo;
	    
	    @Autowired
	    private EmailServiceController emailService;

	 
	    @GetMapping("/EmployePayslip/{month}")
	    public ResponseEntity<List<Map<String, String>>> getUsersForMonth(@PathVariable String month) {
	        

	        List<MonthlySummary> summaries = monthlySummaryRepository.findByMonthAndIsPayslipGeneratedFalse(month);

	        Set<String> uniqueUsernames = new HashSet<>();
	        List<Map<String, String>> result = new ArrayList<>();

	        for (MonthlySummary summary : summaries) {
	            String username = summary.getUsername(); 
	            if (uniqueUsernames.add(username)) {
	                
	                Employeedao emp = EmpRepo.findByeName(username);
	                if (emp != null) {
	                    String displayName = emp.geteName() + " - " + emp.getDesignation();

	                    Map<String, String> map = new HashMap<>();
	                    map.put("username", username); 
	                    map.put("display", displayName); 
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
	    	

	       
//	        username = username.trim();
//	        month = month.trim();


	        Map<String, Object> result = new HashMap<>();
	        
	        int totalSundays = 0;
	        int totalHolidays = 0;

	        try {
	            // Parse the incoming month (format: yyyy-MM)
	            YearMonth yearMonth = YearMonth.parse(month);
	            int targetMonth = yearMonth.getMonthValue();
	            int targetYear = yearMonth.getYear();

	            // Count total Sundays
	            for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
	                LocalDate date = yearMonth.atDay(day);
	                if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
	                    totalSundays++;
	                }
	            }

	            // Fetch and count holidays in this month/year
	            List<Holidays> holidays = holidayrepo.findByyear(targetYear); // You must define this in HolidaysRepository
	            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	            for (Holidays holiday : holidays) {
	                try {
	                    LocalDate holidayDate = LocalDate.parse(holiday.getDate(), formatter);
	                    if (holidayDate.getMonthValue() == targetMonth && holidayDate.getYear() == targetYear) {
	                        totalHolidays++;
	                    }
	                } catch (DateTimeParseException e) {
	                    // Skip invalid dates
	                }
	            }

//	            result.put("totalSundays", totalSundays);
//	            result.put("totalHolidays", totalHolidays);
	            


	        } catch (DateTimeParseException e) {
	            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid month format. Expected yyyy-MM"));
	        }

	       
	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, month);
	        if (summaryOpt.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Summary not found"));
	        }
	        
	        MonthlySummary summary = summaryOpt.get();

	        result.put("stddays", summary.getTotalWorkingDays() + (totalSundays + totalHolidays));
	        result.put("totalworked", (summary.getTotalWorkingDays() - summary.getTotalLOPDays()) + (totalSundays+ totalHolidays));
	        result.put("totalleaves", summary.getTotalAbsences());
	        result.put("lop", summary.getTotalLOPDays());

	      
	        List<AddSalary> salaryList = addSalaryrepo.findByEmployeename(username);
	        if (salaryList.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Salary details not found"));
	        }
	        AddSalary salary = salaryList.get(0);
	        double basicSalary = Double.parseDouble(salary.getMonthsalary());
	        result.put("basicSalary", basicSalary);

	   
	        Employeedao employee = EmpRepo.findByeName(username);
	        if (employee == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee details not found"));
	        }

	        result.put("name", employee.geteName());
	        result.put("onboardDate", employee.getOnboard());
	        result.put("designation", employee.getDesignation());

	        double totaldaysOnmonth = summary.getTotalWorkingDays() + (totalSundays + totalHolidays);

	        double lopDays = summary.getTotalLOPDays() != null ? summary.getTotalLOPDays() : 0.0;
	        double deductionPerLop = basicSalary / totaldaysOnmonth;
	        double deductions = deductionPerLop * lopDays;

	        result.put("deduction", deductions);

	        double netPay = basicSalary - deductions;
	        result.put("netPay", netPay);

	        return ResponseEntity.ok(result);
	    }


	    @PostMapping("/approvepayslip")
	    public ResponseEntity<?> approvePayslip(@RequestBody ApprovedPayslip payslipData) {

	        String username = payslipData.getUsername().trim();

	        Bankdetails bankDetails = bankdetailsrepo.findByEmployeenameIgnoreCase(username);
	        if (bankDetails == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(Map.of("error", "Bank details not found for employee: " + username));
	        }

	        payslipData.setAccountHolder(bankDetails.getAccountHolder());
	        payslipData.setBankName(bankDetails.getBankName());
	        payslipData.setAccountNumber(bankDetails.getAccountNumber());
	        payslipData.setLocation("Salem");

	        LocalDateTime now = LocalDateTime.now();
	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd: HH:mm");
	        String formattedDateTime = now.format(formatter);

	        payslipData.setSalaryProcessAt(formattedDateTime);
	        payslipData.setApprovedAt(formattedDateTime);

	        approvedPayslip.save(payslipData);

	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, payslipData.getMonth());
	        if (summaryOpt.isPresent()) {
	            MonthlySummary summary = summaryOpt.get();
	            summary.setIsPayslipGenerated(true);
	            monthlySummaryRepository.save(summary);
	        }

	        // Fetch employee email and name to send email
	        Employeedao empData = EmpRepo.findByeName(username);
	        if (empData != null) {
	            try {
	                emailService.sendPayslipApprovedEmail(empData.geteMail(), empData.geteName(), payslipData.getMonth());
	            } catch (MessagingException | IOException e) {
	                // Log error but don’t fail the request
	                e.printStackTrace();
	            }
	        }

	        return ResponseEntity.ok(Map.of("message", "Payslip approved and saved successfully"));
	    }

	    
	    
	    @GetMapping("/getPayslipdata")
	    public ResponseEntity<List<ApprovedPayslip>> getExpense() {
	        List<ApprovedPayslip> Payslip = approvedPayslip.findAll();

	        return ResponseEntity.ok(Payslip);
	    }

	    
	    
}
