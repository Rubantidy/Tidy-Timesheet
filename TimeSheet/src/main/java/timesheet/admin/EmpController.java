package timesheet.admin;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import timesheet.admin.dao.Delegatedao;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.DelegateRepo;
import timesheet.admin.repo.EmployeeRepo;

@org.springframework.stereotype.Controller
public class EmpController {

    @Autowired
    private EmployeeRepo EmpRepo;
    
    @Autowired
    private DelegateRepo Delrepo;

    @Autowired
    private JavaMailSender mailSender;  

    @GetMapping("/Admin_Dashboard")
    public String M1() {
        return "Admin/Admin_panel";
    }
    
//    @PostConstruct
//    public void defaultadmin() {
//    	EmpRepo.insertDefaultAdmin();
//    }

    @PostMapping("/addEmployee")
    public ResponseEntity<String> addEmployee(@RequestBody Employeedao EmpData) throws IOException {
        
        EmpData.setCreatedDate(LocalDate.now());
        EmpRepo.save(EmpData);
        System.out.println(EmpData);

        try {
            sendEmployeeEmail(EmpData);
        } catch (MessagingException e) {  
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send email.");
        }

        return ResponseEntity.ok("Employee saved successfully and email sent!");
    }

    private void sendEmployeeEmail(Employeedao EmpData) throws MessagingException, IOException {


        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);


        helper.setFrom("rubanmtidyds@gmail.com", "Tidy Digital Solutions");
        helper.setTo(EmpData.geteMail());
        helper.setSubject("Welcome to the Tidy Digital Solutions");
        
        String emailContent = "<html><body>"
                + "<h2>Welcome, " + EmpData.geteName() + "!</h2>"
                + "<p>We are excited to have you on board! Below are your temporary login credentials for accessing the Tidy Timesheet system:</p>"
                + "<p><b>Email:</b> " + EmpData.geteMail() + "</p>"
                + "<p><b>Password:</b> " + EmpData.getePassword() + "</p>"
                + "<p><b>Designation:</b> " + EmpData.getDesignation() + "</p>"
                + "<p><b>Role:</b> " + EmpData.getE_Role() + "</p><br>"
                + "<p><b>Access your Timesheet here:</b> <a href=\"https://rm.tidyds.com\">https://rm.tidyds.com</a></p>"
                + "<h3>Important:</h3>"
                + "<p><b>Note:</b> After logging into the Timesheet, please update your user details to ensure accurate information.</p>"
                + "<p><b>If you face any issues with logging in, feel free to contact support.</b></p>"
                + "<br><br>"
                + "<p>We look forward to having you onboard! If you have any questions, feel free to reach out to us.</p>"
                + "<img src='cid:logoImage' width='200'/>"
                + "<p>Best Regards,<br>Tidy Digital Solutions Team</p>"
                + "</body></html>";


        helper.setText(emailContent, true); 

        ClassPathResource image = new ClassPathResource("static/img/logo.png");
        helper.addInline("logoImage", image);
         
        // Send the email
        mailSender.send(message);
    }

    @GetMapping("/getEmployees")
    public ResponseEntity<List<Employeedao>> getEmployees() {
        List<Employeedao> employees = EmpRepo.findAll();
        return ResponseEntity.ok(employees);
    }
    
    //Update Employee 
    @PutMapping("/updateEmployeeStatus/{id}")
    public ResponseEntity<String> updateEmployeeStatus(@PathVariable int id) {
        Optional<Employeedao> employeeOptional = EmpRepo.findById(id);
        if (employeeOptional.isPresent()) {
            Employeedao employee = employeeOptional.get();
            if ("active".equalsIgnoreCase(employee.getStatus())) {
                employee.setStatus("deactive");
            } else {
                employee.setStatus("active");
            }
            EmpRepo.save(employee);
            return ResponseEntity.ok("Employee status updated successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found.");
        }
    }

    
    //Get Employee for display in the delegate form
    @GetMapping("/getEmployeedata")
    public ResponseEntity<List<Map<String, String>>> getEmployeeData() {
        List<Employeedao> employees = EmpRepo.findAll(); // Fetch from DB
        List<Map<String, String>> employeeList = new ArrayList<>();

        for (Employeedao emp : employees) {
            Map<String, String> map = new HashMap<>();
            map.put("name", emp.geteName()); // Assuming `getEname()` returns employee 0
            map.put("email", emp.geteMail()); // Assuming `getEmail()` returns email
            employeeList.add(map);
            
        }

        return ResponseEntity.ok(employeeList);
    }
    
    @PostMapping("/addDelegate")
    public ResponseEntity<String> addExpense(@RequestBody Delegatedao Dele) {
    	Delrepo.save(Dele);
    	return ResponseEntity.ok("Delegator Data Saved Successfully");
    }
    
    @GetMapping("/getDelegator")
    public ResponseEntity<List<Delegatedao>> getDelegators() {
        List<Delegatedao> Delegator = Delrepo.findAll();
        return ResponseEntity.ok(Delegator);
    }
    
    
    
   

    
}
