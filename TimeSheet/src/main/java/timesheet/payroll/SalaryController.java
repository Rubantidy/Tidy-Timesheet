package timesheet.payroll;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.mail.MessagingException;
import timesheet.admin.dao.Codedao;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.emails.EmailServiceController;
import timesheet.payroll.dao.AddSalary;
import timesheet.payroll.repo.AddSalaryRepo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class SalaryController {
	
	@Autowired
	private EmployeeRepo EmpRepo;
	
	@Autowired
	private AddSalaryRepo addSalaryRepo;
	
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
	

}
	

