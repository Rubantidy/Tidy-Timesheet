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
    
    
    @GetMapping("/Employee_Dashboard")
	public String Employee() {
		return "Employee/Employee"; 
	}


    @PostMapping("/addEmployee")
    public ResponseEntity<String> addEmployee(@RequestBody Employeedao EmpData) throws IOException {
        
        EmpData.setCreatedDate(LocalDate.now());
        EmpRepo.save(EmpData);


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


        helper.setFrom("timex@tidyds.com", "Tidy Digital Solutions");
        helper.setTo(EmpData.geteMail());
        helper.setSubject("Welcome to the Tidy Digital Solutions");
        
        String emailContent = "<html><body>"
        		 + "<h2>Welcome to Tidy Digital Solutions, " + EmpData.geteName() + "!</h2>"
                 + "<p>We are delighted to have you on board. Below are your temporary login credentials for accessing the Tidy Timesheet system:</p>"
                 + "<p><strong>Email:</strong> " + EmpData.geteMail() + "</p>"
                 + "<p><strong>Temporary Password:</strong> " + EmpData.getePassword() + "</p>"
                 + "<p><strong>Designation:</strong> " + EmpData.getDesignation() + "</p>"
                 + "<p><strong>Role:</strong> " + EmpData.getE_Role() + "</p>"
                 + "<br>"
                 + "<p><strong>Access your Timesheet here:</strong> <a href=\"https://timex.tidyds.com\">Tidy Timesheet Portal</a></p>"
                 + "<h3>Important Information</h3>"
                 + "<p><strong>Note:</strong> Upon your first login, please update your user details to ensure accuracy.</p>"
                 + "<p>If you encounter any issues while logging in, feel free to contact our support team for assistance.</p>"
                 + "<br>"
                 + "<p>We look forward to working with you and wish you great success in your role.</p>"
                 + "<br>"
                 + "<img src='cid:logoImage' width='200' alt='Company logo' />"
                 + "<p>Best Regards,<br><b>Tidy Digital Solutions Team</b></p>"
                 + "</body></html>";


        helper.setText(emailContent, true); 

        ClassPathResource image = new ClassPathResource("static/img/logo.png");
        helper.addInline("logoImage", image);
         
        // Send the email
        mailSender.send(message);
    }
    
//    @PostMapping("/updateEmployee")
//    public ResponseEntity<String> updateEmployee(@RequestBody Map<String, String> requestData) throws UnsupportedEncodingException {
//        int employeeId = Integer.parseInt(requestData.get("id"));
//        Optional<Employeedao> optionalEmp = EmpRepo.findById(employeeId);
//
//        if (!optionalEmp.isPresent()) {
//            return ResponseEntity.status(404).body("Employee not found");
//        }
//
//        Employeedao employee = optionalEmp.get();
//        long oldSalary = employee.getSalary();
//        long newSalary = Long.parseLong(requestData.get("salary"));
//
//        boolean salaryChanged = oldSalary != newSalary;
//        boolean roleChanged = !employee.getE_Role().equals(requestData.get("role"));
//
//        // Update salary and role
//        employee.setSalary(newSalary);
//        employee.setE_Role(requestData.get("role"));
//        EmpRepo.save(employee);
//
//        // Send email notifications
//        try {
//            if (salaryChanged) {
//                double percentageHike = ((double) (newSalary - oldSalary) / oldSalary) * 100;
//                if (!roleChanged) {
//                    sendAppraisalEmail(employee, percentageHike);
//                } else {
//                    sendPromotionEmail(employee, percentageHike);
//                }
//            }
//        } catch (MessagingException e) {
//            return ResponseEntity.status(500).body("Update successful, but email failed to send.");
//        }
//
//        return ResponseEntity.ok("Employee updated successfully!");
//    }
//
//    // Email notification for salary appraisal with percentage hike
//    private void sendAppraisalEmail(Employeedao employee, double percentageHike) throws MessagingException, UnsupportedEncodingException {
//        MimeMessage message = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//        helper.setFrom("timex@tidyds.com", "Tidy Digital Solutions");
//        helper.setTo(employee.geteMail());
//        helper.setSubject("🎉 Salary Appraisal Notification!");
//
//        String emailContent = "<html><body>"
//                + "<h2>Congratulations, " + employee.geteName() + "!</h2>"
//                + "<p>We are pleased to inform you that, based on your hard work and dedication, your salary has been increased by <b>" 
//                + String.format("%.2f", percentageHike) + "%</b>.</p>"
//                + "<p><b>New Salary:</b> ₹" + employee.getSalary() + "/- per month</p>"
//                + "<p>This increment reflects your valuable contributions to Tidy Digital Solutions. We appreciate your efforts and look forward to your continued excellence.</p>"
//                + "<br>"
//                + "<p>If you have any questions regarding this update, feel free to reach out to the Admin Department.</p>"
//                + "<br>"
//                  + "<img src='cid:logoImage' width='200' alt='Company logo' />"
//                + "<p>Best Regards,<br><b>Tidy Digital Solutions Team</b></p>"
//                + "</body></html>";
//
//        helper.setText(emailContent, true);
//
//        ClassPathResource image = new ClassPathResource("static/img/logo.png");
//        helper.addInline("logoImage", image);
//
//        mailSender.send(message);
//    }
//
//    // Email notification for promotion + salary increase with percentage hike
//    private void sendPromotionEmail(Employeedao employee, double percentageHike) throws MessagingException, UnsupportedEncodingException {
//        MimeMessage message = mailSender.createMimeMessage();
//        MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//        helper.setFrom("timex@tidyds.com", "Tidy Digital Solutions");
//        helper.setTo(employee.geteMail());
//        helper.setSubject("🚀 Promotion & Salary Increase Notification!");
//
//        String emailContent = "<html><body>"
//                + "<h2>Congratulations on Your Promotion, " + employee.geteName() + "!</h2>"
//                + "<p>We are pleased to inform you that you have been promoted to the position of <b>" + employee.getE_Role() + "</b>.</p>"
//                + "<p>As part of this promotion, your salary has been increased by <b>" + String.format("%.2f", percentageHike) + "%</b>.</p>"
//                + "<p><b>New Salary:</b> ₹" + employee.getSalary() + "/- per month</p>"
//                + "<br>"
//                + "<p>We appreciate your valuable contributions to Tidy Digital Solutions and look forward to your continued excellence in this new role.</p>"
//                + "<br>"
//                + "<p>If you have any questions or require further details, please feel free to reach out to the Admin Department.</p>"
//                + "<br>"
//                 + "<img src='cid:logoImage' width='200' alt='Company logo' />"
//                + "<p>Best Regards,<br><b>Tidy Digital Solutions Team</b></p>"
//                + "</body></html>";
//
//        helper.setText(emailContent, true);
//
//        ClassPathResource image = new ClassPathResource("static/img/logo.png");
//        helper.addInline("logoImage", image);
//        mailSender.send(message);
//    }

    
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
        // Fetch only active employees from the database
        List<Employeedao> employees = EmpRepo.findBystatus("active"); // Fetch active employees

        List<Map<String, String>> employeeList = new ArrayList<>();
        
        // Iterate through the list of employees and add them to employeeList
        for (Employeedao emp : employees) {
            Map<String, String> map = new HashMap<>();
            map.put("name", emp.geteName()); // Assuming `getEname()` returns employee name
            map.put("email", emp.geteMail()); // Assuming `getEmail()` returns email
            map.put("designation", emp.getDesignation()); // Assuming `getDesignation()` returns employee's designation
            employeeList.add(map);
        }

        return ResponseEntity.ok(employeeList);
    }

    
    @PostMapping("/addDelegate")
    public ResponseEntity<String> addDelegator(@RequestBody Delegatedao Dele) {
    	Delrepo.save(Dele);
    	return ResponseEntity.ok("Delegator Data Saved Successfully");
    }
    
    @GetMapping("/getDelegator")
    public ResponseEntity<List<Delegatedao>> getDelegators() {
        List<Delegatedao> Delegator = Delrepo.findAll();
        return ResponseEntity.ok(Delegator);
    }
    
    
    
   

    
}
