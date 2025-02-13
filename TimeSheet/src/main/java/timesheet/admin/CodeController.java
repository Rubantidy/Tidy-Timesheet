package timesheet.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import timesheet.admin.dao.Codesdao;
import timesheet.admin.repo.CodeRepo;

@Component
@Controller
public class CodeController {
	
		@Autowired
		private CodeRepo Crepo;

	    @PostMapping("/addChargeCode")
	    public ResponseEntity<String> addCodes(@RequestBody Codesdao code) {
	        // Before saving, set fields that are not applicable to - or null
	        if ("charge-code".equals(code.getCodeType())) {
	            // Ensure leaveCode and leaveName are null for charge-code
	            code.setLeaveCode(null);
	            code.setLeaveName(null);
	        } else if ("leave-code".equals(code.getCodeType())) {
	            // Ensure chargeCode related fields are null for leave-code
	            code.setClientName(null);
	            code.setOnboardDate(null);
	            code.setCountry(null);
	            code.setDescription(null);
	            code.setChargeCode(null);
	        }

	        // Save the code entry in the database
	        Crepo.save(code);
	        System.out.println(code);
	        return ResponseEntity.ok("Charge code was successully saved");
	    }
}
