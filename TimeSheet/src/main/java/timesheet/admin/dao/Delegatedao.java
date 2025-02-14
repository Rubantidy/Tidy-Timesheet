package timesheet.admin.dao;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DelegatorsTable")
public class Delegatedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	@JsonProperty("D-name")
	private String D_name;
	
	@JsonProperty("SA-email")
	private String D_mail;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getD_name() {
		return D_name;
	}
	public void setD_name(String d_name) {
		D_name = d_name;
	}
	public String getD_mail() {
		return D_mail;
	}
	public void setD_mail(String d_mail) {
		D_mail = d_mail;
	}
	@Override
	public String toString() {
		return "Delegatedao [id=" + id + ", D_name=" + D_name + ", D_mail=" + D_mail + "]";
	}

	
	
	
}
