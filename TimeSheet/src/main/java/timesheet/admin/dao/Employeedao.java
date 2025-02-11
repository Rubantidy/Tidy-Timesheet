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
    private String eName;

    @JsonProperty("E-mail")
    private String eMail;

    @JsonProperty("E-pass")
    private String ePass;

    @JsonProperty("E-role")
    private String eRole;

    
}
