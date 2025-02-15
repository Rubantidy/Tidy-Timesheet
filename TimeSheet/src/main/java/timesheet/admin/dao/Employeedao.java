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
@Table(name = "Employee_details")
public class Employeedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	private LocalDate createdDate; 

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now(); 
    }

	public LocalDate getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDate createdDate) {
		this.createdDate = createdDate;
	}


	@JsonProperty("E-name")
    private String E_Name;

    @JsonProperty("E-mail")
    private String eMail;

    @JsonProperty("E-pass")
    private String ePassword;

	@JsonProperty("E-role")
    private String E_Role;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getE_Name() {
		return E_Name;
	}

	public void setE_Name(String e_Name) {
		E_Name = e_Name;
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

	@Override
	public String toString() {
		return "Employeedao [id=" + id + ", createdDate=" + createdDate + ", E_Name=" + E_Name + ", eMail=" + eMail
				+ ", ePassword=" + ePassword + ", E_Role=" + E_Role + "]";
	}
    
//    private boolean disabled = false;


	
//	 public boolean isDisabled() {
//			return disabled;
//		}
//
//		public void setDisabled(boolean disabled) {
//			this.disabled = disabled;
//		}

	
    
    

    
}
