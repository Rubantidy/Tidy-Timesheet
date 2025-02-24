package timesheet.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
