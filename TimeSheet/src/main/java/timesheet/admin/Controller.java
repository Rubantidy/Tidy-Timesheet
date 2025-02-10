package timesheet.admin;

import org.springframework.web.bind.annotation.GetMapping;


@org.springframework.stereotype.Controller
public class Controller {
	 
	@GetMapping("/landing")
	public String M1() {
		return "Admin/Admin_panel.html";
	}
	
	
	 @GetMapping("/addEmployee")
	    public String addEmployee() {
	        // Save to DB (use a service layer)
	        System.out.println("Saving Employee");
	        return "redirect:/Admin/Admin_panel";
	    }
	
}
