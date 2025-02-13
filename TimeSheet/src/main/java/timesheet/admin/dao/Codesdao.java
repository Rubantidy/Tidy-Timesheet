package timesheet.admin.dao;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Codes_details")
public class Codesdao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	//Charge code form
	@JsonProperty("C-type")
    private String codeType; 
	
	@JsonProperty("C-clientname")
    private String clientName;
	
	@JsonProperty("C-onboard")
    private String onboardDate;
	
	@JsonProperty("C-country")
    private String country;  
	
	@JsonProperty("C-desc")
    private String description;
	
	@JsonProperty("C-code")
    private String chargeCode;  

    // Leave Code specific fields
	
	@JsonProperty("L-code")
    private String leaveCode;
	
	@JsonProperty("L-name")
    private String leaveName;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCodeType() {
		return codeType;
	}

	public void setCodeType(String codeType) {
		this.codeType = codeType;
	}

	public String getClientName() {
		return clientName;
	}

	public void setClientName(String clientName) {
		this.clientName = clientName;
	}

	public String getOnboardDate() {
		return onboardDate;
	}

	public void setOnboardDate(String onboardDate) {
		this.onboardDate = onboardDate;
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

	public String getChargeCode() {
		return chargeCode;
	}

	public void setChargeCode(String chargeCode) {
		this.chargeCode = chargeCode;
	}

	public String getLeaveCode() {
		return leaveCode;
	}

	public void setLeaveCode(String leaveCode) {
		this.leaveCode = leaveCode;
	}

	public String getLeaveName() {
		return leaveName;
	}

	public void setLeaveName(String leaveName) {
		this.leaveName = leaveName;
	}

	@Override
	public String toString() {
		return "Codesdao [id=" + id + ", codeType=" + codeType + ", clientName=" + clientName + ", onboardDate="
				+ onboardDate + ", country=" + country + ", description=" + description + ", chargeCode=" + chargeCode
				+ ", leaveCode=" + leaveCode + ", leaveName=" + leaveName + "]";
	} 
	
	
	
}
