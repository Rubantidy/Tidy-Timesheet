// PREVENT DIRECT ACCESS TO DASHBOARDS
	document.addEventListener("DOMContentLoaded", function() {
	    const userName = sessionStorage.getItem("userName");

	    // Redirect to login page if user session is null
	    if (userName === null) {
	        window.location.href = "/login";
	    }
	});

	
	

document.addEventListener("DOMContentLoaded", function () {
       
        const navLinks = document.querySelectorAll(".nav-link");
				
function switchSection(sectionId) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.style.display = "none";
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = "block";
    }
}

navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        let sectionName = this.textContent.trim().toLowerCase().replace(/\s/g, ""); 
        let sectionId = sectionName + "Section";

               
                switchSection(sectionId);
            });
        });
    });

   
	/* Modified Fetch Charge codes Function with Filtering */
	function fetchCodeDatas() {
	    fetch("/getChargecodes") 
	        .then(response => response.json())
	        .then(data => {
	            renderTable(data);
	        })
	        
	}

	function renderTable(data) {
	    const employeeTableBody = document.getElementById("employee-code-table-body");
	    if (!employeeTableBody) {
	        return;
	    }

	    const selectedFilter = document.getElementById("projectTypeFilter").value;
	    let filteredData = selectedFilter === "All" ? data : data.filter(code => code.projectType === selectedFilter);

	
	    filteredData = filteredData.sort((a, b) => {
	        let aType = a.codeType.toLowerCase(); 
	        let bType = b.codeType.toLowerCase();
	        return aType === "leave code" ? 1 : bType === "leave code" ? -1 : 0;
	    });

	  
	    employeeTableBody.innerHTML = "";

	   
	    filteredData.forEach(code => {
	        let rowColor = code.status === "Complete" ? "style='background-color: #d99891; font-weight: bold;'" : ""; 
	        
	        employeeTableBody.innerHTML += `
	            <tr ${rowColor}>
	                <td>${code.codeType}</td>
	                <td>${code.code}</td>
	                <td>${code.clientName}</td>
	                <td>${code.description}</td>
	                <td>${code.projectType}</td>
	                <td>${code.startDate}</td>
	                <td>${code.country}</td>
	            </tr>
	        `;
			paginateTable("employee-code-table-body");
	    });
	}


	document.addEventListener("DOMContentLoaded", function() {
	    fetchCodeDatas();
	    
	    document.getElementById("projectTypeFilter").addEventListener("change", function() {
	        fetch("/getChargecodes")
	            .then(response => response.json())
	            .then(data => renderTable(data))
	            
	    });
	});

/*Save functionality*/

document.addEventListener("DOMContentLoaded", function () {
    const saveIcon = document.getElementById("saveIcon");
    const periodDropdown = document.getElementById("periodDropdown");
	const calender = document.getElementById('calendarPicker');
	const preview = document.getElementById('prevPeriod');
	const nextpre = document.getElementById('nextPeriod');
    const tableBody = document.getElementById("tableBody");
    const username = sessionStorage.getItem("userName"); // Logged-in employee

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text; // Example: "01/03/2024 - 15/03/2024"
    }

	function fetchTimesheetData() {
	    const selectedPeriod = getSelectedPeriod();

	    fetch(`/getTimesheet?username=${username}&period=${selectedPeriod}`)
	        .then(response => response.json())
	        .then(data => {	         
	            populateTable(data);
	        })
	    
	}
	
	function populateTable(fetchedData) {
	    

	    fetchedData.forEach(entry => {
	        let { chargeCode, cellIndex, hours } = entry;
	        let [rowIndex, colIndex] = cellIndex.split("_").map(Number);

	        let tableRows = document.querySelectorAll("#tableBody tr");

	       
	        while (tableRows.length <= rowIndex + 1) {
	            addRow();
	            tableRows = document.querySelectorAll("#tableBody tr");
	        }

	        let row = tableRows[rowIndex];
	        if (!row) return;

	        let firstCell = row.cells[0]; 

	        
	        let firstCellText = firstCell.textContent.trim().toLowerCase();
	        if (firstCellText === "work location" || firstCellText === "company code") {
	            return;
	        }

	        
	        if (firstCell) {
	            firstCell.innerHTML = ""; 

	            let chargeCodeDisplay = document.createElement("div");
	            chargeCodeDisplay.classList.add("stored-charge-code");
	            chargeCodeDisplay.style.cursor = "pointer";
	            chargeCodeDisplay.textContent = chargeCode ? chargeCode : "Select Charge Code"; 

	            firstCell.appendChild(chargeCodeDisplay);

	            
	            chargeCodeDisplay.addEventListener("click", function () {
	                firstCell.innerHTML = ""; 
	                let dropdownContainer = createDropdown();
	                let button = dropdownContainer.querySelector(".dropdown-button");
	                let clearButton = dropdownContainer.querySelector("span"); 

	              
	                if (chargeCode && chargeCode.trim() !== "") {
	                    let matchingOption = chargeCodes.find(c => c.code === chargeCode);
	                    if (matchingOption) {
	                        button.textContent = `${matchingOption.code} - ${matchingOption.description}`;
	                        button.dataset.value = chargeCode;
	                        clearButton.style.display = "inline"; // Show (✖) button
	                    }
	                }

	                firstCell.appendChild(dropdownContainer);
	            });
	        }

	       
	        let cell = row.cells[colIndex];
	        if (cell) {
	            let input = cell.querySelector("input");
	            if (!input) {
	                input = document.createElement("input");
	                input.type = "number";
	                input.classList.add("hourInput");
	                cell.innerHTML = ''; 
	                cell.appendChild(input);
	            }
	            input.value = hours || ""; 

	          
	            input.setAttribute("data-prev", hours || "");

	           
	        }
	    });

	    
	    calculateTotals();
	}

	

	function saveTimesheetData() {
	    const selectedPeriod = getSelectedPeriod();

	    // Calculate expected total hours
	    const standardAllocatedHours = calculateStandardAllocatedHours(selectedPeriod);

	    // Calculate entered grand total hours
	    let grandTotal = 0;
	    const rows = document.querySelectorAll('#tableBody tr');

	    rows.forEach(row => {
	        if (row.classList.contains("static-row")) return;

	        const inputs = row.querySelectorAll('td input[type="text"]');
	        inputs.forEach(input => {
	            const value = parseFloat(input.value.trim()) || 0;
	            grandTotal += value;
	        });
	    });

	    // Compare grand total and standard allocated hours
	    if (grandTotal.toFixed(2) !== standardAllocatedHours.toFixed(2)) {
			showAlert(`⚠ One or more cells contain incorrect values. Each day's total must equal 9 hours. Please review your entries.`, "danger");
	        return;
	    }

	    // Proceed with confirmation modal if totals match
	    document.getElementById("saveTimesheetMessage").innerText =
	        `⚠ Are you sure you want to save the timesheet for "${selectedPeriod}"?`;

	    let saveModal = new bootstrap.Modal(document.getElementById("saveTimesheetModal"));
	    saveModal.show();

	    document.getElementById("confirmSaveTimesheet").onclick = function () {
	        saveModal.hide();

	        const rows = document.querySelectorAll("#tableBody tr");
	        let timesheetEntries = [];
	        let columnFilled = {};
	        let hasValidDynamicRow = false;

	        function parseDate(dateStr) {
	            let parts = dateStr.split("/");
	            return new Date(parts[2], parts[1] - 1, parts[0]);
	        }

	        let [startDateStr, endDateStr] = selectedPeriod.split(" - ");
	        let startDate = parseDate(startDateStr);
	        let endDate = parseDate(endDateStr);

	        let skipColumns = [];
	        let currentDate = new Date(startDate);
	        let columnIndex = 1;

	        while (currentDate <= endDate) {
	            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
	            if (dayName === "Sun" || isHoliday(currentDate)) {
	                skipColumns.push(columnIndex);
	            }
	            currentDate.setDate(currentDate.getDate() + 1);
	            columnIndex++;
	        }

	        document.querySelectorAll("#tableBody tr td input").forEach(input => {
	            input.style.backgroundColor = "";
	            input.removeAttribute("title");
	        });

	        rows.forEach((row, rowIndex) => {
	            let chargeCodeCell = row.cells[0];
	            if (!chargeCodeCell) return;

	            let chargeCode = chargeCodeCell.textContent.trim();
	            if (chargeCode.includes("Select Charge Code")) return;
	            chargeCode = chargeCode.replace(/✖.*/, "").trim();
	            if (!chargeCode) return;

	            let isStaticRow = chargeCode.toLowerCase().includes("work location") || chargeCode.toLowerCase().includes("company code");
	            let rowHasValue = false;
	            const inputs = row.querySelectorAll("td input:not(.dropdown-search)");

	            inputs.forEach((input, colIndex) => {
	                let actualColIndex = colIndex + 1;
	                let cellIndex = `${rowIndex}_${actualColIndex}`;

	                if (skipColumns.includes(actualColIndex)) return;

	                if (!input.hasAttribute("data-prev")) {
	                    input.setAttribute("data-prev", input.value.trim());
	                }

	                let previousValue = input.getAttribute("data-prev");
	                let currentValue = input.value.trim();

	                if (currentValue !== "") {
	                    rowHasValue = true;
	                    if (!isStaticRow) columnFilled[actualColIndex] = true;

	                    timesheetEntries.push({
	                        username: sessionStorage.getItem("userName"),
	                        period: selectedPeriod,
	                        chargeCode: chargeCode,
	                        cellIndex: cellIndex,
	                        hours: currentValue
	                    });

	                    input.setAttribute("data-prev", currentValue);
	                } else if (previousValue !== "" && currentValue === "") {
	                    timesheetEntries.push({
	                        username: sessionStorage.getItem("userName"),
	                        period: selectedPeriod,
	                        chargeCode: chargeCode,
	                        cellIndex: cellIndex,
	                        hours: null
	                    });

	                    input.setAttribute("data-prev", "");
	                }
	            });

	            if (rowHasValue) hasValidDynamicRow = true;
	        });

	        const totalColumns = document.querySelectorAll("#tableBody tr:first-child td input").length;
	        let emptyColumns = [];

	        for (let col = 1; col <= totalColumns; col++) {
	            if (skipColumns.includes(col)) continue;
	            if (!columnFilled[col]) emptyColumns.push(col);
	        }

	        if (emptyColumns.length > 0) {
	            emptyColumns.forEach(colIndex => {
	                document.querySelectorAll(`#tableBody tr:not(.static-row) td:nth-child(${colIndex + 1}) input`).forEach(input => {
	                    input.style.border = "1px solid red";
	                });
	            });
	            return;
	        }

	        if (!hasValidDynamicRow) {
	            showAlert("⚠ No valid data entered in dynamic rows!", "danger");
	            return;
	        }

	        try {
	            fetch("/saveTimesheet", {
	                method: "POST",
	                headers: { "Content-Type": "application/json" },
	                body: JSON.stringify(timesheetEntries)
	            })
	            .then(async response => {
	                const text = await response.text();
	                if (!response.ok) {
	                    showAlert(text, "danger");
	                } else {
	                    showAlert(text, "success");
	                    fetchTimesheetData();
	                }
	            });
	        } catch (e) {
	            showAlert("❌ JSON Formatting Error", "danger");
	        }
	    };
	}







    saveIcon.addEventListener("click", saveTimesheetData);
    periodDropdown.addEventListener("change", fetchTimesheetData);
	calender.addEventListener("change", fetchTimesheetData);
	preview.addEventListener("click", fetchTimesheetData);
	nextpre.addEventListener("click", fetchTimesheetData);
    fetchTimesheetData(); 
	
});


document.addEventListener("DOMContentLoaded", function () {
    const periodDropdown = document.getElementById("periodDropdown");
	const calender = document.getElementById('calendarPicker');
	const preview = document.getElementById('prevPeriod');
	const nextpre = document.getElementById('nextPeriod');
    const updateBtn = document.getElementById("bankUpdateBtn");

	function checkAndDisableUpdateBtn() {
	  const selectedPeriod = periodDropdown.options[periodDropdown.selectedIndex].text;
	  const startDate = selectedPeriod.split(" - ")[0];  
	  const startDay = parseInt(startDate.split("/")[0]);

	  // Check if bank details are already saved (i.e., not empty)
	  const accountHolder = document.getElementById('bankAccountHolder').textContent.trim();
	  const accountNumber = document.getElementById('fullAccountNumber').value.trim();
	  const ifsc = document.getElementById('bankIFSC').textContent.trim();
	  const bankName = document.getElementById('bankName').textContent.trim();

	  const isBankDetailsFilled = accountHolder && accountNumber && ifsc && bankName;

	  if (startDay >= 16 && isBankDetailsFilled) {
	    updateBtn.disabled = true;
	    updateBtn.classList.add("disabled");
	  } else {
	    updateBtn.disabled = false;
	    updateBtn.classList.remove("disabled");
	  }
	}


    // Call once on load
    checkAndDisableUpdateBtn();

    // Call again when dropdown changes
    periodDropdown.addEventListener("change", checkAndDisableUpdateBtn);
	calender.addEventListener("change", checkAndDisableUpdateBtn);
	preview.addEventListener("click", checkAndDisableUpdateBtn);
	nextpre.addEventListener("click", checkAndDisableUpdateBtn);
});


document.addEventListener("DOMContentLoaded", function () {
    const periodDropdown = document.getElementById("periodDropdown");
    const calender = document.getElementById("calendarPicker");
    const preview = document.getElementById("prevPeriod");
    const nextpre = document.getElementById("nextPeriod");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text;
    }

    async function fetchAndShowPayslipSummary() {
        const username = sessionStorage.getItem("userName");
        const extractedPeriod = getSelectedPeriod();

        // Extract "2025-05" from "01/05/2025 - 15/05/2025"
        const dateParts = extractedPeriod.split(" - ")[0].split("/");
        const formattedMonth = `${dateParts[2]}-${dateParts[1]}`;

        try {
            const response = await fetch(`/payslip/EmpPayslipSummary?username=${encodeURIComponent(username)}&month=${formattedMonth}`);

            if (!response.ok) {
                throw new Error("Payslip data not found");
            }

            const data = await response.json();

            // Fill summary fields
            document.getElementById("summaryUsername").textContent = data.username || "-";
            document.getElementById("summaryDesignation").textContent = data.designation || "-";
			if (data.month) {
			    const [year, month] = data.month.split("-");
			    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'short' }); 
			    document.getElementById("summaryMonth").textContent = `${year}-${monthName}`;
			} else {
			    document.getElementById("summaryMonth").textContent = "-";
			}
            document.getElementById("summaryStdWorkDays").textContent = data.stdWorkDays ?? "-";
            document.getElementById("summaryTotalLeaves").textContent = data.totalLeaves ?? "-";
			document.getElementById("summaryLOP").textContent = data.lop ?? "-";
            document.getElementById("summaryWorkingDays").textContent = data.totalWorkingDays ?? "-";
            document.getElementById("summaryBasicSalary").textContent = data.basicSalary ? `₹${data.basicSalary.toFixed(2)}` : "-";
            document.getElementById("summaryDeductions").textContent = data.deductions ? `₹${data.deductions.toFixed(2)}` : "-";
            document.getElementById("summaryNetPay").textContent = data.netPay ? `₹${data.netPay.toFixed(2)}` : "-";

        } catch (err) {
            console.error("Error fetching payslip summary:", err);
            clearPayslipSummaryUI();
        }
    }

  function clearPayslipSummaryUI() {
        const fields = [
            "summaryUsername", "summaryDesignation", "summaryMonth",
            "summaryStdWorkDays", "summaryTotalLeaves", "summaryWorkingDays",
            "summaryLOP", "summaryBasicSalary", "summaryDeductions", "summaryNetPay",
        ];
        fields.forEach(id => document.getElementById(id).textContent = "-");
    }

    // Auto-update when period changes
    periodDropdown.addEventListener("change", fetchAndShowPayslipSummary);
    calender.addEventListener("change", fetchAndShowPayslipSummary);
    preview.addEventListener("click", () => setTimeout(fetchAndShowPayslipSummary, 200));
    nextpre.addEventListener("click", () => setTimeout(fetchAndShowPayslipSummary, 200));

    // Initial load
    fetchAndShowPayslipSummary();
});


/*icons funtions*/
document.addEventListener("DOMContentLoaded", function () {
    let selectedRow = null; 

    // 🔥 Row Click Event Listener
    document.getElementById("tableBody").addEventListener("click", function (event) {
        let clickedRow = event.target.closest("tr"); 
        if (!clickedRow || isProtectedRow(clickedRow)) return;

        // Remove old selection
        if (selectedRow) selectedRow.classList.remove("selected-row");
		
        selectedRow = clickedRow;
        selectedRow.classList.add("selected-row"); 
    });

    // 🔥 Delete Row Function (With Custom Modal)
    document.getElementById("deleteIcon").addEventListener("click", function () {
        if (!selectedRow) {
            showAlert("⚠ Please select a row before deleting.", "danger");
            return;
        }

        let chargeCode = selectedRow.cells[0]?.innerText.trim(); 

        // 🛑 Prevent deleting static rows
        if (isProtectedRow(selectedRow)) {
            showAlert("⚠ You cannot delete Work Location or Company Code rows!", "danger");
            return;
        }

        // 🔥 Show Custom Delete Modal
        document.getElementById("deleteRowMessage").innerText = 
            `⚠ Are you sure you want to delete the row with Charge Code: ${chargeCode}?`;
        let deleteModal = new bootstrap.Modal(document.getElementById("deleteRowModal"));
        deleteModal.show();

        // ✅ Handle Delete Confirmation
        document.getElementById("confirmDeleteRow").onclick = function () {
            deleteModal.hide();
            sendDeleteRequest(chargeCode);
        };
    });


    function sendDeleteRequest(chargeCode) {
		
		function getSelectedPeriod() {
		       return periodDropdown.options[periodDropdown.selectedIndex].text;
		   }

		   const selectedPeriod = getSelectedPeriod();
		   
		   fetch(`/deleteRow?chargeCode=${encodeURIComponent(chargeCode)}&period=${encodeURIComponent(selectedPeriod)}`, {
		           method: "DELETE",
		       })
		       .then(response => response.json())
		       .then(data => {
		           if (data.success) {
		               selectedRow.remove(); 
		               selectedRow = null; 
		               showAlert("✅ Row deleted successfully!", "success");
		               fetchTimesheetData();
		           } else {
		               showAlert("❌ Failed to delete row from database.", "danger");
		           }
		       })


			   
		   }

   
    function isProtectedRow(row) {
        let firstCellText = row.cells[0]?.innerText.trim().toLowerCase();
        return firstCellText.includes("work location") || firstCellText.includes("company code");
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const addExpenseBtn = document.getElementById("addExpenseBtn");
    const cancelExpenseBtn = document.getElementById("cancelExpenseBtn");
    const expenseForm = document.getElementById("expenseForm");
    const expensePeriod = document.getElementById("expensePeriod");  
    const periodDropdown = document.getElementById("periodDropdown");
	const calender = document.getElementById('calendarPicker');
	const preview = document.getElementById('prevPeriod');
	const nextpre = document.getElementById('nextPeriod');

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text;
    }

    // Update period field when periodDropdown changes
    periodDropdown.addEventListener("change", function () {
        expensePeriod.value = getSelectedPeriod();
    });
	calender.addEventListener("change", function () {
	        expensePeriod.value = getSelectedPeriod();
	    });
		preview.addEventListener("click", function () {
		        expensePeriod.value = getSelectedPeriod();
		    });
			nextpre.addEventListener("click", function () {
			        expensePeriod.value = getSelectedPeriod();
			    });

    if (addExpenseBtn && cancelExpenseBtn && expenseForm && expensePeriod) {
        addExpenseBtn.addEventListener("click", function () {
            expenseForm.style.display = "block";
            expensePeriod.value = getSelectedPeriod(); // Auto-fill period
        });

        cancelExpenseBtn.addEventListener("click", function () {
            expenseForm.style.display = "none";
        });
    }

    // Fetch Expense Types
    function fetchExpenseTypes() {
        fetch("/getExpensecode") 
            .then(response => response.json())
            .then(data => {
                const expenseTypeDropdown = document.getElementById("expenseType");
                expenseTypeDropdown.innerHTML = `<option value="">Select Type</option>`; 

                data.forEach(expense => {
                    let exCode = expense["Ex-code"] || expense["Ex_code"] || expense["exCode"];
                    let exType = expense["Ex-type"] || expense["Ex_type"] || expense["exType"];

                    if (exCode && exType) {
                        let option = document.createElement("option");
                        option.value = exCode; // Store Ex_code as value
                        option.textContent = `${exCode} - ${exType}`;
                        expenseTypeDropdown.appendChild(option);
                    } else {
                        console.warn("Invalid Expense Type Data:", expense); 
                    }
                });
            })


    }

    fetchExpenseTypes(); 
	
	document.getElementById("saveExpenseBtn").addEventListener("click", function () {
	    const username = sessionStorage.getItem("userName");
	    const period = document.getElementById("expensePeriod").value;
	    const expenseText = document.getElementById("expenseType").options[document.getElementById("expenseType").selectedIndex].text;
	    const expenseType = expenseText; // Send full type

	    const amount = document.getElementById("expenseAmount").value;
	    const invoice = document.getElementById("expenseInvoice").value;
	    const gst = document.getElementById("expenseGST").value;
	    const receipt = document.getElementById("expenseReceipt").files[0];
	    const description = document.getElementById("expenseDescription").value;

	    if (!username || !period || !expenseType || !amount || !invoice) {
	        alert("Please fill all required fields!");
	        return;
	    }

	    // Set the period dynamically in the modal text
	    document.getElementById("confirmExpenseText").innerText = `Are you sure you want to save this expense for the period: ${period}?`;

	    // Show Bootstrap modal
	    let confirmModal = new bootstrap.Modal(document.getElementById("confirmExpenseModal"));
	    confirmModal.show();

	    // On confirm button click, proceed with saving
	    document.getElementById("confirmSaveExpense").onclick = function () {
	        let formData = new FormData();
	        formData.append("username", username);
	        formData.append("period", period);
	        formData.append("expenseType", expenseType);
	        formData.append("amount", amount);
	        formData.append("invoice", invoice);
	        formData.append("gst", gst);
	        if (receipt) {
	            formData.append("receipt", receipt);
	        }
	        formData.append("description", description);

	        fetch("/saveEmpExpense", {
	            method: "POST",
	            body: formData,
	        })
	        .then(response => response.json())
	        .then(data => {
	            showAlert("Expense Saved Successfully!", "success");
	            fetchExpenses();
	            document.getElementById("expenseFormElement").reset();
	            document.getElementById("expenseForm").style.display = "none";
	        })

	        
	        confirmModal.hide(); 
	    };
	});

	function fetchExpenses() {
	    
	    function getSelectedPeriod() {
	        return periodDropdown.options[periodDropdown.selectedIndex].text;
	    }

	    let username = sessionStorage.getItem("userName");  
	    let period = getSelectedPeriod();  

	 

	    fetch(`/getEmpExpenses?username=${encodeURIComponent(username)}&period=${encodeURIComponent(period)}`)
	        .then(response => response.json())
	        .then(data => {
	       

	            let tableBody = document.querySelector("#expenseTable tbody");
	            tableBody.innerHTML = ""; 

	            let totalExpense = 0; 

	            if (data.length === 0) {
	                tableBody.innerHTML = `<tr><td colspan="7">No expenses found for this period</td></tr>`;
	                return;
	            }

	            data.forEach(expense => {
	                let row = document.createElement("tr");

	                row.innerHTML = `
	                    <td>${expense.period}</td>
	                    <td>${expense.expenseType}</td>
	                    <td>${expense.invoice}</td>
	                    <td>${expense.gst}</td>
	                    <td>${expense.description}</td>
						<td>${expense.amount}</td>
						<td style="text-align: center;">
						                       ${expense.receipt ? "✅" : "❌"}
						                   </td>
										   <td>
										   <button class="btn btn-success btn-sm"><i class="bi bi-pencil-square"></i></button>
										   <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">
										                   <i class="bi bi-trash3"></i>
										               </button>
														  </td>
	                `;

	                tableBody.appendChild(row);
	              
	                totalExpense += parseFloat(expense.amount) || 0;
	            });

	            let totalRow = document.createElement("tr");
	            totalRow.innerHTML = `
	                <td colspan="5"><strong>Total Expense:</strong></td>
	                <td><strong>${totalExpense.toFixed(2)}</strong></td>
	                <td colspan="4"></td> 
	            `;
	            tableBody.appendChild(totalRow);

	        })
	       
	}

		periodDropdown.addEventListener("change", fetchExpenses)
	    calender.addEventListener("change", fetchExpenses);
		preview.addEventListener("click", fetchExpenses);
		nextpre.addEventListener("click", fetchExpenses);
		
	fetchExpenses();


});




function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense?")) {
        fetch(`/deleteEmpExpense/${id}`, {
            method: "DELETE"
        })
        .then(async response => {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || "Failed to delete expense");
            }
            showAlert(text || "Expense deleted successfully." , "success");
            fetchExpenses(); // Reload table after deletion
        })
        .catch(err => {
            console.error("Error deleting expense:", err);
            alert(err.message || "Failed to delete the expense.");
        });
    }
}



document.addEventListener("DOMContentLoaded", function () {
    let timePeriodElement = document.getElementById("periodDropdown");
    let calendar = document.getElementById("calendarPicker");
    let preview = document.getElementById("prevPeriod");
    let nextPeriod = document.getElementById("nextPeriod");
    let navLinks = document.querySelectorAll(".nav-link");

    function generateSummaryIfVisible() {
        if (document.getElementById("summarySection").style.display !== "none") {
            generateSummary();
        }
    }

    if (timePeriodElement) {
        timePeriodElement.addEventListener("change", generateSummaryIfVisible);
    }

    if (calendar) {
        calendar.addEventListener("change", generateSummaryIfVisible);
    }

    if (preview) {
        preview.addEventListener("click", generateSummaryIfVisible);
    }

    if (nextPeriod) {
        nextPeriod.addEventListener("click", generateSummaryIfVisible);
    }

    // 🔥 Detect section change and update summary when switching to Summary
    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            let targetSection = this.getAttribute("data-target");
            if (targetSection === "summarySection") {
                setTimeout(generateSummary, 100); 
            }
        });
    });

    generateSummary();
});

function generateSummary() {
    const username = sessionStorage.getItem("userName");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text;
    }

    const selectedPeriod = getSelectedPeriod();
    const selectedMonth = selectedPeriod.split(" ")[0]; // Extract month (assuming format: "March - First Half")
	


	fetch(`/getSummary?username=${username}&period=${selectedPeriod}`)
	    .then(response => response.json())
	    .then(data => {
	        let summaryBody = document.getElementById("summaryBody");
	        summaryBody.innerHTML = ""; 

	        let casualLeaveDays = data.casualLeaveDays;
	        let sickLeaveDays = data.sickLeaveDays;
	        let paidLeaveDays = data.paidLeaveDays;
	        

	        if (data.entries.length === 0) {
	            summaryBody.innerHTML = `<tr><td colspan="3">No data available</td></tr>`;
	        } else {
	            data.entries.forEach(entry => {
	                let row = `<tr>
	                    <td>${entry.chargeCode}</td>
	                    <td>${entry.hours}</td>
	                 
	                </tr>`;
	                summaryBody.innerHTML += row;
	            });
	        }

	        let standardHours = calculateStandardAllocatedHours(selectedPeriod);
	        let totalWorkingHours = data.totalHours - data.totallop;
		

	        // Update total values
	        document.getElementById("totalHours").textContent = data.totalHours;
	        document.getElementById("totalAbsences").textContent = data.totalAbsences;
	        document.getElementById("locationTotalHours").textContent = totalWorkingHours;
	        document.getElementById("totalworking").textContent = totalWorkingHours;
	        document.getElementById("standardHours").textContent = standardHours;
	        document.getElementById("totalExpense").textContent = data.totalExpense; 

			// Get today's date in proper format
			const today = new Date().toLocaleDateString('en-US', {
			    year: 'numeric', month: 'long', day: 'numeric'
			});

			// Update contribution and loss of pay
			document.getElementById("annualContribution").textContent = 
			    `Annual Chargeability Contribution: ${(totalWorkingHours / standardHours * 100).toFixed(2)}%`;

			document.getElementById("leaveBalanceDate").textContent = 
			    `As of ${today}, you have the following leave balances:`;

			// Leave data from backend
			const allowedLeave = data.allowedLeave || {};

			document.getElementById("earnedLeave").textContent = 
			    `Earned Casual Leave: ${(allowedLeave.earnedLeave || 0).toFixed(2)}`;

			document.getElementById("remainingSick").textContent = 
			    `Remaining Sick Leave: ${(allowedLeave.sickLeave || 0).toFixed(2)} out of 6`;

			document.getElementById("remainingFloating").textContent = 
			    `Remaining Floating Leave: ${(allowedLeave.floatingLeave || 0).toFixed(2)} out of 2`;

			document.getElementById("remainingCasual").textContent = 
			    `Remaining Casual Leave: ${(allowedLeave.casualLeave || 0).toFixed(2)} out of 12`;

			document.getElementById("paidLeave").textContent = 
			    `Loss of Pay: ${Math.max(0, paidLeaveDays.toFixed(1))} days (taken on this Period)`;
	    });
}

function toggleTooltip(iconElement) {
  // Close other open tooltips
  document.querySelectorAll(".info-icon").forEach(el => {
    if (el !== iconElement) el.classList.remove("active");
  });

  // Toggle this one
  iconElement.classList.toggle("active");
}

// Optional: Close tooltip when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".info-icon")) {
    document.querySelectorAll(".info-icon").forEach(el => el.classList.remove("active"));
  }
});


/*
function calculatesundays(selectedPeriod) {
    let [startDateStr, endDateStr] = selectedPeriod.split(" - "); // Example: "01/03/2025 - 15/03/2025"


    function parseDate(dateStr) {
        let parts = dateStr.split("/");
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    let startDate = parseDate(startDateStr);
    let endDate = parseDate(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
    
        return 0; 
    }

    let totalsundays = 0;

	while (startDate <= endDate) {
	    if (startDate.getDay() === 0 ) { 
	        totalsundays++;
	    }
	    startDate.setDate(startDate.getDate() + 1);
	}


    return totalsundays * 9; 
} */
 
function calculateStandardAllocatedHours(selectedPeriod) {
    let [startDateStr, endDateStr] = selectedPeriod.split(" - "); // Example: "01/03/2025 - 15/03/2025"


    function parseDate(dateStr) {
        let parts = dateStr.split("/");
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    let startDate = parseDate(startDateStr);
    let endDate = parseDate(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
    
        return 0; 
    }

    let totalWorkingDays = 0;

	while (startDate <= endDate) {
	    if (startDate.getDay() !== 0 && !isHoliday(startDate)) { 
	        totalWorkingDays++;
	    }
	    startDate.setDate(startDate.getDate() + 1);
	}
    return totalWorkingDays * 9; 
}

/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {



            
            const adminEmployees = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", adminEmployees);

            
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })


}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; 

    if (!dropdownList) {

        return;
    }

    employees.forEach(employee => {
        const li = document.createElement("li");
        li.innerHTML = `<a class="dropdown-item" href="#" data-name="${employee["E-name"]}" data-email="${employee["E-mail"]}">${employee["E-name"]}</a>`;
        dropdownList.appendChild(li);
    });

   
    dropdownList.addEventListener("click", function (event) {
        event.preventDefault();
        const target = event.target;
        if (target.tagName === "A") {
            selectEmployee(target.dataset.name, target.dataset.email, dropdownButtonId);
        }
    });
}

/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {
            
            const activeAdmins = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", activeAdmins);

           
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })
 
}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; 

    if (!dropdownList) {

        return;
    }

    employees.forEach(employee => {
        const li = document.createElement("li");
        li.innerHTML = `<a class="dropdown-item" href="#" data-name="${employee["E-name"]}" data-email="${employee["E-mail"]}">${employee["E-name"]}</a>`;
        dropdownList.appendChild(li);
    });

    // Event delegation to handle dropdown clicks
    dropdownList.addEventListener("click", function (event) {
        event.preventDefault();
        const target = event.target;
        if (target.tagName === "A") {
            selectEmployee(target.dataset.name, target.dataset.email, dropdownButtonId);
        }
    });
}


/* Select Employee */
function selectEmployee(name, email, dropdownButtonId) {


    if (!email || email === "undefined") {
        showAlert(`Email not found for ${name}`, "danger");
        return;
    }

    let textAreaId;
    if (dropdownButtonId === "approversDropdown") {
        textAreaId = "selectedApprovers";
    } else if (dropdownButtonId === "reviewersDropdown") {
        textAreaId = "selectedReviewers";
    }
	else if(dropdownButtonId == "delegatorDropdown") {
		textAreaId = "selectedDelegators";
	}

    const textArea = document.getElementById(textAreaId);
    const currentEmails = textArea.value.split("\n").map(e => e.trim());

    // Prevent duplicate emails
    if (!currentEmails.includes(email)) {
        textArea.value += (textArea.value ? "\n" : "") + email;
        document.getElementById(dropdownButtonId).innerText = name; 
    } else {
        showAlert("This employee is already added!", "danger");
    }
}

/* Remove Specific Employee */
function removeLastEntry(textAreaId) {
    const textArea = document.getElementById(textAreaId);
    if (!textArea) {

        return;
    }

    let lines = textArea.value.trim().split("\n");
    if (lines.length > 0) {
        lines.pop();
        textArea.value = lines.join("\n"); 
    } else {
        showAlert("No employees to remove!", "danger");
    }
}

/* Reset Preferences */
function resetPreferences() {
    document.getElementById("selectedApprovers").value = "";
    document.getElementById("selectedReviewers").value = "";
    document.getElementById("selectedDelegators").value = "";
}

/* Show Custom Popup */
function showConfirmationPopup(callback) {
    // Create overlay
    let overlay = document.createElement("div");
    overlay.id = "confirmationOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1000";

    // Create popup box
    let popup = document.createElement("div");
    popup.style.background = "#fff";
    popup.style.padding = "20px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    popup.style.textAlign = "center";
    popup.style.width = "350px";

    // Add message
    let message = document.createElement("p");
    message.innerText = "Do you want to assign these employees for your timesheet?";
    popup.appendChild(message);

    // Create button container
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.marginTop = "15px";

    // Yes button
    let yesButton = document.createElement("button");
    yesButton.innerText = "Yes";
    yesButton.style.background = "#28a745";
    yesButton.style.color = "#fff";
    yesButton.style.border = "none";
    yesButton.style.padding = "10px 20px";
    yesButton.style.borderRadius = "5px";
    yesButton.style.cursor = "pointer";
    yesButton.onclick = function () {
        document.body.removeChild(overlay);
        callback(true);
    };

    // No button
    let noButton = document.createElement("button");
    noButton.innerText = "No";
    noButton.style.background = "#dc3545";
    noButton.style.color = "#fff";
    noButton.style.border = "none";
    noButton.style.padding = "10px 20px";
    noButton.style.borderRadius = "5px";
    noButton.style.cursor = "pointer";
    noButton.onclick = function () {
        document.body.removeChild(overlay);
        callback(false);
    };

    // Append buttons
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    popup.appendChild(buttonContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

function savePreferences() {
    showConfirmationPopup(function (confirmed) {
        if (confirmed) {
            const periodDropdown = document.getElementById("periodDropdown");
            if (!periodDropdown) {
                showAlert("Period dropdown not found!", "danger");
                return;
            }

            function getSelectedPeriod() {
                return periodDropdown.options[periodDropdown.selectedIndex]?.text || null;
            }

            const selectedPeriod = getSelectedPeriod();
            const loggedInUser = sessionStorage.getItem("userName"); 

            if (!selectedPeriod || !loggedInUser) {
                showAlert("Please select a period and ensure you're logged in!", "danger");
                return;
            }

            const preferences = {
                period: selectedPeriod,
                Employeename: loggedInUser,  
                approvers: document.getElementById("selectedApprovers").value.trim().split("\n").join(","),
                reviewers: document.getElementById("selectedReviewers").value.trim().split("\n").join(","),
                delegator: document.getElementById("selectedDelegators").value.trim().split("\n").join(",")
            };

            

            fetch("/savePreferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences)
            })
            .then(response => response.text())
            .then(data => {
                showAlert("Preferences Saved!", "success");
            })

        } else {


        }
    });
}

/*
function fetchPreferences() {
    const periodDropdown = document.getElementById("periodDropdown");

    if (!periodDropdown) {

        return;
    }

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex]?.text || null;
    }
    const selectedPeriod = getSelectedPeriod();
    const loggedInUser = sessionStorage.getItem("userName"); 
	
    if (!selectedPeriod || !loggedInUser) {

        resetPreferences(); // Clear fields if no period is selected
        return;
    }

    fetch(`/getPreferences?period=${selectedPeriod}&employeename=${encodeURIComponent(loggedInUser)}`)
        .then(response => {
            if (!response.ok) {

                resetPreferences();
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            

            function formatEmails(emails) {
                return (emails || "").split(",").map(email => email.trim()).join("\n");
            }

            document.getElementById("selectedApprovers").value = formatEmails(data.approvers);
            document.getElementById("selectedReviewers").value = formatEmails(data.reviewers);
            document.getElementById("selectedDelegators").value = formatEmails(data.delegator);
        })

}


// Wait for the DOM to load before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
	fetchEmployeeData();
    fetchPreferences();

    const periodDropdown = document.getElementById("periodDropdown");
	const calender = document.getElementById('calendarPicker');
	const preview = document.getElementById('prevPeriod');
	const nextpre = document.getElementById('nextPeriod');
	
    if (periodDropdown) {
        periodDropdown.addEventListener("change", fetchPreferences);
		calender.addEventListener("change", fetchPreferences);
		preview.addEventListener("click", fetchPreferences);
		nextpre.addEventListener("click", fetchPreferences);
    } 
});
*/


document.addEventListener("DOMContentLoaded", function () {
    const sendApprovalBtn = document.getElementById("sendApprovalBtn");
    const submitBtn = document.getElementById("submitBtn"); // ✅ Get Submit Button
    const confirmApprovalBtn = document.getElementById("confirmApproval");
	const submitApprovalBtn = document.getElementById("confirmsubmit");
    const username = sessionStorage.getItem("userName");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex]?.text || ""; 
    }

    function updateButtonState() {
        const selectedPeriod = getSelectedPeriod();

        if (!selectedPeriod) {

            return;
        }

        fetch(`/getApprovalStatus?username=${encodeURIComponent(username)}&period=${encodeURIComponent(selectedPeriod)}`)
            .then(response => response.json())
            .then(data => {
                const approvalStatus = data.status || "No Data"; // Default if no data is found



                if (!sendApprovalBtn || !submitBtn) {
    
                    return;
                }

                let prevText = sendApprovalBtn.textContent;

                // Clear previous button styles
                sendApprovalBtn.classList.remove("btn-success", "btn-info", "btn-warning");
                submitBtn.classList.remove("btn-success", "btn-info", "btn-warning");

                if (approvalStatus === "Approved") {
                    sendApprovalBtn.textContent = "Approved";
                    sendApprovalBtn.classList.add("btn-success");
					submitBtn.textContent = "Approved";
					submitBtn.classList.add("btn-success");
                    sendApprovalBtn.disabled = true;
                    submitBtn.disabled = false;
                } else if (approvalStatus === "Pending") {
                    sendApprovalBtn.textContent = "Reviewing";
                    sendApprovalBtn.classList.add("btn-info");
                    sendApprovalBtn.disabled = true;
                    submitBtn.disabled = false; 
                } else if (approvalStatus === "Issue") {
                    sendApprovalBtn.textContent = "Timesheet Issue";
                    sendApprovalBtn.classList.add("btn-warning");
                    sendApprovalBtn.disabled = false;
                    submitBtn.disabled = false;
                } else {
                    sendApprovalBtn.textContent = "Send Approval";
                    sendApprovalBtn.classList.add("btn-success");
                    sendApprovalBtn.disabled = false;
                    submitBtn.disabled = false;
					submitBtn.textContent = "Submit";
					submitBtn.classList.add("btn-info");
                }

                if (prevText !== sendApprovalBtn.textContent) {
                   
                }
            })

    }

    
    function sendForApproval(selectedPeriod, status) {
        fetch("/sendForApproval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, period: selectedPeriod, status }) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (status === "Pending") {
                    sendApprovalBtn.textContent = "Reviewing";
                    sendApprovalBtn.classList.add("btn-info");
                    sendApprovalBtn.disabled = true;
                    showAlert("Timesheet Successfully Sent for Approval!", "success");
                } else if (status === "Approved") {
                    submitBtn.textContent = "Approved";
                    submitBtn.classList.add("btn-success");
                    sendApprovalBtn.disabled = true;
                    submitBtn.disabled = true;
                    showAlert("Timesheet Successfully Submitted!", "success");
                }
                sessionStorage.setItem(`approvalStatus_${username}_${selectedPeriod}`, status); 
            }
        })

    }

    // ✅ "Send for Approval" Button Click
    sendApprovalBtn.addEventListener("click", function () {
        const selectedPeriod = getSelectedPeriod();

        if (!selectedPeriod) {
            showAlert("⚠ Please select a period before sending approval.", "danger");
            return;
        }

        // 🔥 Update Modal with Selected Period
        document.getElementById("selectedPeriodText").textContent = selectedPeriod;

        // 🔥 Show the Confirmation Modal
        let approvalModal = new bootstrap.Modal(document.getElementById("approvalModal"));
        approvalModal.show();

        // ✅ Handle Confirmation Click
        confirmApprovalBtn.onclick = function () {
            approvalModal.hide();
            sendForApproval(selectedPeriod, "Pending"); 
        };
    });

    
    submitBtn.addEventListener("click", function () {
        const selectedPeriod = getSelectedPeriod();

        if (!selectedPeriod) {
            showAlert("⚠ Please select a period before submitting.", "danger");
            return;
        }

		// 🔥 Update Modal with Selected Period
		        document.getElementById("selectedPeriodText2").textContent = selectedPeriod;

		        // 🔥 Show the Confirmation Modal
		        let saveModal = new bootstrap.Modal(document.getElementById("submitModal"));
		        saveModal.show();

				submitApprovalBtn.onclick = function () {
				            saveModal.hide();
				           sendForApproval(selectedPeriod, "Approved");
				        };
         // ✅ Send "Approved" status
    });

    // Listen for period change and update button state
    periodDropdown.addEventListener("change", updateButtonState);
    calendarPicker.addEventListener("change", updateButtonState);
    nextPeriod.addEventListener("click", updateButtonState);
    prevPeriod.addEventListener("click", updateButtonState);

    setInterval(updateButtonState, 2000);
});

