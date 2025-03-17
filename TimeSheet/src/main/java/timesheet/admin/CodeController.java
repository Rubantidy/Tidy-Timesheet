package timesheet.admin;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Codedao;
import timesheet.admin.dao.Expensedao;
import timesheet.admin.repo.CodeRepo;
import timesheet.admin.repo.ExpenseRepo;
import timesheet.admin.service.ChargeCodeService;



@Component
@RestController
public class CodeController {

	  @Autowired
	    private CodeRepo codeRepository;
	  
	  @Autowired
	  private ExpenseRepo Exrepo;
	  
	  @Autowired
	    private ChargeCodeService chargeCodeService;
	  


	     
	  @PostMapping("/addChargeCode")
	    public String addChargeCode(@RequestBody Map<String, String> requestData) {

	        String codeType = requestData.getOrDefault("codeType", "-");
	        String code = requestData.getOrDefault("code", "-");
	        String clientName = requestData.getOrDefault("clientName", "-");
	        String projectType = requestData.getOrDefault("projectType", "-");
	        String startDate = requestData.getOrDefault("startDate", "-");
	        String country = requestData.getOrDefault("country", "-");
	        String description = requestData.getOrDefault("description", "-");
	    

	        Codedao newChargeCode = new Codedao(codeType, code, clientName, projectType, startDate, country, description);
	        codeRepository.save(newChargeCode);

	        return "Charge Code added successfully!";
	    }


	    
	    @GetMapping("/getChargecodes")
	    public ResponseEntity<List<Codedao>> getCodes() {
	        List<Codedao> Code = codeRepository.findAll();
	        return ResponseEntity.ok(Code);
	    }
	    
	    @PostMapping("/addExpenseCode")
	    public String addExpense(@RequestBody Expensedao Expense) {
	    	Exrepo.save(Expense);
	    	return "Expese Data Saved Successfully";
	    }
	    
	    @GetMapping("/getExpensecode")
	    public ResponseEntity<List<Expensedao>> getExpense() {
	        List<Expensedao> ExCode = Exrepo.findAll();
	        System.out.println("getting values:" + ExCode);
	        return ResponseEntity.ok(ExCode);
	    }
	    
	    
	    @GetMapping("/getNextCodeIncrement")
	    public int getNextCodeIncrement() {
	        return chargeCodeService.getNextCodeIncrement();
	    }
	   
	    
	   

	    
	    
}
