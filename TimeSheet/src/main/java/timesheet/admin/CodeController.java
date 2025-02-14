package timesheet.admin;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Codedao;
import timesheet.admin.repo.CodeRepo;

@Component
@RestController
public class CodeController {

	  @Autowired
	    private CodeRepo codeRepository;

	    // Endpoint to add Charge Code
	  @PostMapping("/addChargeCode")
	    public String addChargeCode(@RequestBody Map<String, String> requestData) {
		  System.out.println("Received Data: " + requestData);
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

	    // Endpoint to add Leave Code
	    @PostMapping("/addLeaveCode")
	    public String addLeaveCode(@RequestBody Map<String, String> requestData) {
	        String codeType = requestData.getOrDefault("codeType", "-");
	        String code = requestData.getOrDefault("code", "-");
	        String description = requestData.getOrDefault("description", "-");

	        Codedao newLeaveCode = new Codedao(codeType, code, description);
	        System.out.println(newLeaveCode);
	        codeRepository.save(newLeaveCode);

	        return "Leave Code added successfully!";
	    }
}
