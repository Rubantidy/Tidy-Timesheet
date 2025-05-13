package timesheet.payroll;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.mail.MessagingException;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.emails.EmailServiceController;
import timesheet.payroll.dao.AddSalary;
import timesheet.payroll.dao.Bankdetails;
import timesheet.payroll.repo.AddSalaryRepo;
import timesheet.payroll.repo.BankDetailsRepo;


@RestController
public class SalaryController {
	
	@Autowired
	private EmployeeRepo EmpRepo;
	
	@Autowired
	private AddSalaryRepo addSalaryRepo;
	
	@Autowired
	private BankDetailsRepo bankDetailsrepo;

	@Autowired
	private EmailServiceController emailservice;
	
	@GetMapping("/getEmployeesforSalary")
	public List<Employeedao> getSalaryEligibleEmployees() {
	    List<String> salariedEmployeeNames = addSalaryRepo.findAll()
	            .stream()
	            .map(AddSalary::getEmployeename)
	            .collect(Collectors.toList());

	    return EmpRepo.findAll()
	            .stream()
	            .filter(e -> "active".equalsIgnoreCase(e.getStatus()))
	            .filter(e -> salariedEmployeeNames.stream().noneMatch(name -> name.equalsIgnoreCase(e.geteName())))
	            .collect(Collectors.toList());
	}
	
	
	
	@PostMapping("/addSalary")
    public ResponseEntity<String> addSalary(@RequestBody AddSalary salaryData) {
        try {
            // Parse and validate salaryMonth
            int salaryMonthInt = Integer.parseInt(salaryData.getMonthsalary());

            // Calculate SalaryYear = SalaryMonth * 12
            int salaryYear = salaryMonthInt * 12;

            // Set the calculated and default values
            salaryData.setYearsalary(String.valueOf(salaryYear));  // Convert to String if needed
            salaryData.setBankaccount("0");  // default bank account status

            Employeedao empData = EmpRepo.findByeName(salaryData.getEmployeename());
            // Save to DB
            addSalaryRepo.save(salaryData);
            
            try {
            	emailservice.InitialSalaryEmail(salaryData, empData);
            } catch (MessagingException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to send email.");
            }

            return ResponseEntity.ok("Salary added successfully for " + salaryData.getEmployeename() + "!");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid SalaryMonth: must be a number.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to add salary due to server error.");
        }
    }
	
	 @GetMapping("/getInitialSalary")
	    public ResponseEntity<List<AddSalary>> getCodes() {
	        List<AddSalary> Salary = addSalaryRepo.findAll();
	        return ResponseEntity.ok(Salary);
	    }
	 
	
	 
	 @PostMapping("/saveBankDetails")
	 public ResponseEntity<?> saveBankDetails(
	         @RequestParam("Employeename") String employeename,
	         @RequestParam("accountHolder") String accountHolder,
	         @RequestParam("accountNumber") String accountNumber,
	         @RequestParam("ifsc") String ifsc,
	         @RequestParam("bankName") String bankName,
	         @RequestParam("upiId") String upiId) {

	     try {
	         // ✅ Check if bank details already exist
	         Optional<Bankdetails> existingDetailsOpt = bankDetailsrepo.findTopByEmployeenameOrderByIdDesc(employeename);

	         Bankdetails bankDetails;
	         if (existingDetailsOpt.isPresent()) {
	             // ✅ Update existing
	             bankDetails = existingDetailsOpt.get();
	         } else {
	             // ✅ Insert new
	             bankDetails = new Bankdetails();
	             bankDetails.setEmployeename(employeename);
	         }

	         // Set/Update fields
	         bankDetails.setAccountHolder(accountHolder);
	         bankDetails.setAccountNumber(accountNumber);
	         bankDetails.setIfsc(ifsc);
	         bankDetails.setBankName(bankName);
	         bankDetails.setUpiId(upiId);

	         bankDetailsrepo.save(bankDetails); // Save updated or new

	         // ✅ Update Bankaccount flag in AddSalary
	         List<AddSalary> salaryRecords = addSalaryRepo.findByEmployeename(employeename);
	         for (AddSalary record : salaryRecords) {
	             record.setBankaccount("1");
	         }
	         addSalaryRepo.saveAll(salaryRecords);

	         return ResponseEntity.ok(Map.of("message", "Bank details saved/updated and salary status updated!"));

	     } catch (Exception e) {
	         e.printStackTrace();
	         return ResponseEntity.status(500).body(Map.of("message", "Error saving bank details: " + e.getMessage()));
	     }
	 }

	 
	 @GetMapping("/getBankDetails")
	 public ResponseEntity<?> getBankDetails(@RequestParam("Employeename") String employeename) {
	     try {
	         Optional<Bankdetails> bankDetails = bankDetailsrepo.findTopByEmployeenameOrderByIdDesc(employeename);
	         if (bankDetails.isPresent()) {
	             return ResponseEntity.ok(bankDetails.get());
	         } else {
	             return ResponseEntity.status(404).body(Map.of("message", "Bank details not found"));
	         }
	     } catch (Exception e) {
	         e.printStackTrace();
	         return ResponseEntity.status(500).body(Map.of("message", "Error fetching bank details: " + e.getMessage()));
	     }
	 }

}
	

