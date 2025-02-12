package timesheet.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;


@org.springframework.stereotype.Controller
public class Controller {
	 
	@Autowired
	private EmployeeRepo EmpRepo;  
	
	@GetMapping("/landing")
	public String M1() {
		
		System.out.println("Hello world");
		System.out.println("World Hello");
		return "Admin/Admin_panel";
		
	}
	
	@PostMapping("/addEmployee")
    public ResponseEntity<String> addEmployee(@RequestBody Employeedao EmpData) {
		System.out.println("Received Employee Data: " + EmpData);
	    
	    EmpRepo.save(EmpData);
	    return ResponseEntity.ok("Employee saved successfully!");
    }
	
 
	
}
