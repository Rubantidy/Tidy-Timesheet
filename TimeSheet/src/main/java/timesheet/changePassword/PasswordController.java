package timesheet.changePassword;

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
    public ResponseEntity<OtpResponse> sendOtp(@RequestBody EmailRequest emailRequest) {
    	
        String email = emailRequest.getEmail();
        Employeedao employee = emrepo.findByeName(email);
        

        // Generate 6-digit OTP
        String otp = emailService.generateOtp();

        // Send OTP email
        emailService.sendOtp(employee, otp);

        // Return response
        return ResponseEntity.ok(new OtpResponse(true, "OTP sent successfully to your email"));
    }

    // Endpoint to verify OTP and change password
    @PostMapping("/change-password")
    public ResponseEntity<OtpResponse> changePassword(@RequestBody PasswordChangeRequest passwordChangeRequest) {
        String email = passwordChangeRequest.getEmail();
        String enteredOtp = passwordChangeRequest.getOtp(); // Get the OTP entered by the user

        // Validate OTP
        boolean otpValid = emailService.validateOtp(email, enteredOtp);
        if (!otpValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new OtpResponse(false, "Invalid or expired OTP"));
        }

        // Perform password change (logic to update the password in the database)
        String newPassword = passwordChangeRequest.getNewPassword();
        // Assuming you have a method to update the password in the database
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
            employee.setePassword(newPassword); // Assuming you have a password setter in your DAO
            emrepo.save(employee); // Save the updated password
            return true;
        }
        return false;
    }

}

