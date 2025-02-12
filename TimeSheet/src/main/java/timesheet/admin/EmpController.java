package timesheet.admin;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;

@org.springframework.stereotype.Controller
public class EmpController {

    @Autowired
    private EmployeeRepo EmpRepo;

    @Autowired
    private JavaMailSender mailSender;  

    @GetMapping("/landing")
    public String M1() {
        System.out.println("Hello world");
        System.out.println("World Hello");
        return "Admin/Admin_panel";
    }

    @PostMapping("/addEmployee")
    public ResponseEntity<String> addEmployee(@RequestBody Employeedao EmpData) throws IOException {
        System.out.println("Received Employee Data: " + EmpData);
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


        helper.setTo(EmpData.getE_Mail());
        helper.setSubject("Welcome to the Tidy Digital Solutions");
        
        String emailContent = "<html><body>"
                + "<h2>Welcome " + EmpData.getE_Name() + "!</h2>"
                + "<p>Here are your Temproray Login Credentials:</p>"
                + "<p><b>Email:</b> " + EmpData.getE_Mail() + "</p>"
                + "<p><b>Password:</b> " + EmpData.getE_Password() + "</p>"
                + "<p><b>Role:</b> " + EmpData.getE_Role() + "</p><br>"
                + "<p><b>Tidy Timesheet URL - </b><a href=\"https://rm.tidyds.com\">https://rm.tidyds.com</a></p>\r\n"
                + "<h3>Note*<p>After Login into Timesheet, Please update the User details</p>"
                + "<img src='cid:logoImage' width='200'/>"
                + "<p>Best Regards, <br>Tidy Digital Solutions</p>"
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
}
