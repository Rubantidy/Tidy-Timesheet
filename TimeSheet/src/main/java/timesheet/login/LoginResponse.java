package timesheet.login;

//LoginResponse.java


public class LoginResponse {
 private boolean success;
 private String role;

 public LoginResponse(boolean success, String role) {
     this.success = success;
     this.role = role;
 }

 // Getters and Setters
 public boolean isSuccess() {
     return success;
 }

 public void setSuccess(boolean success) {
     this.success = success;
 }

 public String getRole() {
     return role;
 }

 public void setRole(String role) {
     this.role = role;
 }
}

