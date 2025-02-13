package timesheet.admin.dao;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Expense_type")
public class Expensedao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@JsonProperty("Ex-code")
	private String Expense_code;
	
	@JsonProperty("Ex-type")
	private String Expense_type;


	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getExpense_code() {
		return Expense_code;
	}

	public void setExpense_code(String expense_code) {
		Expense_code = expense_code;
	}

	public String getExpense_type() {
		return Expense_type;
	}

	public void setExpense_type(String expense_type) {
		Expense_type = expense_type;
	}

	@Override
	public String toString() {
		return "Expensedao [id=" + id + ", Expense_code=" + Expense_code + ", Expense_type=" + Expense_type + "]";
	}

	
	
	
	
	
}
