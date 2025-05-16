package timesheet.payroll;

import java.time.YearMonth;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import timesheet.employee.dao.SummaryEntry;
import timesheet.employee.repo.SummaryRepository;
import timesheet.payroll.dao.MonthlySummary;
import timesheet.payroll.repo.MonthlySummaryRepository;


@Service
public class MonthlySummaryService {

    @Autowired
    private SummaryRepository summaryRepository; 

    @Autowired
    private MonthlySummaryRepository monthlySummaryRepository;
    

    public ResponseEntity<String> generateMonthlySummary(String username, String month) {
        String period1 = getPeriod1(month);
        String period2 = getPeriod2(month);

        SummaryEntry s1 = summaryRepository.findByUsernameAndPeriod(username, period1);
        SummaryEntry s2 = summaryRepository.findByUsernameAndPeriod(username, period2);

        if (s1 == null || s2 == null) {
        	 return ResponseEntity.ok("Pending submission of one or both periods.");
        }

        if (!"Approved".equalsIgnoreCase(s1.getStatus()) || !"Approved".equalsIgnoreCase(s2.getStatus())) {
        	 return ResponseEntity.ok("One or both periods are not yet approved.");
        }

        Map<String, Object> data1 = s1.getSummaryData();
        Map<String, Object> data2 = s2.getSummaryData();

        double totalHours = getDouble(data1.get("totalHours")) + getDouble(data2.get("totalHours"));
        double cl = getDouble(data1.get("casualLeaveDays")) + getDouble(data2.get("casualLeaveDays"));
        double sl = getDouble(data1.get("sickLeaveDays")) + getDouble(data2.get("sickLeaveDays"));
        double pl = getDouble(data1.get("paidLeaveDays")) + getDouble(data2.get("paidLeaveDays"));
        double totalAbs = getDouble(data1.get("totalAbsences")) + getDouble(data2.get("totalAbsences"));

        double lop = calculateLOP(cl, pl);

        double totalWorkingDays = (totalHours / 9.0);

        MonthlySummary summary = monthlySummaryRepository
                .findByUsernameAndMonth(username, month)
                .orElse(new MonthlySummary());

        summary.setUsername(username);
        summary.setMonth(month);
        summary.setCasualLeaveDays(cl);
        summary.setSickLeaveDays(sl);
        summary.setTotalAbsences(totalAbs/9);
        summary.setTotalLOPDays(lop);
        summary.setTotalWorkingDays(totalWorkingDays);

         monthlySummaryRepository.save(summary);
         
         return ResponseEntity.ok("Ready for summary generation.");
    }
    

    private String getPeriod1(String month) {

        String year = month.substring(0, 4);
        String mm = month.substring(5);
        return "01/" + mm + "/" + year + " - 15/" + mm + "/" + year;
    }

    private String getPeriod2(String month) {

        YearMonth yearMonth = YearMonth.parse(month); 
        int lastDay = yearMonth.lengthOfMonth(); 
        String year = month.substring(0, 4);
        String mm = month.substring(5);
        return "16/" + mm + "/" + year + " - " + lastDay + "/" + mm + "/" + year;
    }

    private double getDouble(Object value) {
        return value != null ? Double.parseDouble(value.toString()) : 0.0;
    }

    private double getDoubleOrZero(Object value) {
        return value != null ? Double.parseDouble(value.toString()) : 0.0;
    }


    private double calculateLOP(double cl, double pl) {
        double extraCL = cl > 1 ? (cl - 1) : 0;
        return pl + extraCL;
    }
    
    
    


}