package timesheet.employee.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import timesheet.admin.dao.Employeedao;
import timesheet.employee.repo.UserRepository;

@Service
public class UserService {

	
	 @Autowired
	    private UserRepository userRepository;
	 
	    public Employeedao authenticate(String eMail, String ePassword) {
	        return userRepository.findByEMailAndEPassword(eMail, ePassword);
	    }
}
