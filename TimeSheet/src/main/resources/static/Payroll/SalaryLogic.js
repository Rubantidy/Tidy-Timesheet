// SalaryLogic.js


function fetchEmployeesForSalaryForm() {
    fetch("/getEmployeesforSalary")
        .then(response => response.json())
        .then(data => {
			console.log(data)
            const select = document.getElementById("salaryEmployeeSelect");
            if (!select) return;

            select.innerHTML = '<option value="">Select Employee</option>';

            data.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp["E-name"];
                option.textContent = emp["E-name"];
                option.dataset.doj = emp["onborad"];
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching employees for salary:", error));
}

function updateDOJ() {
    const select = document.getElementById("salaryEmployeeSelect");
    const dojInput = document.getElementById("doj");

    const selectedOption = select.options[select.selectedIndex];
    dojInput.value = selectedOption.dataset.doj || "";
}


//Employee

function openBankEditModal() {
  document.getElementById('inputAccountHolder').value = document.getElementById('bankAccountHolder').textContent;
  document.getElementById('inputAccountNumber').value = document.getElementById('bankAccountNumber').textContent;
  document.getElementById('inputIFSC').value = document.getElementById('bankIFSC').textContent;
  document.getElementById('inputBankName').value = document.getElementById('bankName').textContent;
  document.getElementById('inputUpiId').value = document.getElementById('bankUpiId').textContent;

  const modal = new bootstrap.Modal(document.getElementById('bankEditModal'));
  modal.show();
}


function saveBankDetails() {
    const username = sessionStorage.getItem("userName");
    const accountHolder = document.getElementById('inputAccountHolder').value.trim();
    const accountNumber = document.getElementById('inputAccountNumber').value.trim();
    const ifsc = document.getElementById('inputIFSC').value.trim().toUpperCase();
    const bankName = document.getElementById('inputBankName').value.trim();
    const upiId = document.getElementById('inputUpiId').value.trim();

    // Clear previous error messages
    const errorFields = ['errorAccountHolder', 'errorAccountNumber', 'errorIFSC', 'errorBankName', 'errorUpiId'];
    errorFields.forEach(id => document.getElementById(id).innerText = "");

    let hasError = false;

    if (!accountHolder) {
        document.getElementById("errorAccountHolder").innerText = "Please enter account holder name.";
        hasError = true;
    }

    if (!accountNumber) {
        document.getElementById("errorAccountNumber").innerText = "Please enter account number.";
        hasError = true;
    } else if (!/^\d{9,18}$/.test(accountNumber)) {
        document.getElementById("errorAccountNumber").innerText = "Account number must be 9 to 18 digits.";
        hasError = true;
    }

    if (!ifsc) {
        document.getElementById("errorIFSC").innerText = "Please enter IFSC code.";
        hasError = true;
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        document.getElementById("errorIFSC").innerText = "Invalid IFSC format (e.g., SBIN0001234).";
        hasError = true;
    }

    if (!bankName) {
        document.getElementById("errorBankName").innerText = "Please enter bank name.";
        hasError = true;
    }

    if (!upiId) {
        document.getElementById("errorUpiId").innerText = "Please enter UPI ID.";
        hasError = true;
    } else if (!/^[\w.-]+@[\w]+$/.test(upiId)) {
        document.getElementById("errorUpiId").innerText = "Invalid UPI ID format (e.g., name@bank).";
        hasError = true;
    }

    if (hasError) return;

    // Confirmation modal setup
    document.getElementById("confirmBankText").innerText =
        `Are you sure you want to save the bank details for ${accountHolder}?`;
    document.getElementById("bankWarningNote").innerText =
        "Note: If you enter wrong details, it may affect the salary process.";

    const confirmModal = new bootstrap.Modal(document.getElementById("confirmBankModal"));
    confirmModal.show();

    document.getElementById("confirmSaveBank").onclick = function () {
        let formData = new FormData();
        formData.append("Employeename", username);
        formData.append("accountHolder", accountHolder);
        formData.append("accountNumber", accountNumber);
        formData.append("ifsc", ifsc);
        formData.append("bankName", bankName);
        formData.append("upiId", upiId);

        fetch("/saveBankDetails", {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json",
            }
        })
        .then(response => {
            if (response.ok) return response.json();
            else throw new Error('Error saving bank details');
        })
        .then(data => {
            showAlert(data.message, "success");
            document.getElementById("bankEditForm").reset();
            bootstrap.Modal.getInstance(document.getElementById("bankEditModal")).hide();
            fetchBankDetails();
        })
        .catch(error => {
            console.error("Error:", error);
            showAlert(error.message || "Error saving bank details!", "danger");
        })
        .finally(() => {
            confirmModal.hide();
        });
    };
}





function fetchBankDetails() {
    const username = sessionStorage.getItem("userName");
    if (!username) {
        console.error("Username not found in session");
        return;
    }

    fetch(`/getBankDetails?Employeename=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) throw new Error("Bank details not found");
            return response.json();
        })
        .then(data => {
            // Fill the table fields
            document.getElementById("bankAccountHolder").innerText = data.accountHolder || "-";
            document.getElementById("bankAccountNumber").innerText = data.accountNumber || "-";
            document.getElementById("bankIFSC").innerText = data.ifsc || "-";
            document.getElementById("bankName").innerText = data.bankName || "-";
            document.getElementById("bankUpiId").innerText = data.upiId || "-";
        })
        .catch(error => {
            console.error("Error fetching bank details:", error);
            showAlert("Unable to load bank details", "danger");
        });
}


document.addEventListener("DOMContentLoaded", function () {
	    const navLinks = document.querySelectorAll(".nav-link");

	    navLinks.forEach(link => {
	        link.addEventListener("click", function () {
	            // Remove active class from all links
	            navLinks.forEach(nav => nav.classList.remove("active"));
	            
	            // Add active class to clicked link
	            this.classList.add("active");
	        });
	    });
	});

	
//Admin payslip generation
function loadEmployeesForMonth() {
  const monthInput = document.getElementById('monthPicker');
  const selectedMonth = monthInput.value; // format: YYYY-MM

  fetch(`/payslip/EmployePayslip/${selectedMonth}`)
    .then(response => response.text())  // get raw response as text first
    .then(text => {
      const data = JSON.parse(text);   // parse JSON manually

   

      const employeeSelect = document.getElementById('employeeSelect');
      employeeSelect.innerHTML = '<option value="">Select Employee</option>';
      data.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.username;
        option.text = emp.display;
        employeeSelect.appendChild(option);
      });
    })
    .catch(err => {
      console.error('Error loading employees:', err);
    });

}


async function loadPayslipDetails() {
    const month = document.getElementById("monthPicker").value;
    const username = document.getElementById("employeeSelect").value;

    if (!month || !username) {
        showAlert("Please select both month and employee.", "danger");
        return;
    }

    try {
        const response = await fetch(`/payslip/details?username=${encodeURIComponent(username)}&month=${month}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        if (data.error) {
            showAlert(data.error, "danger");
            return;
        }

        const formattedMonth = new Date(month + "-01").toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });

        const payslipHTML = `
            <div class="card shadow-sm p-4 mb-4">
              <h4 class="mb-3">Payslip Preview – ${formattedMonth}</h4>
              <table class="table table-bordered">
                <tbody>
                  <tr><th>Employee Name</th><td>${data.name}</td></tr>
                  <tr><th>Onboarded Date</th><td>${data.onboardDate}</td></tr>
                  <tr><th>Designation</th><td>${data.designation}</td></tr>
				  <tr><th>STD Work days</th><td>${data.stddays}</td></tr>
				  <tr><th>Total Leaves</th><td>${data.totalleaves}</td></tr>
                  <tr><th>Total Working Days</th><td>${data.totalworked}</td></tr>			
                  <tr><th>LOP</th><td>${data.lop}</td></tr>
                  <tr><th>Basic Salary</th><td>₹${parseFloat(data.basicSalary).toLocaleString()}</td></tr>
                  <tr><th>Deductions</th><td>₹${parseFloat(data.deduction).toLocaleString()}</td></tr>
                  <tr class="table-success"><th>Net Pay</th><td><strong>₹${parseFloat(data.netPay).toLocaleString()}</strong></td></tr>
                </tbody>
              </table>
            </div>
        `;

        document.getElementById("payslip-preview-container").innerHTML = payslipHTML;

    } catch (error) {
        console.error("Error fetching payslip details:", error);
        showAlert("Failed to load payslip data.", "danger");
    }
}




function showPayslipApproveConfirmation() {
    const month = document.getElementById("monthPicker").value;
    const username = document.getElementById("employeeSelect").value;

    if (!month || !username) {
        showAlert("Please select both month and employee before approving.", "danger");
        return;
    }

    // Format confirmation message
    const formattedMonth = new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" });
	document.getElementById("confirmMessage").innerHTML =
	    `Are you sure you want to approve <strong class="text-primary">${username}</strong>'s payslip for salary processing for the month of <strong class="text-success">${formattedMonth}</strong>?`;

    // Show modal (Bootstrap 5)
    const modal = new bootstrap.Modal(document.getElementById("payslipapproveConfirmModal"));
    modal.show();

    // Attach approve handler (once)
    document.getElementById("confirmApproveBtn").onclick = () => {
        modal.hide();
        appreovPaylisp(); // Your original function
    };
}

async function appreovPaylisp() {
    try {
        // Get selected month and employee
        const month = document.getElementById("monthPicker").value;
        const username = document.getElementById("employeeSelect").value;

        if (!month || !username) {
            showAlert("Please select both month and employee before approving.", "danger");
            return;
        }

        // Get payslip table rows
        const rows = document.querySelectorAll("#payslip-preview-container table tbody tr");

     
        const employeeName = rows[0].cells[1].innerText;
        const onboardDate = rows[1].cells[1].innerText;
        const designation = rows[2].cells[1].innerText;
        const stdWorkDays = rows[3].cells[1].innerText;
        const totalLeaves = rows[4].cells[1].innerText;
        const totalWorkingDays = rows[5].cells[1].innerText;
        const lop = rows[6].cells[1].innerText;
        const basicSalary = rows[7].cells[1].innerText.replace(/₹|,/g, "");
        const deductions = rows[8].cells[1].innerText.replace(/₹|,/g, "");
        const netPay = rows[9].cells[1].innerText.replace(/₹|,/g, "");

    
        const payload = {
            username: employeeName,
            month: month,
            onboardDate: onboardDate,
            designation: designation,
            stdWorkDays: parseInt(stdWorkDays),
            totalLeaves: parseInt(totalLeaves),
            totalWorkingDays: parseInt(totalWorkingDays),
            lop: parseFloat(lop),
            basicSalary: parseFloat(basicSalary),
            deductions: parseFloat(deductions),
            netPay: parseFloat(netPay),
            
        };

    
        const response = await fetch('/payslip/approvepayslip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
			loadEmployeesForMonth();
            showAlert("Payslip approved and saved successfully!", "success");
			  document.getElementById("payslip-preview-container").innerHTML = `
			      <div class="card shadow-sm p-4 mb-4">
			        <h4 class="mb-3">Payslip Preview –</h4>
			        <table class="table table-bordered">
			          <tbody>
			            <tr><th>Employee Name</th><td>-</td></tr>
			            <tr><th>Onboarded Date</th><td>-</td></tr>
			            <tr><th>Designation</th><td>-</td></tr>
			            <tr><th>STD Work days</th><td>-</td></tr>
			            <tr><th>Total Leaves</th><td>-</td></tr>
			            <tr><th>Total Working Days</th><td>-</td></tr>
			            <tr><th>LOP</th><td>-</td></tr>
			            <tr><th>Basic Salary</th><td>₹</td></tr>
			            <tr><th>Deductions</th><td>₹</td></tr>
			            <tr class="table-success"><th>Net Pay</th><td><strong>₹</strong></td></tr>
			          </tbody>
			        </table>
			      </div>
			    `;

			    // Optionally reset the selects too:
			    document.getElementById("monthPicker").value = "";
			    document.getElementById("employeeSelect").innerHTML = '<option value="">Select Employee</option>';
				fetchPayslipData();
				
			}
			
         else {
            showAlert("Failed to approve payslip: " + (result.error || "Unknown error"), "danger");
        }

    } catch (error) {
        console.error("Error approving payslip:", error);
        showAlert("Error approving payslip. Check console for details.", "danger");
    }
}



function fetchPayslipData() {
    fetch("/payslip/getPayslipdata")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("payslip-table-body");
            tableBody.innerHTML = "";

            data.forEach(payslip => {
                const [year, month] = payslip.month.split("-");
                const displayMonth = new Date(year, month - 1).toLocaleString('default', { month: 'long' }) + " - " + year;
                const monthParam = `${year}-${month.padStart(2, '0')}`;

                const formattedBasicSalary = "₹ " + Number(payslip.basicSalary).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                const formattedNetPay = "₹ " + Number(payslip.netPay).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                tableBody.innerHTML += `
                    <tr>
                        <td>${payslip.id}</td>
                        <td>${payslip.username}</td> 
                        <td>${payslip.designation}</td> 
                        <td>${formattedBasicSalary}</td> 
                        <td>${displayMonth}</td>
                        <td>${payslip.stdWorkDays}</td>		
                        <td>${payslip.totalWorkingDays}</td>	
                        <td>${formattedNetPay}</td>	
                        <td>${payslip.bankName}</td>
                        <td>${payslip.salaryProcessAt}</td>	
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="downloadPayslipAdmin('${payslip.username}', '${monthParam}')">
                                View PDF
                            </button>
                        </td>				                       
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching Payslip data:", error));
}


function downloadPayslipAdmin(username, month) {
    fetch(`/PayslipDownload?username=${encodeURIComponent(username)}&month=${encodeURIComponent(month)}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to download PDF");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank'); // 👉 opens in new tab
        })
        .catch(err => {
            console.error("Error downloading PDF:", err);
            showAlert("Failed to open payslip.", "danger");
        });
}



function downloadPayslip() {
    const username = sessionStorage.getItem("userName");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text; // "01/05/2025 - 15/05/2025"
    }

    const extractedPeriod = getSelectedPeriod();

    // Extract "2025-05" from "01/05/2025 - 15/05/2025"
    const dateParts = extractedPeriod.split(" - ")[0].split("/"); // ["01", "05", "2025"]
    const formattedMonth = `${dateParts[2]}-${dateParts[1]}`;       // "2025-05"

    fetch(`/PayslipDownload?username=${encodeURIComponent(username)}&month=${formattedMonth}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to download PDF");
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Payslip-${username}-${formattedMonth}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(err => {
            console.error("Error downloading PDF:", err);
            showAlert("Your Timesheet Didn't Approve on This Month.", "danger");
        });
}



function fetchinitialSalary() {
    fetch("/getInitialSalary") 
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("Initialsalary-table-body");
            tableBody.innerHTML = ""; 
            
            data.forEach(Salary => {
                const bankStatus = Salary.bankaccount === "1" 
                    ? '<span style="color:green;">&#10004;</span>'   
                    : Salary.bankaccount === "0" 
                        ? '<span style="color:red;">&#10060;</span>' 
                        : Salary.bankaccount; 

                const formattedMonthly = "₹ " + Number(Salary["Salary_M"]).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                const formattedYearly = "₹ " + Number(Salary.yearsalary).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                tableBody.innerHTML += `
                    <tr>
                        <td>${Salary.id}</td>
                        <td>${Salary['E-name']}</td> 
                        <td>${Salary["doj"]}</td> 
                        <td>${formattedMonthly}</td>
                        <td>${formattedYearly}</td>
                        <td>${Salary.effectiveFrom}</td>
                        <td>${Salary.reason}</td>
                        <td>${bankStatus}</td>							 
                        <td>
                            <button class="btn btn-success btn-sm" title="Salary Hike" onclick="openHikeForm('${Salary.id}')">
                                <i class="bi bi-person-up"></i>
                            </button>
                            <button class="btn btn-success btn-sm" title="Salary History" onclick="showSalaryHistory('${Salary['E-name']}')">
                                <i class="bi bi-file-earmark-text"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching Charge codes:", error));
}



function openHikeForm(employeeId) {
    fetch(`/getSalaryById/${employeeId}`)
        .then(res => res.json())
        .then(data => {
            const hikeFormHTML = `
                <div class="card p-3 mb-3">
                    <h4>Apply Salary Hike</h4>
                    <form onsubmit="submitSalaryHike(event, '${data.id}', '${data['E-name']}', ${data.Salary_M})">
                        ${inputField("Employee Name", "text", "ename", "", data["E-name"], true)}
                        ${inputField("Current Salary", "number", "currentSalary", "", data.Salary_M, true)}
                        ${inputField("Hike Percentage (%)", "number", "hikePercent", "", "", false, "oninput='calculateNewSalaryHike()'")}
                        ${inputField("New Salary", "number", "newSalary", "newSalaryInput", "", true)}
                        ${inputField("Reason", "text", "reason")}
                        ${formButtons()}
                    </form>
                </div>
            `;
            document.getElementById("form-container").innerHTML = hikeFormHTML;
        });
}

function calculateNewSalaryHike() {
    const current = parseFloat(document.querySelector("[name='currentSalary']").value);
    const percent = parseFloat(document.querySelector("[name='hikePercent']").value);
    const newSalaryInput = document.querySelector("[name='newSalary']");

    if (!isNaN(current) && !isNaN(percent)) {
        const newSalary = current + (current * percent / 100);
        newSalaryInput.value = newSalary.toFixed(2);
    } else {      
        newSalaryInput.value = "";
    }
}



function submitSalaryHike(event, id, name, currentSalary) {
    event.preventDefault();

   
    const message = `Are you sure you want to give Salary hike to <strong>${name}</strong>?`;
    document.getElementById('salaryHikeConfirmMessage').innerHTML = message;

    
    const salaryHikeModal = new bootstrap.Modal(document.getElementById('salaryHikeConfirmModal'));
    salaryHikeModal.show();

 
    const confirmBtn = document.getElementById('confirmSalaryHikeBtn');


    confirmBtn.replaceWith(confirmBtn.cloneNode(true)); 
    const newConfirmBtn = document.getElementById('confirmSalaryHikeBtn');

    newConfirmBtn.addEventListener('click', () => {
		showLoader();
        const hikePercent = document.querySelector("[name='hikePercent']").value;
        const newSalary = document.querySelector("[name='newSalary']").value;
        const reason = document.querySelector("[name='reason']").value;

        fetch('/updateSalaryWithHike', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id, name, currentSalary, newSalary, hikePercent, reason
            })
        })
        .then(res => res.text())
        .then(msg => {
            salaryHikeModal.hide();
            hideForm();
            showAlert(msg, "success");
            fetchinitialSalary(); 
        })
        .catch(err => {
            salaryHikeModal.hide();
            showAlert('Error: ' + err.message, "danger");
        })
		.finally(() => hideLoader());
    });
}


function showSalaryHistory(empName) {
    document.getElementById("historyEmpName").innerText = empName;

    fetch(`/getSalaryHistory?employeeName=${encodeURIComponent(empName)}`)
        .then(response => response.json())
        .then(history => {
            const tbody = document.getElementById("salaryHistoryTableBody");
            tbody.innerHTML = "";

            if (history.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No salary history found.</td></tr>`;
            } else {
                history.forEach(entry => {
                    const formattedOldSalary = "₹ " + Number(entry.oldsalary).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    const formattedNewSalary = "₹ " + Number(entry.newsalary).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    tbody.innerHTML += `
                        <tr>
                            <td>${entry.effectiveFrom}</td>
                            <td>${formattedOldSalary}</td>
                            <td>${formattedNewSalary}</td>
                            <td>${entry.hikePercent}%</td>
                            <td>${entry.reason}</td>
                        </tr>
                    `;
                });
            }

            // Show modal
            const salaryModal = new bootstrap.Modal(document.getElementById('salaryHistoryModal'));
            salaryModal.show();
        })
        .catch(error => {
            console.error("Error fetching salary history:", error);
            showAlert("Failed to load salary history.", "danger");
        });
}



