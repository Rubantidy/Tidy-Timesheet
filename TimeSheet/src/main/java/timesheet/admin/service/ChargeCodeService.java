package timesheet.admin.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import timesheet.admin.dao.ChargeCodeCounter;
import timesheet.admin.repo.ChargeCountRepo;

@Service
public class ChargeCodeService {

    @Autowired
    private ChargeCountRepo chargeCodeCounterRepository;

    // Method to get the current last increment value and update it for the next generation
    @PostConstruct
    public void initializeCounterIfNeeded() {
        chargeCodeCounterRepository.initializeCounter();
    }

    // Method to get the next code increment (auto-increments the counter)
    public int getNextCodeIncrement() {
        // Fetch the current counter value from the database
        ChargeCodeCounter counter = chargeCodeCounterRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Counter not found"));

        int lastIncrement = counter.getLastIncrement();

        // Increment the counter for the next charge code
        lastIncrement++;

        // Update the counter in the database
        counter.setLastIncrement(lastIncrement);
        chargeCodeCounterRepository.save(counter);

        return lastIncrement;
    }
}
