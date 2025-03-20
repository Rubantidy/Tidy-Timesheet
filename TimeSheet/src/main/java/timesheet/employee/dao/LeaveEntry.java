package timesheet.employee.dao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "leave_entries")
@Getter
@Setter
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

    
    
}
