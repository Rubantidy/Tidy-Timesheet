package timesheet.login;

//LoginResponse.java


public class LoginResponse {
 private boolean success;
 private String role;
 private String status;

 public LoginResponse(boolean success, String role, String status) {
     this.success = success;
     this.role = role;
     this.status = status;
 }

 public String getStatus() {
	return status;
}

public void setStatus(String status) {
	this.status = status;
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

