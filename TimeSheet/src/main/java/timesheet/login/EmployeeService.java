package timesheet.login;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import timesheet.admin.dao.Employeedao;


@Service
public class EmployeeService {
 
    @Autowired
    private LoginRepository LoginRepository;
 
    public Employeedao authenticate(String email, String password) {
        // Fetch the employee by email (you may want to add more checks here)
        Employeedao employee = LoginRepository.findByeMail(email);
 
        if (employee != null && employee.getePassword().equals(password)) {
            return employee; // Return employee if password matches
        }
        return null; // Return null if authentication fails
    }
}


