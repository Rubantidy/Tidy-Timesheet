package timesheet.admin.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import timesheet.admin.dao.Codesdao;

public interface CodeRepo extends JpaRepository<Codesdao, Integer> {

}
