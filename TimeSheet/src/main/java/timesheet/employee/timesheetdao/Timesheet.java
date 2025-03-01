package timesheet.employee.timesheetdao;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "timesheets")
public class Timesheet {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	  

		private String employeeName;
	    private String period;  // e.g., "01/03/2025 - 15/03/2025"
	    private String status;  // "Saved" or "Submitted"

	    // ✅ Use OneToMany with Cascade for automatic entry handling
	    @OneToMany(mappedBy = "timesheet", cascade = CascadeType.ALL, orphanRemoval = true)
	    private List<TimesheetEntry> entries;
	    
	    
	    @Override
	  		public String toString() {
	  			return "Timesheet [id=" + id + ", employeeName=" + employeeName + ", period=" + period + ", status="
	  					+ status + ", entries=" + entries + "]";
	  		}

	  		public Long getId() {
	  			return id;
	  		}

	  		public void setId(Long id) {
	  			this.id = id;
	  		}

	  		public String getEmployeeName() {
	  			return employeeName;
	  		}

	  		public void setEmployeeName(String employeeName) {
	  			this.employeeName = employeeName;
	  		}

	  		public String getPeriod() {
	  			return period;
	  		}

	  		public void setPeriod(String period) {
	  			this.period = period;
	  		}

	  		public String getStatus() {
	  			return status;
	  		}

	  		public void setStatus(String status) {
	  			this.status = status;
	  		}

	  		public List<TimesheetEntry> getEntries() {
	  			return entries;
	  		}

	  		public void setEntries(List<TimesheetEntry> entries) {
	  			this.entries = entries;
	  		}
}

