package timesheet.admin.dao;



import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "employee_details")
public class Employeedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	private LocalDate createdDate; 

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now(); 
        
        if (E_Role != null && E_Role.equalsIgnoreCase("Admin")) {
            this.additionalRole = "Employee";
        } else {
            this.additionalRole = "-";
        }
        this.status = "active"; // Set status to "active"
    }

	public LocalDate getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDate createdDate) {
		this.createdDate = createdDate;
	}


	    @JsonProperty("E-name")
	    private String eName;

	    @JsonProperty("E-mail")
	    private String eMail;

	    @JsonProperty("E-pass")
	    private String ePassword;

	    @JsonProperty("E-role")
	    private String E_Role;
	    
	  


		@JsonProperty("E-desg")
	    private String designation;
		
		@JsonProperty("E-salary")
		private long Salary;
	    
	    
	    private String additionalRole;  // New field
	    private String status; 
	    
	    public String getDesignation() {
			return designation;
		}

		public void setDesignation(String designation) {
			this.designation = designation;
		}
	    

	public String getAdditionalRole() {
			return additionalRole;
		}

		public void setAdditionalRole(String additionalRole) {
			this.additionalRole = additionalRole;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}



	public String geteName() {
		return eName;
	}

	public void seteName(String eName) {
		this.eName = eName;
	}

	public String geteMail() {
		return eMail;
	}

	public void seteMail(String eMail) {
		this.eMail = eMail;
	}

	public String getePassword() {
		return ePassword;
	}

	public void setePassword(String ePassword) {
		this.ePassword = ePassword;
	}

	public String getE_Role() {
		return E_Role;
	}

	public void setE_Role(String e_Role) {
		E_Role = e_Role;
	}

	public long getSalary() {
		return Salary;
	}

	public void setSalary(long salary) {
		Salary = salary;
	}

	@Override
	public String toString() {
		return "Employeedao [id=" + id + ", createdDate=" + createdDate + ", eName=" + eName + ", eMail=" + eMail
				+ ", ePassword=" + ePassword + ", E_Role=" + E_Role + ", designation=" + designation + ", Salary="
				+ Salary + ", additionalRole=" + additionalRole + ", status=" + status + "]";
	}
	
	

	

	

	

	
    


	
    
    

    
}
