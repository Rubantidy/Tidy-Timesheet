package timesheet.employee;

import org.springframework.web.bind.annotation.GetMapping;

@org.springframework.stereotype.Controller
public class EmployeeController {

	@GetMapping("/Employee")
	public String Employee() {
		return "/Employee/Employee"; 
	}
}
