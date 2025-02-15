package timesheet.employee;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Employeedao;
import timesheet.employee.service.UserService;


@Component
@RestController
public class EmployeeController {

	
	@Autowired
    private UserService userService;
	
	@GetMapping("/Employee")
	public String M1( ) {
		return "Employee/Employee";
	}
	
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Employeedao loginReq) {
    	Employeedao user = userService.authenticate(loginReq.geteMail(), loginReq.getePassword());
        
        if (user != null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login Successful");
            response.put("role", user.getE_Role());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
    }
}
