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
@Table(name = "Employee")
public class Employeedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	

    private LocalDate createdDate; 


    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now(); // Set only date
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
    private String E_Mail;

    @JsonProperty("E-pass")
    private String E_Password;

	@JsonProperty("E-role")
    private String E_Role;
    
//    private boolean disabled = false;

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

	public String getE_Mail() {
		return E_Mail;
	}

	public void setE_Mail(String e_Mail) {
		E_Mail = e_Mail;
	}

	public String getE_Password() {
		return E_Password;
	}

	public void setE_Password(String e_Password) {
		E_Password = e_Password;
	}

	public String getE_Role() {
		return E_Role;
	}

	public void setE_Role(String e_Role) {
		E_Role = e_Role;
	}
	
//	 public boolean isDisabled() {
//			return disabled;
//		}
//
//		public void setDisabled(boolean disabled) {
//			this.disabled = disabled;
//		}

	@Override
	public String toString() {
		return "Employeedao [id=" + id + ", E_Name=" + E_Name + ", E_Mail=" + E_Mail + ", E_Password=" + E_Password
				+ ", E_Role=" + E_Role + "]";
	}
    
    

    
}
