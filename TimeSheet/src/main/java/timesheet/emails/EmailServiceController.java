package timesheet.emails;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import timesheet.admin.dao.Employeedao;
import timesheet.payroll.dao.AddSalary;

@Service
public class EmailServiceController {
	
	
	    @Autowired
	    private JavaMailSender mailSender;  

	
	 public void sendEmployeeEmail(Employeedao EmpData) throws MessagingException, IOException {
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
	                 + "<p><strong>Your salary details will be sent via email within 24 hours.</strong></p>"
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



//update employee details
   public void updateemployeeemail(Employeedao EmpData) throws MessagingException, IOException {


    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);


    helper.setFrom("timex@tidyds.com", "Tidy Digital Solutions");
    helper.setTo(EmpData.geteMail());
    helper.setSubject("Updated Profile Details");
    
    String emailContent = "<html><body>"
    	     + "<h2>Hello " + EmpData.geteName() + ",</h2>"
    	     + "<p>Your employee profile on <strong>Tidy Timesheet</strong> has been successfully updated with the following details:</p>"
    	     + "<p><strong>Email:</strong> " + EmpData.geteMail() + "</p>"
    	     + "<p><strong>Password:</strong>  " + EmpData.getePassword() + " (unchanged) — Your existing password remains the same.</p>"
    	     + "<p><strong>Designation:</strong> " + EmpData.getDesignation() + "</p>"
    	     + "<p><strong>Role:</strong> " + EmpData.getE_Role() + "</p>"
    	     + "<br>"
    	     + "<p>You can access the Tidy Timesheet portal using the link below:</p>"
    	     + "<p><a href=\"https://timex.tidyds.com\">https://timex.tidyds.com</a></p>"
    	     + "<h3>Need Help?</h3>"
    	     + "<p>If you notice any incorrect details or experience issues accessing your account, please contact our support team immediately.</p>"
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
    
   
   public void InitialSalaryEmail(AddSalary salaryData, Employeedao EmpData) throws MessagingException, IOException {
	    MimeMessage message = mailSender.createMimeMessage();
	    MimeMessageHelper helper = new MimeMessageHelper(message, true);

	    helper.setFrom("timex@tidyds.com", "Tidy Digital Solutions");
	    helper.setTo(EmpData.geteMail());  // Get email from employee data object
	    helper.setSubject("Your Initial Salary Details from Tidy Digital Solutions");

	    String emailContent = "<html><body>"
	            + "<h2>Welcome to Tidy Digital Solutions, " + EmpData.geteName() + "!</h2>"
	            + "<p>Dear " + EmpData.geteName() + ",</p>"
	            + "<p>We are pleased to welcome you to Tidy Digital Solutions. We are excited to have you as part of our team. Below are the details of your initial salary package:</p>"
	            + "<p><strong>Employee Name:</strong> " + EmpData.geteName() + "</p>"
	            + "<p><strong>Salary Month:</strong>₹ " + salaryData.getMonthsalary() + "</p>"
	            + "<p><strong>Salary Year:</strong>₹ " + salaryData.getYearsalary() + "</p>"
	            + "<br>"
	            + "<p><strong>Important:</strong> To ensure timely salary processing, kindly update your bank account details on the Timesheet portal in Payslip section at your earliest convenience.</p>"
	            + "<p><strong>Access your Timesheet here:</strong> <a href=\"https://timex.tidyds.com\">Tidy Timesheet Portal</a></p>"
	            + "<p>If you have any questions or need assistance, please do not hesitate to reach out to us.</p>"
	            + "<h3>Important Information</h3>"
	            + "<p>We highly recommend you update your personal and payment details as soon as possible to avoid any delays in your salary processing.</p>"
	            + "<br>"
	            + "<p>We look forward to a successful journey with you at Tidy Digital Solutions.</p>"
	            + "<br>"
	            + "<p>Best regards,<br><strong>Tidy Digital Solutions Team</strong></p>"
	            + "</body></html>";



	    helper.setText(emailContent, true); // This tells Spring to interpret HTML

	    // Add company logo to the email
	    ClassPathResource image = new ClassPathResource("static/img/logo.png");
	    helper.addInline("logoImage", image);

	    // Send the email
	    mailSender.send(message);
	}


   
}
