package timesheet.admin.dao;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "Codes")
public class Codedao {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String codeType;   // "Charge code" or "Leave code"
    private String code;       // Stores Charge Code or Leave Code
    private String clientName; // Client Name (Charge Code form) or "-"
    private String projectType;// Project Type (Charge Code form) or "-"
    private String startDate;  // Start Date (Charge Code form) or "-"
    private String country;    // Country (Charge Code form) or "-"
    private String description;// Stores Description (Charge Code form) or Leave Name (Leave Code form)

    public Codedao() {}

    // Constructor for Charge Code
    public Codedao(String codeType, String code, String clientName, String projectType, String startDate, String country, String description) {
        this.codeType = codeType;
        this.code = code;
        this.clientName = clientName;
        this.projectType = projectType;
        this.startDate = startDate;
        this.country = country;
        this.description = description;
    }

    // Constructor for Leave Code
    public Codedao(String codeType, String code, String description) {
        this.codeType = codeType;
        this.code = code;       // Leave Code stored here
        this.description = description; // Leave Name stored here
        this.clientName = "-";
        this.projectType = "-";
        this.startDate = "-";
        this.country = "-";
    }

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCodeType() {
		return codeType;
	}

	public void setCodeType(String codeType) {
		this.codeType = codeType;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getClientName() {
		return clientName;
	}

	public void setClientName(String clientName) {
		this.clientName = clientName;
	}

	public String getProjectType() {
		return projectType;
	}

	public void setProjectType(String projectType) {
		this.projectType = projectType;
	}

	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	public String toString() {
		return "Codedao [id=" + id + ", codeType=" + codeType + ", code=" + code + ", clientName=" + clientName
				+ ", projectType=" + projectType + ", startDate=" + startDate + ", country=" + country
				+ ", description=" + description + "]";
	}
    
    
}
