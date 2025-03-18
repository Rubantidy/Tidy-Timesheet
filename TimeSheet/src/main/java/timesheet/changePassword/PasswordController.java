package timesheet.changePassword;

import java.io.UnsupportedEncodingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;

@RestController
public class PasswordController {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private EmployeeRepo emrepo;

    // Endpoint to send OTP
    @PostMapping("/send-otp")
    public ResponseEntity<OtpResponse> sendOtp(@RequestBody EmailRequest emailRequest) throws UnsupportedEncodingException {
    	
        String email = emailRequest.getEmail();

        

        // Generate 6-digit OTP
        String otp = emailService.generateOtp();

        // Send OTP email
        emailService.sendOtp(email, otp);

        // Return response
        return ResponseEntity.ok(new OtpResponse(true, "OTP sent successfully to your email"));
    }

    // Endpoint to verify OTP and change password
    @PostMapping("/change-password")
    public ResponseEntity<OtpResponse> changePassword(@RequestBody PasswordChangeRequest passwordChangeRequest) throws UnsupportedEncodingException {
        String email = passwordChangeRequest.getEmail();


       
        Employeedao employee = emrepo.findByeName(email);
        String mail = employee.geteMail();

        String enteredOtp = passwordChangeRequest.getOtp(); // Get the OTP entered by the user

        // Validate OTP
        boolean otpValid = emailService.validateOtp(mail, enteredOtp);
  
       
        if (!otpValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new OtpResponse(false, "Invalid or expired OTP"));
        }

        // If OTP is valid, proceed with password update
        String newPassword = passwordChangeRequest.getNewPassword();
        boolean passwordUpdated = updatePasswordInDatabase(email, newPassword);

        if (!passwordUpdated) {
          
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new OtpResponse(false, "Failed to update password"));
        }

        // Send confirmation email
        emailService.sendPasswordChangedConfirmation(email);

        // Return success response
        return ResponseEntity.ok(new OtpResponse(true, "Password changed successfully"));
    }

    
    private boolean updatePasswordInDatabase(String email, String newPassword) {
        Employeedao employee = emrepo.findByeName(email);

        if (employee != null) {
           
            employee.setePassword(newPassword); // Update the password
            emrepo.save(employee); // Save the updated password


            return true;
        }


        return false;
    }


}

