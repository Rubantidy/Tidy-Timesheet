package timesheet.admin.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.Employeedao;

public interface EmployeeRepo extends JpaRepository<Employeedao, Integer> {


    
    Employeedao findByeName(String name); //for checking additional role for switching and admin
    
    Employeedao findByeMail(String email); //for checking  role  and mail for switching form employee
    
    List<Employeedao> findBystatus(String status);

}

