package timesheet.login;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import timesheet.admin.dao.Employeedao;


@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Validate the login credentials
        Employeedao employee = employeeService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());

        if (employee != null) {
            // Successful login, return role and success status
            return ResponseEntity.ok(new LoginResponse(true, employee.getE_Role(), employee.getStatus()));
        } else {
            // Invalid credentials
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse(false, null, null));
        }
    }
}
