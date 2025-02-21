package timesheet.admin.dao;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class ChargeCodeCounter {

    @Id
    private int id = 1;  // We assume only one row to track the counter
    
    private int lastIncrement;

    public int getLastIncrement() {
        return lastIncrement;
    }

    public void setLastIncrement(int lastIncrement) {
        this.lastIncrement = lastIncrement;
    }
}

