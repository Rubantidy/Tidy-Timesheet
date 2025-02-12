package timesheet.admin.dao;

import com.fasterxml.jackson.annotation.JsonProperty;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@Table(name = "Employee")
public class Employeedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@NotEmpty(message = "Name is Required")
	@JsonProperty("E-name")
    private String E_Name;

    @JsonProperty("E-mail")
    private String E_Mail;

    @JsonProperty("E-pass")
    private String E_Password;

    @JsonProperty("E-role")
    private String E_Role;

    
}
