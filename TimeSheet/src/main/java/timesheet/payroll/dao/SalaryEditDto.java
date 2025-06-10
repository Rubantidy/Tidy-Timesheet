package timesheet.payroll.dao;

public class SalaryEditDto {
    private int id;
    private String name;
    private String updatedSalary;

    // Getters and setters
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }

    public String getUpdatedSalary() {
        return updatedSalary;
    }
    public void setUpdatedSalary(String updatedSalary) {
        this.updatedSalary = updatedSalary;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}

