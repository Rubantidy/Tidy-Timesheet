package timesheet.employee.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import timesheet.admin.dao.Employeedao;

@Repository
public interface UserRepository extends JpaRepository<Employeedao, Integer> {
	Employeedao findByEMailAndEPassword(String eMail, String ePassword); 
  // Matches entity field names
}
