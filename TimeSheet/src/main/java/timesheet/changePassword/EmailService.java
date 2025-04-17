package timesheet.changePassword;
 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
 
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;
 
@Service
public class EmailService {
 
	@Autowired
	private EmployeeRepo emrepo;
    @Autowired
    private JavaMailSender javaMailSender;
 
    // Temporary map to store OTPs in memory
    private Map<String, String> otpMap = new HashMap<>();
    private Map<String, Long> otpTimestampMap = new HashMap<>(); // Track OTP expiration time
 
    // Method to send OTP via email
    public void sendOtp(String mail, String otp) throws UnsupportedEncodingException {
    	Employeedao employee = emrepo.findByeName(mail);
    	String email = employee.geteMail();
        try {
        	
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);
 
            // Email content
            messageHelper.setFrom("timex@tidyds.com", "Tidy Digital Solutions"); // Your email address
            messageHelper.setTo(email); // Recipient's email address
            messageHelper.setSubject("Your OTP for Password Change Request");

 
            
            String emailContent = "<html><body>"
                    + "<h2>Dear " + employee.geteName() + ",</h2>"
                    + "<p>We have received a request to change the password for your account.</p>"
                    + "<p><b>Your One-Time Password (OTP): </b> " + otp + "</p>"
                    + "<p>Please use this OTP within the next 2 minutes to complete the process. If you did not request this change, please ignore this email or contact us immediately.</p>"
                    + "<br><br>"
                    + "<p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>"
                    + "<img src='cid:logoImage' width='200' alt='Company logo' />"
                    + "<p>Best regards,<br>The Tidy Digital Solutions Team</p>"
                    + "</body></html>";



            messageHelper.setText(emailContent, true); 

            ClassPathResource image = new ClassPathResource("static/img/logo.png");
            messageHelper.addInline("logoImage", image);
 
            javaMailSender.send(mimeMessage);
            
            // Store OTP and current timestamp
            otpMap.put(email, otp);
            otpTimestampMap.put(email, System.currentTimeMillis());  // Store the timestamp
        } catch (MessagingException e) {
            e.printStackTrace();


        }
    }
 
    // Method to generate a 6-digit OTP
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);  // Generate 6-digit OTP
        return String.valueOf(otp);
    }
 
    // Method to validate OTP
    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpMap.get(email);
        Long timestamp = otpTimestampMap.get(email);
 
        if (storedOtp == null || timestamp == null) {
            return false;  // OTP not found
        }
 
        // Check if OTP is expired (5 minutes expiration time)
        if (System.currentTimeMillis() - timestamp > TimeUnit.MINUTES.toMillis(2)) {
            otpMap.remove(email);  // Remove expired OTP
            otpTimestampMap.remove(email);
            return false;  // OTP expired
        }
 
        // Compare the provided OTP with the stored OTP
        return storedOtp.equals(otp);
    }
 
    // Method to send password change confirmation email
    public void sendPasswordChangedConfirmation(String email) throws UnsupportedEncodingException {
    	Employeedao employee = emrepo.findByeName(email);
    	String mail = employee.geteMail();
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);
 
            
            messageHelper.setFrom("timex@tidyds.com", "Tidy Digital Solutions"); 
            messageHelper.setTo(mail); 
            messageHelper.setSubject("Confirmation: Your Password Has Been Successfully Changed");
          
 
            String emailContent = "<html><body>"
                    + "<h2>Dear " + employee.geteName() + ",</h2>"
                    + "<p>We are writing to confirm that your password has been successfully changed.</p>"
                    + "<p>If you did not make this change, please contact our support team immediately for assistance.</p>"
                    + "<br>"
                    + "<p><b>Current Email:</b> " + employee.geteMail() + "</p>"
                    + "<p><b>Updated Password:</b> " + employee.getePassword()+ " (For security reasons, Don't share this Password to anyone.)</p>"
                    + "<br>"
                    + "<img src='cid:logoImage' width='200' alt='Company logo' />"
                    + "<p>Best regards,<br>The Tidy Digital Solutions Team</p>"
                    + "</body></html>";




            messageHelper.setText(emailContent, true); 

            ClassPathResource image = new ClassPathResource("static/img/logo.png");
            messageHelper.addInline("logoImage", image);
            
            // Send the email
            javaMailSender.send(mimeMessage);
            

        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error while sending password change confirmation email.");
        }
    }
}
