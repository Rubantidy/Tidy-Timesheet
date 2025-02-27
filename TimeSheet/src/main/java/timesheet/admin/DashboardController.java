package timesheet.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.CodeRepo;
import timesheet.admin.repo.DelegateRepo;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.admin.repo.ExpenseRepo;

@RestController
public class DashboardController {

    @Autowired
    private EmployeeRepo EmpRepo;
    
    @Autowired
    private DelegateRepo Delrepo;
    
	  @Autowired
	    private CodeRepo codeRepository;
	  
	  @Autowired
	  private ExpenseRepo Exrepo;
	  
	
	  @GetMapping("/login")
	  public ResponseEntity<Resource> Loginmethod() {
	      Resource resource = (Resource) new ClassPathResource("static/index.html");
	      try {
	          return ResponseEntity.ok()
	                  .contentType(MediaType.TEXT_HTML)
	                  .body(resource);
	      } catch (Exception e) {
	          return ResponseEntity.notFound().build();
	      }
	  }
	  
	 @GetMapping("/getEmployeesCount")
	    public Long getEmployeescount() {
		 System.out.println(EmpRepo.count());
	        return EmpRepo.count();
	    }
	    
	    @GetMapping("/getDelegatorsCount")
	    public Long getDelegatorscount() {
	        return Delrepo.count();
	    }
	    
	    @GetMapping("/getChargecodesCount")
	    public Long getChargecodescount() {
	        return codeRepository.count();
	    }

	    @GetMapping("/getExpensecodesCount")
	    public Long getExpensecodescount() {
	        return Exrepo.count();
	    }
	    
	    @PostMapping("/check-employee-role")
	    public ResponseEntity<Map<String, Object>> checkEmployeeRole(@RequestBody Map<String, String> request) {
	        String email = request.get("email");
	        System.out.println("switch emil:" + email);

	        // Fetch the employee details from the database based on the email
	        Employeedao employee = EmpRepo.findByeMail(email); // Assuming you have a method to find employee by email

	        // Prepare the response
	        Map<String, Object> response = new HashMap<>();
	        if (employee != null && "Employee".equals(employee.getAdditionalRole())) {
	            response.put("success", true);
	            response.put("eName", employee.geteName()); // Employee name
	            response.put("additionalRole", employee.getAdditionalRole()); // Additional role
	        } else {
	            response.put("success", false);
	        }

	        return ResponseEntity.ok(response);
	    }
}
