// PREVENT DIRECT ACCESS TO DASHBOARDS
	document.addEventListener("DOMContentLoaded", function() {
	    const userName = sessionStorage.getItem("userName");

	    // Redirect to login page if user session is null
	    if (userName === null) {
	        window.location.href = "/login";
	    }
	});


document.addEventListener("DOMContentLoaded", function () {
        // Get all nav links
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

                // Switch to the corresponding section
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

	    // Force sorting: Move "Leave Code" to the end
	    filteredData = filteredData.sort((a, b) => {
	        let aType = a.codeType.toLowerCase(); // Convert to lowercase to avoid case issues
	        let bType = b.codeType.toLowerCase();
	        return aType === "leave code" ? 1 : bType === "leave code" ? -1 : 0;
	    });

	    // Clear existing table content
	    employeeTableBody.innerHTML = "";

	    // Render the sorted data
	    filteredData.forEach(code => {
	        let rowColor = code.status === "Complete" ? "style='background-color: #d9e2f3; font-weight: bold;'" : ""; 
	        
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
	         
	            // Call populateTable() only once.
	            populateTable(data);
	        })
	    
	}
	
	function populateTable(fetchedData) {
	    

	    fetchedData.forEach(entry => {
	        let { chargeCode, cellIndex, hours } = entry;
	        let [rowIndex, colIndex] = cellIndex.split("_").map(Number);

	        let tableRows = document.querySelectorAll("#tableBody tr");

	        // 🔄 Ensure row exists before inserting data
	        while (tableRows.length <= rowIndex + 1) {
	            addRow(); // Dynamically add missing rows
	            tableRows = document.querySelectorAll("#tableBody tr");
	        }

	        let row = tableRows[rowIndex];
	        if (!row) return;

	        let firstCell = row.cells[0]; // First column (Charge Code)

	        // ✅ Skip static rows (Work Location, Company Code)
	        let firstCellText = firstCell.textContent.trim().toLowerCase();
	        if (firstCellText === "work location" || firstCellText === "company code") {
	            return;
	        }

	        // ✅ Show stored charge code as text, replace with dropdown when clicked
	        if (firstCell) {
	            firstCell.innerHTML = ""; // Clear existing content

	            let chargeCodeDisplay = document.createElement("div");
	            chargeCodeDisplay.classList.add("stored-charge-code");
	            chargeCodeDisplay.style.cursor = "pointer";
	            chargeCodeDisplay.textContent = chargeCode ? chargeCode : "Select Charge Code"; // Show stored or default

	            firstCell.appendChild(chargeCodeDisplay);

	            // 👉 On Click: Replace text with dropdown
	            chargeCodeDisplay.addEventListener("click", function () {
	                firstCell.innerHTML = ""; // Clear cell
	                let dropdownContainer = createDropdown();
	                let button = dropdownContainer.querySelector(".dropdown-button");
	                let clearButton = dropdownContainer.querySelector("span"); // Clear (✖) button

	                // ✅ If a stored charge code exists, update the dropdown button text
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

	        // ✅ Insert Hours and Set `data-prev`
	        let cell = row.cells[colIndex];
	        if (cell) {
	            let input = cell.querySelector("input");
	            if (!input) {
	                input = document.createElement("input");
	                input.type = "number";
	                input.classList.add("hourInput");
	                cell.innerHTML = ''; // Clear previous content
	                cell.appendChild(input);
	            }
	            input.value = hours || ""; // ✅ Set value but allow editing

	            // ✅ Ensure `data-prev` is set correctly during population
	            input.setAttribute("data-prev", hours || "");

	           
	        }
	    });

	    // ✅ Recalculate totals after populating
	    calculateTotals();
	}

	

	function saveTimesheetData() {
	    const selectedPeriod = getSelectedPeriod();

	    document.getElementById("saveTimesheetMessage").innerText = 
	        `⚠ Are you sure you want to save the timesheet for "${selectedPeriod}"?`;

	    let saveModal = new bootstrap.Modal(document.getElementById("saveTimesheetModal"));
	    saveModal.show();

	    document.getElementById("confirmSaveTimesheet").onclick = function () {
	        saveModal.hide();  // Close modal

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

	        let skipColumns = []; // ✅ Sundays + Holidays
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

	                if (skipColumns.includes(actualColIndex)) return; // ✅ Skip Sunday + Holiday columns

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
	                } 
	                else if (previousValue !== "" && currentValue === "") {
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
	            if (skipColumns.includes(col)) continue; // ✅ Ignore Sunday + Holiday columns
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
	            .then(response => response.text())
	            .then(result => {
	                showAlert(result, "success");
	                fetchTimesheetData();
	            });
	        } catch (e) {
	            showAlert("❌ JSON Formatting Error:", "danger");
	        }
	    };
	}





    saveIcon.addEventListener("click", saveTimesheetData);
    periodDropdown.addEventListener("change", fetchTimesheetData);
	calender.addEventListener("change", fetchTimesheetData);
	preview.addEventListener("click", fetchTimesheetData);
	nextpre.addEventListener("click", fetchTimesheetData);
    fetchTimesheetData(); // Load data on page load
	
});




/*icons funtions*/
document.addEventListener("DOMContentLoaded", function () {
    let selectedRow = null; // Store the selected row

    // 🔥 Row Click Event Listener
    document.getElementById("tableBody").addEventListener("click", function (event) {
        let clickedRow = event.target.closest("tr"); // Get the full row
        if (!clickedRow || isProtectedRow(clickedRow)) return;

        // Remove old selection
        if (selectedRow) selectedRow.classList.remove("selected-row");

        // Select new row
        selectedRow = clickedRow;
        selectedRow.classList.add("selected-row"); // Highlight row
    });

    // 🔥 Delete Row Function (With Custom Modal)
    document.getElementById("deleteIcon").addEventListener("click", function () {
        if (!selectedRow) {
            showAlert("⚠ Please select a row before deleting.", "danger");
            return;
        }

        let chargeCode = selectedRow.cells[0]?.innerText.trim(); // Get Charge Code

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

    // 🔥 Send DELETE request (Unchanged Logic)
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
		               selectedRow.remove(); // Remove row from UI
		               selectedRow = null; // Reset selection
		               showAlert("✅ Row deleted successfully!", "success");
		               location.reload();
		           } else {
		               showAlert("❌ Failed to delete row from database.", "danger");
		           }
		       })


			   
		   }

    // 🔥 Function to Protect Certain Rows (Work Location & Company Code)
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
        fetch("/getExpensecode") // API call
            .then(response => response.json())
            .then(data => {
                const expenseTypeDropdown = document.getElementById("expenseType");
                expenseTypeDropdown.innerHTML = `<option value="">Select Type</option>`; // Default option

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

    fetchExpenseTypes(); // Load on page load
	
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

	        
	        confirmModal.hide(); // Hide modal after saving
	    };
	});

	function fetchExpenses() {
	    
	    function getSelectedPeriod() {
	        return periodDropdown.options[periodDropdown.selectedIndex].text;
	    }

	    let username = sessionStorage.getItem("userName");  // Get username
	    let period = getSelectedPeriod();  // Get selected period

	 

	    fetch(`/getEmpExpenses?username=${encodeURIComponent(username)}&period=${encodeURIComponent(period)}`)
	        .then(response => response.json())
	        .then(data => {
	       

	            let tableBody = document.querySelector("#expenseTable tbody");
	            tableBody.innerHTML = ""; // Clear previous data

	            let totalExpense = 0; // Initialize total expense

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
										   	<button class="btn btn-danger btn-sm"><i class="bi bi-trash3"></i></button>
														  </td>
	                `;

	                tableBody.appendChild(row);

	                // Add expense amount to total
	                totalExpense += parseFloat(expense.amount) || 0;
	            });

	            // Append Total Expense Row
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
                setTimeout(generateSummary, 100); // Small delay to ensure section is visible
            }
        });
    });

    // Call generateSummary once page loads (if needed)
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
	        summaryBody.innerHTML = ""; // Clear previous data

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
	        let totalWorkingHours = data.totalHours - data.totalAbsences;

	        // Update total values
	        document.getElementById("totalHours").textContent = data.totalHours;
	        document.getElementById("totalAbsences").textContent = data.totalAbsences;
	        document.getElementById("locationTotalHours").textContent = totalWorkingHours;
	        document.getElementById("totalworking").textContent = totalWorkingHours;
	        document.getElementById("standardHours").textContent = standardHours;
	        document.getElementById("totalExpense").textContent = data.totalExpense; // Update total expense

	        // Update leave details
	        document.getElementById("contributionPercent").textContent = 
	            `Contribution on this Period : ${((totalWorkingHours / standardHours) * 100).toFixed(2)}%`;
	        document.getElementById("casualLeave").textContent = 
	            `Casual Leave Taken: ${casualLeaveDays.toFixed(1)} (Max: 1 per month)`;
	        document.getElementById("sickLeave").textContent = 
	            `Sick Leave Taken: ${sickLeaveDays.toFixed(1)} (Max: 6 per year)`;
	        document.getElementById("paidLeave").textContent = 
	            `Loss of Pay: ${Math.max(0, paidLeaveDays.toFixed(1))}`;
	    });
}



function calculateStandardAllocatedHours(selectedPeriod) {
    let [startDateStr, endDateStr] = selectedPeriod.split(" - "); // Example: "01/03/2025 - 15/03/2025"

    // Convert "DD/MM/YYYY" to "YYYY-MM-DD" for correct parsing
    function parseDate(dateStr) {
        let parts = dateStr.split("/");
        return new Date(parts[2], parts[1] - 1, parts[0]); // YYYY, MM (0-based), DD
    }

    let startDate = parseDate(startDateStr);
    let endDate = parseDate(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
    
        return 0; // Return 0 if dates are invalid
    }

    let totalWorkingDays = 0;

	while (startDate <= endDate) {
	    if (startDate.getDay() !== 0 && !isHoliday(startDate)) { // Exclude Sundays + Holidays
	        totalWorkingDays++;
	    }
	    startDate.setDate(startDate.getDate() + 1);
	}





    return totalWorkingDays * 9; // 1 working day = 9 hours
}








/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {



            // Populate Approvers with only Admins
            const adminEmployees = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", adminEmployees);

            // Populate Reviewers & Delegators with all active employees
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })


}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; // Clear existing items

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

/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {



            // Filter Admin employees who are also active
            const activeAdmins = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", activeAdmins);

            // Filter all active employees for Reviewers & Delegators
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })
 
}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; // Clear existing items

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
        document.getElementById(dropdownButtonId).innerText = name; // Update dropdown button text
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
        textArea.value = lines.join("\n"); // Update textarea
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
            const loggedInUser = sessionStorage.getItem("userName"); // ✅ Get username from local storage

            if (!selectedPeriod || !loggedInUser) {
                showAlert("Please select a period and ensure you're logged in!", "danger");
                return;
            }

            const preferences = {
                period: selectedPeriod,
                Employeename: loggedInUser,  // ✅ Ensure username is included
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


function fetchPreferences() {
    const periodDropdown = document.getElementById("periodDropdown");

    if (!periodDropdown) {

        return;
    }

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex]?.text || null;
    }
    const selectedPeriod = getSelectedPeriod();
    const loggedInUser = sessionStorage.getItem("userName"); // ✅ Get logged-in username
	
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



document.addEventListener("DOMContentLoaded", function () {
    const sendApprovalBtn = document.getElementById("sendApprovalBtn");
    const submitBtn = document.getElementById("submitBtn"); // ✅ Get Submit Button
    const confirmApprovalBtn = document.getElementById("confirmApproval");
	const submitApprovalBtn = document.getElementById("confirmsubmit");
    const username = sessionStorage.getItem("userName");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex]?.text || ""; // Ensure it's not undefined
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
                    submitBtn.disabled = false; // ✅ Allow submit if pending
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

    // ✅ Function to Send for Approval OR Submit
    function sendForApproval(selectedPeriod, status) {
        fetch("/sendForApproval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, period: selectedPeriod, status }) // ✅ Send "Pending" or "Approved"
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
                sessionStorage.setItem(`approvalStatus_${username}_${selectedPeriod}`, status); // Store state
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
            sendForApproval(selectedPeriod, "Pending"); // ✅ Send "Pending" status
        };
    });

    // ✅ "Submit" Button Click (Sets Status to "Approved")
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

