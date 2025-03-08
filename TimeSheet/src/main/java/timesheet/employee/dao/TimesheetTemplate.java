package timesheet.employee.dao;

import java.util.Map;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "timesheet_template")
public class TimesheetTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String chargeCode;

    @ElementCollection
    private Map<Integer, String> weekdays; // Stores Monday-Saturday values

	@Override
	public String toString() {
		return "TimesheetTemplate [id=" + id + ", username=" + username + ", chargeCode=" + chargeCode + "]";
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getChargeCode() {
		return chargeCode;
	}

	public void setChargeCode(String chargeCode) {
		this.chargeCode = chargeCode;
	}

	public Map<Integer, String> getWeekdays() {
		return weekdays;
	}

	public void setWeekdays(Map<Integer, String> weekdays) {
		this.weekdays = weekdays;
	}

    // Getters and Setters
}

