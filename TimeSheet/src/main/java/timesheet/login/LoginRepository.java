package timesheet.login;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import timesheet.admin.dao.Employeedao;

@Repository
public interface LoginRepository extends JpaRepository<Employeedao, Integer> {
    // Use 'findByeMail' to match the 'eMail' field in your entity class
    Employeedao findByeMail(String eMail);
}

