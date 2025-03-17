package timesheet.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.transaction.Transactional;
import timesheet.admin.dao.Codedao;
import timesheet.admin.dao.Expensedao;
import timesheet.admin.repo.AssignmentRepository;
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
	  

	  @Autowired
	  private AssignmentRepository assignmentRepository;

	     
	  @PostMapping("/addChargeCode")
	    public String addChargeCode(@RequestBody Map<String, String> requestData) {

	        String codeType = requestData.getOrDefault("codeType", "-");
	        String code = requestData.getOrDefault("code", "-");
	        String clientName = requestData.getOrDefault("clientName", "-");
	        String projectType = requestData.getOrDefault("projectType", "-");
	        String startDate = requestData.getOrDefault("startDate", "-");
	        String country = requestData.getOrDefault("country", "-");
	        String description = requestData.getOrDefault("description", "-");
	    

	        Codedao newCode;

	        if ("Leave code".equalsIgnoreCase(codeType)) {
	            newCode = new Codedao(codeType, code, description);
	        } else {
	            newCode = new Codedao(codeType, code, clientName, projectType, startDate, country, description);
	        }

	        codeRepository.save(newCode);

	        return "Charge Code added successfully!";
	    }


	    
	    @GetMapping("/getChargecodes")
	    public ResponseEntity<List<Codedao>> getCodes() {
	        List<Codedao> Code = codeRepository.findAll();
	        return ResponseEntity.ok(Code);
	    }
	    
	    @PutMapping("/completeChargeCode/{id}")
	    @Transactional  // ✅ Add this annotation to handle delete queries
	    public ResponseEntity<Map<String, Object>> completeChargeCode(@PathVariable int id) {
	        Optional<Codedao> chargeCodeOpt = codeRepository.findById(id);

	        if (chargeCodeOpt.isPresent()) {
	            Codedao chargeCode = chargeCodeOpt.get();

	            // Only allow completion if it's still in "Progress"
	            if (!"Complete".equalsIgnoreCase(chargeCode.getStatus())) {
	                
	                // **Delete all assignments related to this charge code**
	                assignmentRepository.deleteByChargeCode(chargeCode.getCode());

	                // **Update charge code status to "Complete"**
	                chargeCode.setStatus("Complete");
	                codeRepository.save(chargeCode);

	                Map<String, Object> response = new HashMap<>();
	                response.put("success", true);
	                return ResponseEntity.ok(response);
	            } else {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                    .body(Map.of("success", false, "message", "Charge Code is already marked as Complete!"));
	            }
	        }

	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	            .body(Map.of("success", false, "message", "Charge Code not found!"));
	    }

	    
	    @PostMapping("/addExpenseCode")
	    public String addExpense(@RequestBody Expensedao Expense) {
	    	Exrepo.save(Expense);
	    	return "Expese Data Saved Successfully";
	    }
	    
	    @GetMapping("/getExpensecode")
	    public ResponseEntity<List<Expensedao>> getExpense() {
	        List<Expensedao> ExCode = Exrepo.findAll();

	        return ResponseEntity.ok(ExCode);
	    }
	    
	    
	    @GetMapping("/getNextCodeIncrement")
	    public int getNextCodeIncrement() {
	        return chargeCodeService.getNextCodeIncrement();
	    }
	   
	    
	   

	    
	    
}
