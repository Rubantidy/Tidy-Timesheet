package timesheet.admin;

import org.springframework.web.bind.annotation.GetMapping;


@org.springframework.stereotype.Controller
public class Controller {
	 
	@GetMapping("/landing")
	public String M1() {
		
		System.out.println("Hello world");
		return "Admin/Admin_panel";
		
	}
	
 
	
}
