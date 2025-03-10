package timesheet.employee.dao;

import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "summary_entries")
public class SummaryEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String period;

    @Column(columnDefinition = "TEXT")
    private String summaryData;

    public SummaryEntry() {}

    public SummaryEntry(String username, String period, Map<String, Object> summaryData) {
        this.username = username;
        this.period = period;
        this.summaryData = new Gson().toJson(summaryData);
    }

    public Map<String, Object> getSummaryData() {
        return new Gson().fromJson(this.summaryData, new TypeToken<Map<String, Object>>() {}.getType());
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

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public void setSummaryData(String summaryData) {
		this.summaryData = summaryData;
	}

	@Override
	public String toString() {
		return "SummaryEntry [id=" + id + ", username=" + username + ", period=" + period + ", summaryData="
				+ summaryData + "]";
	}
    
    
    
}

