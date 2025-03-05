package timesheet.login;

//LoginResponse.java


public class LoginResponse {
 private boolean success;
 private String role;
 private String status;
 private String name;
 private String additionalrole;
 
 public LoginResponse(boolean success, String role, String status, String name, String additionalrole) {
     this.success = success;
     this.role = role;
     this.status = status;
     this.name = name;
     this.additionalrole = additionalrole;
     
 }

 
 public String getAdditionalrole() {
	return additionalrole;
}


public void setAdditionalrole(String additionalrole) {
	this.additionalrole = additionalrole;
}


public String getStatus() {
	return status;
}

public void setStatus(String status) {
	this.status = status;
}

public String getName() {
	return name;
}

public void setName(String name) {
	this.name = name;
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

