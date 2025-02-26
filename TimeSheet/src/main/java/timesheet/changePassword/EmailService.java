package timesheet.changePassword;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import timesheet.admin.dao.Employeedao;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    // Temporary map to store OTPs in memory
    private Map<String, String> otpMap = new HashMap<>();
    private Map<String, Long> otpTimestampMap = new HashMap<>(); // Track OTP expiration time

    // Method to send OTP via email
    public void sendOtp(Employeedao employee, String otp) {
        try {
        	
        	String recive = employee.geteMail();
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);

            // Email content
            messageHelper.setFrom("rubanmtidyds@gmail.com"); // Your email address
            messageHelper.setTo(recive); // Recipient's email address
            messageHelper.setSubject("Your OTP for Password Change");
            messageHelper.setText("Your OTP is: " + otp, true);

            // Send the email
            javaMailSender.send(mimeMessage);
            System.out.println("OTP sent successfully to: " + employee);

            // Store OTP and current timestamp
            otpMap.put(recive, otp);
            otpTimestampMap.put(recive, System.currentTimeMillis());  // Store the timestamp
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error while sending OTP email.");
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
        if (System.currentTimeMillis() - timestamp > TimeUnit.MINUTES.toMillis(5)) {
            otpMap.remove(email);  // Remove expired OTP
            otpTimestampMap.remove(email);
            return false;  // OTP expired
        }

        // Compare the provided OTP with the stored OTP
        return storedOtp.equals(otp);
    }

    // Method to send password change confirmation email
    public void sendPasswordChangedConfirmation(String email) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);

            // Email content
            messageHelper.setFrom("rubanmtidyds@gmail.com"); // Your email address
            messageHelper.setTo(email); // Recipient's email address
            messageHelper.setSubject("Password Change Confirmation");
            messageHelper.setText("Your password has been successfully changed. If you did not make this change, please contact support.", true);

            // Send the email
            javaMailSender.send(mimeMessage);
            System.out.println("Password change confirmation email sent to: " + email);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error while sending password change confirmation email.");
        }
    }
}
