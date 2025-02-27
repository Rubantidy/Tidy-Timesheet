package timesheet.admin.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.Employeedao;

public interface EmployeeRepo extends JpaRepository<Employeedao, Integer> {

//    @Modifying
//    @Transactional
//    @Query(value = "INSERT INTO Employee_details (E_name, e_mail, e_password, e_role, created_date, additional_role, status, designation) " +
//                   "VALUES ('Admin', 'admin@gmail.com', 'tidy', 'Admin', CURRENT_DATE, '-', 'active', '-')",
//           nativeQuery = true)
//    void insertDefaultAdmin();
    
    Employeedao findByeName(String name); //for checking additional role for switching and admin
    
    Employeedao findByeMail(String email); //for checking  role  and mail for switching form employee
    
    List<Employeedao> findBystatus(String status);

}

