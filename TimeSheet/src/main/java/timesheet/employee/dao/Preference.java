package timesheet.employee.dao;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "preferences")
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String period;  // Stores selected period (e.g., "01/03/2024 - 15/03/2024")

    @Column(columnDefinition = "TEXT")
    private String approvers;

    @Column(columnDefinition = "TEXT")
    private String reviewers;

    @Column(columnDefinition = "TEXT")
    private String delegator;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public String getApprovers() {
		return approvers;
	}

	public void setApprovers(String approvers) {
		this.approvers = approvers;
	}

	public String getReviewers() {
		return reviewers;
	}

	public void setReviewers(String reviewers) {
		this.reviewers = reviewers;
	}

	public String getDelegator() {
		return delegator;
	}

	public void setDelegator(String delegator) {
		this.delegator = delegator;
	}

	@Override
	public String toString() {
		return "Preference [id=" + id + ", period=" + period + ", approvers=" + approvers + ", reviewers=" + reviewers
				+ ", delegator=" + delegator + "]";
	}
    
    
    
}
