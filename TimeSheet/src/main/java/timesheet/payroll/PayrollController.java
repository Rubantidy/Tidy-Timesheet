package timesheet.payroll;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import timesheet.admin.dao.Employeedao;
import timesheet.admin.repo.EmployeeRepo;
import timesheet.payroll.dao.AddSalary;
import timesheet.payroll.dao.ApprovedPayslip;
import timesheet.payroll.dao.Bankdetails;
import timesheet.payroll.dao.MonthlySummary;
import timesheet.payroll.repo.AddSalaryRepo;
import timesheet.payroll.repo.ApprovedPayslipRepo;
import timesheet.payroll.repo.BankDetailsRepo;
import timesheet.payroll.repo.MonthlySummaryRepository;

@RestController
@RequestMapping("/payslip")
public class PayrollController {

		@Autowired
		private EmployeeRepo EmpRepo;
	
	    @Autowired
	    private MonthlySummaryRepository monthlySummaryRepository;
	    
	    @Autowired
	    private AddSalaryRepo addSalaryrepo;
	    
	    @Autowired
	    private BankDetailsRepo bankdetailsrepo;
	    
	    
	    @Autowired
	    private ApprovedPayslipRepo approvedPayslip;
	 
	    @GetMapping("/EmployePayslip/{month}")
	    public ResponseEntity<List<Map<String, String>>> getUsersForMonth(@PathVariable String month) {
	        
	        // Get summaries for that month where payslip is NOT generated
	        List<MonthlySummary> summaries = monthlySummaryRepository.findByMonthAndIsPayslipGeneratedFalse(month);

	        Set<String> uniqueUsernames = new HashSet<>();
	        List<Map<String, String>> result = new ArrayList<>();

	        for (MonthlySummary summary : summaries) {
	            String username = summary.getUsername(); // e.g., "Ruban M"
	            if (uniqueUsernames.add(username)) {
	                
	                Employeedao emp = EmpRepo.findByeName(username);
	                if (emp != null) {
	                    String displayName = emp.geteName() + " - " + emp.getDesignation();

	                    Map<String, String> map = new HashMap<>();
	                    map.put("username", username); // e.g., "Ruban M"
	                    map.put("display", displayName); // e.g., "Ruban M - Software Developer"
	                    result.add(map);
	                }
	            }
	        }

	        return ResponseEntity.ok(result);
	    }
	    
	    
	    @GetMapping("/details")
	    public ResponseEntity<?> getPayslipDetails(
	            @RequestParam String username,
	            @RequestParam String month) {

	        // Trim inputs to prevent issues from trailing/leading spaces
	        username = username.trim();
	        month = month.trim();


	        Map<String, Object> result = new HashMap<>();

	        // Find Monthly Summary
	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, month);
	        if (summaryOpt.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Summary not found"));
	        }
	        MonthlySummary summary = summaryOpt.get();

	        result.put("stddays", summary.getTotalWorkingDays());
	        result.put("totalworked", summary.getTotalWorkingDays() - summary.getTotalAbsences());
	        result.put("totalleaves", summary.getTotalAbsences());
	        result.put("lop", summary.getTotalLOPDays());

	        // Find Salary details
	        List<AddSalary> salaryList = addSalaryrepo.findByEmployeename(username);
	        if (salaryList.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Salary details not found"));
	        }
	        AddSalary salary = salaryList.get(0);
	        double basicSalary = Double.parseDouble(salary.getMonthsalary());
	        result.put("basicSalary", basicSalary);

	        // Find Employee details
	        Employeedao employee = EmpRepo.findByeName(username);
	        if (employee == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee details not found"));
	        }

	        result.put("name", employee.geteName());
	        result.put("onboardDate", employee.getOnboard());
	        result.put("designation", employee.getDesignation());

	        // Calculate deductions based on LOP
	        double lopDays = summary.getTotalLOPDays() != null ? summary.getTotalLOPDays() : 0.0;
	        double deductionPerLop = basicSalary / 30;
	        double deductions = deductionPerLop * lopDays;

	        result.put("deduction", deductions);

	        double netPay = basicSalary - deductions;
	        result.put("netPay", netPay);

	        return ResponseEntity.ok(result);
	    }


	    @PostMapping("/approvepayslip")
	    public ResponseEntity<?> approvePayslip(@RequestBody ApprovedPayslip payslipData) {

	        String username = payslipData.getUsername().trim();

	        // Fetch bank details for employee
	        Bankdetails bankDetails = bankdetailsrepo.findByEmployeenameIgnoreCase(username);
	        if (bankDetails == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body(Map.of("error", "Bank details not found for employee: " + username));
	        }

	        // Set bank info & location on payslip entity
	        payslipData.setAccountHolder(bankDetails.getAccountHolder());
	        payslipData.setBankName(bankDetails.getBankName());
	        payslipData.setAccountNumber(bankDetails.getAccountNumber());
	        payslipData.setLocation("Salem");  // default location

	        // Set local date and time in "yyyy-MM-dd: HH:mm" format
	        LocalDateTime now = LocalDateTime.now();
	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd: HH:mm");

	        String formattedDateTime = now.format(formatter);
	        payslipData.setSalaryProcessAt(formattedDateTime);
	        payslipData.setApprovedAt(formattedDateTime);

	        // Save approved payslip
	        approvedPayslip.save(payslipData);

	        // Set PayslipGenerated = true in MonthlySummary
	        Optional<MonthlySummary> summaryOpt = monthlySummaryRepository.findByUsernameAndMonth(username, payslipData.getMonth());
	        if (summaryOpt.isPresent()) {
	            MonthlySummary summary = summaryOpt.get();
	            summary.setIsPayslipGenerated(true);
	            monthlySummaryRepository.save(summary);
	        }

	        return ResponseEntity.ok(Map.of("message", "Payslip approved and saved successfully"));
	    }
	    
	    
	    @GetMapping("/getPayslipdata")
	    public ResponseEntity<List<ApprovedPayslip>> getExpense() {
	        List<ApprovedPayslip> Payslip = approvedPayslip.findAll();

	        return ResponseEntity.ok(Payslip);
	    }

	    
	    
//	    @GetMapping("/PayslipDownload")
//	    public ResponseEntity<byte[]> downloadPayslip(
//	            @RequestParam String username,
//	            @RequestParam String month) throws IOException, DocumentException {
//	    	
//	    	username = username.trim();
//	        month = month.trim();
//
//	        ApprovedPayslip approvedPaysliprepo = approvedPayslip
//	                .findByUsernameAndMonth(username, month);
//
//	        if (approvedPaysliprepo == null) {
//	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
//	        }
//
//	        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//	        Document document = new Document();
//	        PdfWriter.getInstance(document, baos);
//	        document.open();
//
//	        // Fonts
//	        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
//	        Font labelFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
//	        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
//	        Font smallFont = new Font(Font.FontFamily.HELVETICA, 10);
//
//	        // --- Logo (correct way from resources) ---
//	        try {
//	            ClassPathResource imageResource = new ClassPathResource("static/img/logo.png"); // src/main/resources/logo.png
//	            InputStream logoStream = imageResource.getInputStream();
//	            byte[] logoBytes = logoStream.readAllBytes();
//	            Image logo = Image.getInstance(logoBytes);
//	            logo.scaleToFit(100, 50);
//	            logo.setAlignment(Element.ALIGN_CENTER);
//	            document.add(logo);
//	        } catch (Exception e) {
//	            e.printStackTrace(); // Optional log
//	        }
//
//	        // Header
//	        Paragraph payslipTitle = new Paragraph("PAYSLIP", titleFont);
//	        payslipTitle.setAlignment(Element.ALIGN_CENTER);
//	        document.add(payslipTitle);
//	        
//
//	        document.add(Chunk.NEWLINE);
//
//	        Paragraph company = new Paragraph("Tidy Digital Solution", labelFont);
//	        company.setAlignment(Element.ALIGN_CENTER);
//	        document.add(company);
//
//	        Paragraph monthPara = new Paragraph("Payslip for " + approvedPaysliprepo.getMonth().toUpperCase(), labelFont);
//	        monthPara.setAlignment(Element.ALIGN_CENTER);
//	        document.add(monthPara);
//
//	        document.add(Chunk.NEWLINE);
//
//	        // Employee Info Table
//	        PdfPTable empTable = new PdfPTable(2);
//	        empTable.setWidthPercentage(100);
//	        empTable.setSpacingBefore(10f);
//	        empTable.setSpacingAfter(10f);
//
//	        empTable.addCell("Name: " + approvedPaysliprepo.getUsername());
//	        empTable.addCell("Bank: " + approvedPaysliprepo.getBankName());
//
//	        empTable.addCell("DOJ: " + approvedPaysliprepo.getOnboardDate());
//	        empTable.addCell("A/c No: " + approvedPaysliprepo.getAccountNumber());
//
//	        empTable.addCell("LOP Days: " + approvedPaysliprepo.getLop().intValue());
//	        empTable.addCell("Worked Days: " + approvedPaysliprepo.getTotalWorkingDays());
//
//	        empTable.addCell("STD Days: " + approvedPaysliprepo.getStdWorkDays());
//	        empTable.addCell("");
//
//	        empTable.addCell("Designation: " + approvedPaysliprepo.getDesignation());
//	        empTable.addCell("Total Leaves: " + approvedPaysliprepo.getTotalLeaves());
//
//	        empTable.addCell("Location: " + approvedPaysliprepo.getLocation());
//	        empTable.addCell("");
//
//	        document.add(empTable);
//
//	        document.add(Chunk.NEWLINE);
//
//	        // Salary Table
//	        PdfPTable salaryTable = new PdfPTable(2);
//	        salaryTable.setWidthPercentage(100);
//	        salaryTable.setSpacingBefore(10f);
//
//	        salaryTable.addCell("Earnings & Deductions");
//	        salaryTable.addCell("Amount in ₹");
//
//	        salaryTable.addCell("Basic Salary");
//	        salaryTable.addCell(String.format("₹%,.2f", approvedPaysliprepo.getBasicSalary()));
//
//	        salaryTable.addCell("Deduction");
//	        salaryTable.addCell(String.format("₹%,.2f", approvedPaysliprepo.getDeductions()));
//
//	        PdfPCell netPayLabel = new PdfPCell(new Phrase("Net Pay", labelFont));
//	        PdfPCell netPayValue = new PdfPCell(new Phrase(String.format("₹%,.2f", approvedPaysliprepo.getNetPay()), labelFont));
//	        salaryTable.addCell(netPayLabel);
//	        salaryTable.addCell(netPayValue);
//
//	        document.add(salaryTable);
//
//	        document.add(Chunk.NEWLINE);
//
//	        // Optional Footer
//	        Paragraph footer = new Paragraph("Salary processed at: " + approvedPaysliprepo.getSalaryProcessAt()
//	                + " | Approved at: " + approvedPaysliprepo.getApprovedAt(), smallFont);
//	        footer.setAlignment(Element.ALIGN_CENTER);
//	        document.add(footer);
//	        
//	        document.add(Chunk.NEWLINE);
//	        
//	        Paragraph note = new Paragraph("** This is a computer generated payslip and does not require signature and stamp.", smallFont);
//	        note.setAlignment(Element.ALIGN_CENTER);
//	        document.add(note);
//
//	        document.close();
//
//	        byte[] pdfBytes = baos.toByteArray();
//
//	        HttpHeaders headers = new HttpHeaders();
//	        headers.setContentType(MediaType.APPLICATION_PDF);
//	        headers.setContentDispositionFormData("attachment", "Payslip-" + username + "-" + month + ".pdf");
//
//	        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
//	    }
}
