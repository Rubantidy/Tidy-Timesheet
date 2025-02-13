package timesheet.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import timesheet.admin.dao.Codesdao;
import timesheet.admin.dao.Expensedao;
import timesheet.admin.repo.CodeRepo;
import timesheet.admin.repo.ExpenseRepo;

@Component
@Controller
public class CodeController {
	
		@Autowired
		private CodeRepo Crepo;
		
		@Autowired
		private ExpenseRepo Erepo;
	

	    @PostMapping("/addChargeCode")
	    public ResponseEntity<String> addCodes(@RequestBody Codesdao code) {
	        
	        if ("charge-code".equals(code.getCodeType())) {
	           
	            code.setLeaveCode(null);
	            code.setLeaveName(null);
	        } else if ("leave-code".equals(code.getCodeType())) {
	       
	            code.setProject(null);
	        	code.setClientName(null);
	            code.setOnboardDate(null);
	            code.setCountry(null);
	            code.setDescription(null);
	            code.setChargeCode(null);
	        }

	        
	        Crepo.save(code);
	        System.out.println(code);
	        return ResponseEntity.ok("Charge code was successully saved");
	    }
	    
	    
	    @GetMapping("/getChargecodes")
	    public ResponseEntity<List<Codesdao>> getChargeCodes() {
	        List<Codesdao> codesList = Crepo.findAll(); 
	        System.out.println(codesList);
	        return ResponseEntity.ok(codesList);
	    }
	    
	    
	    @PostMapping("/addExpenseCode")
	    public ResponseEntity<String> addExpense(@RequestBody Expensedao expense) {

	    	Erepo.save(expense);
	    	return ResponseEntity.ok("Expense Details saved Successfully");
	    }
	    
}
