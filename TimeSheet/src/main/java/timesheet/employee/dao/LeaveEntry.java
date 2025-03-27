package timesheet.employee.dao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_entries")
public class LeaveEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // User-specific tracking

    @Column(nullable = false)
    private int month; // Store leave usage for each month (1-12)

    @Column(nullable = false)
    private int year; // Track leave usage yearly

    @Column(nullable = false)
    private String leaveType; // "Casual Leave" / "Sick Leave"

    @Column(nullable = false)
    private float leaveDays; // Track how many days were taken

    @Column(nullable = false)
    private String period; // Store "01/03/2025 - 15/03/2025" format

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

	public int getMonth() {
		return month;
	}

	public void setMonth(int month) {
		this.month = month;
	}

	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public String getLeaveType() {
		return leaveType;
	}

	public void setLeaveType(String leaveType) {
		this.leaveType = leaveType;
	}

	public float getLeaveDays() {
		return leaveDays;
	}

	public void setLeaveDays(float leaveDays) {
		this.leaveDays = leaveDays;
	}

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	@Override
	public String toString() {
		return "LeaveEntry [id=" + id + ", username=" + username + ", month=" + month + ", year=" + year
				+ ", leaveType=" + leaveType + ", leaveDays=" + leaveDays + ", period=" + period + "]";
	}

    
    
}
