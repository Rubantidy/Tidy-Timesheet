package timesheet.admin.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.Codedao;

public interface CodeRepo extends JpaRepository<Codedao, Integer> {

}
