
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
	        .catch(error => console.error("Error fetching Charge codes:", error));
	}

	function renderTable(data) {
	    const employeeTableBody = document.getElementById("employee-code-table-body");
	    if (!employeeTableBody) {
	        console.error("Table body for Employee not found!");
	        return;
	    }
	    
	    const selectedFilter = document.getElementById("projectTypeFilter").value;
	    const filteredData = selectedFilter === "All" ? data : data.filter(code => code.projectType === selectedFilter);
	    
	    employeeTableBody.innerHTML = "";
	    filteredData.forEach(code => {
	        employeeTableBody.innerHTML += `
	            <tr>
	                <td>${code.id}</td>
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
	            .catch(error => console.error("Error fetching Charge codes:", error));
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
    const username = localStorage.getItem("userName"); // Logged-in employee

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text; // Example: "01/03/2024 - 15/03/2024"
    }

	function fetchTimesheetData() {
	    const selectedPeriod = getSelectedPeriod();

	    fetch(`/getTimesheet?username=${username}&period=${selectedPeriod}`)
	        .then(response => response.json())
	        .then(data => {
	            console.log("Fetched Data:", data);
	            // Call populateTable() only once.
	            populateTable(data);
	        })
	        .catch(error => console.error("Error fetching timesheet:", error));
	}
	
	function populateTable(fetchedData) {
	    console.log("📌 Populating Table with Data:", fetchedData);

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

	            console.log(`✅ Populated ${cellIndex} → Value: ${hours}, Data-prev: ${input.getAttribute("data-prev")}`);
	        }
	    });

	    // ✅ Recalculate totals after populating
	    calculateTotals();
	}


	function saveTimesheetData() {
	    const selectedPeriod = getSelectedPeriod();
	    const rows = document.querySelectorAll("#tableBody tr");
	    let timesheetEntries = [];
	    let columnFilled = {};
	    let hasValidDynamicRow = false;

	    function parseDate(dateStr) {
	        let parts = dateStr.split("/");
	        return new Date(parts[2], parts[1] - 1, parts[0]); // YYYY, MM (0-based), DD
	    }

	    let [startDateStr, endDateStr] = selectedPeriod.split(" - ");
	    let startDate = parseDate(startDateStr);
	    let endDate = parseDate(endDateStr);

	    let sundayColumns = [];
	    let currentDate = new Date(startDate);
	    let columnIndex = 1;

	    while (currentDate <= endDate) {
	        if (currentDate.getDay() === 0) {
	            sundayColumns.push(columnIndex);
	        }
	        currentDate.setDate(currentDate.getDate() + 1);
	        columnIndex++;
	    }

	    console.log("📌 Excluding Sunday Columns:", sundayColumns);

	    document.querySelectorAll("#tableBody tr td input").forEach(input => {
	        input.style.backgroundColor = "";
	        input.removeAttribute("title"); // Clear previous tooltip
	    });

	    rows.forEach((row, rowIndex) => {
	        let chargeCodeCell = row.cells[0];
	        if (!chargeCodeCell) return;

	        let chargeCode = chargeCodeCell.textContent.trim();
	        if (chargeCode.includes("Select Charge Code")) return;
	        chargeCode = chargeCode.replace(/✖.*/, "").trim();
	        if (!chargeCode) return;

	        console.log("✅ Valid Charge Code Found:", chargeCode);

	        let isStaticRow = chargeCode.toLowerCase().includes("work location") || chargeCode.toLowerCase().includes("company code");
	        let rowHasValue = false;
	        const inputs = row.querySelectorAll("td input:not(.dropdown-search)");

	        inputs.forEach((input, colIndex) => {
	            let actualColIndex = colIndex + 1;
	            let cellIndex = `${rowIndex}_${actualColIndex}`;

	            if (sundayColumns.includes(actualColIndex)) return;

	            // ✅ Ensure "data-prev" is set during population
	            if (!input.hasAttribute("data-prev")) {
	                input.setAttribute("data-prev", input.value.trim());
	            }

	            let previousValue = input.getAttribute("data-prev");
	            let currentValue = input.value.trim();

	            if (currentValue !== "") {
	                rowHasValue = true;
	                if (!isStaticRow) columnFilled[actualColIndex] = true;

	                timesheetEntries.push({
	                    username: localStorage.getItem("userName"),
	                    period: selectedPeriod,
	                    chargeCode: chargeCode,
	                    cellIndex: cellIndex,
	                    hours: currentValue
	                });

	                input.setAttribute("data-prev", currentValue); // Update stored value
	            } 
	            // ✅ Handle cleared cells: If the cell had a value before but is now empty, mark for deletion
	            else if (previousValue !== "" && currentValue === "") {
	                console.log(`🛑 Cell CLEARED at ${cellIndex} (Previous: "${previousValue}", Now: "EMPTY")`);

	                timesheetEntries.push({
	                    username: localStorage.getItem("userName"),
	                    period: selectedPeriod,
	                    chargeCode: chargeCode,
	                    cellIndex: cellIndex,
	                    hours: null // Indicating deletion
	                });

	                input.setAttribute("data-prev", ""); // Update stored value
	            }
	        });

	        if (rowHasValue) hasValidDynamicRow = true;
	    });

	    const totalColumns = document.querySelectorAll("#tableBody tr:first-child td input").length;
	    let emptyColumns = [];

	    for (let col = 1; col <= totalColumns; col++) {
	        if (sundayColumns.includes(col)) continue;
	        if (!columnFilled[col]) emptyColumns.push(col);
	    }

	    if (emptyColumns.length > 0) {
	        emptyColumns.forEach(colIndex => {
	            document.querySelectorAll(`#tableBody tr:not(.static-row) td:nth-child(${colIndex + 1}) input`).forEach(input => {
	                input.style.border = "1px solid red";
	                input.setAttribute("title", "⚠ Field is required!"); // Tooltip on hover
	            });
	        });
	        return;
	    }

	    if (!hasValidDynamicRow) {
	        alert("⚠ No valid data entered in dynamic rows!");
	        return;
	    }

	    try {
	        console.log("✅ JSON Payload Before Sending:", timesheetEntries); // Debugging Log

	        fetch("/saveTimesheet", {
	            method: "POST",
	            headers: { "Content-Type": "application/json" },
	            body: JSON.stringify(timesheetEntries)
	        })
	        .then(response => response.text())
	        .then(result => {
	            console.log("✅ Save Successful:", result);
	            alert(result);
	            location.reload();
	        })
	        .catch(error => console.error("❌ Error saving timesheet:", error));
	    } catch (e) {
	        console.error("❌ JSON Formatting Error:", e);
	    }
	}




    saveIcon.addEventListener("click", saveTimesheetData);
    periodDropdown.addEventListener("change", fetchTimesheetData);
	calender.addEventListener("change", fetchTimesheetData);
	preview.addEventListener("click", fetchTimesheetData);
	nextpre.addEventListener("click", fetchTimesheetData);
    fetchTimesheetData(); // Load data on page load
	
});





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

        console.log("✅ Row Selected:", selectedRow);
    });

    // 🔥 Delete Row Function
    document.getElementById("deleteIcon").addEventListener("click", function () {
        if (!selectedRow) {
            alert("⚠ Please select a row before deleting.");
            return;
        }

        let chargeCode = selectedRow.cells[0]?.innerText.trim(); // Get Charge Code

        // 🛑 Prevent deleting static rows
        if (isProtectedRow(selectedRow)) {
            alert("⚠ You cannot delete Work Location or Company Code rows!");
            return;
			
        }

        // 🛑 Show Confirmation Message
        let confirmDelete = confirm(`⚠ Are you sure you want to delete the row with Charge Code: ${chargeCode}?`);
        if (!confirmDelete) return;

        // 🔥 Send DELETE request to backend
        fetch(`/deleteRow?chargeCode=${encodeURIComponent(chargeCode)}`, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                selectedRow.remove(); // Remove row from UI
                selectedRow = null; // Reset selection
                alert("✅ Row deleted successfully!");
				location.reload();
            } else {
                alert("❌ Failed to delete row from database.");
            }
        })
        .catch(error => {
            console.error("❌ Error deleting row:", error);
            alert("❌ Error deleting row. Check console.");
        });
    });

    // 🔥 Function to Protect Certain Rows (Work Location & Company Code)
    function isProtectedRow(row) {
        let firstCellText = row.cells[0]?.innerText.trim().toLowerCase();
        return firstCellText.includes("work location") || firstCellText.includes("company code");
    }
});




function generateSummary() {
	
    const username = localStorage.getItem("userName");
    
    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text;
    }
	
    const selectedPeriod = getSelectedPeriod();

    fetch(`/getSummary?username=${username}&period=${selectedPeriod}`)
        .then(response => response.json())
        .then(data => {
            let summaryBody = document.getElementById("summaryBody");
            summaryBody.innerHTML = ""; // Clear previous data

            if (data.entries.length === 0) {
                summaryBody.innerHTML = `<tr><td colspan="3">No data available</td></tr>`;
            } else {
                data.entries.forEach(entry => {
                    let row = `<tr>
                        <td>${entry.chargeCode}</td>
                        <td>${entry.hours}</td>
                        <td>${entry.chargeCode === "TDL1" || entry.chargeCode === "TDL2" ? entry.hours : 0}</td>
                    </tr>`;
                    summaryBody.innerHTML += row;
                }); 
            }

			let standardHours = calculateStandardAllocatedHours(selectedPeriod);
			

            // Update total values
            document.getElementById("totalHours").textContent = data.totalHours;
            document.getElementById("totalAbsences").textContent = data.totalAbsences;
            document.getElementById("locationTotalHours").textContent = (data.totalHours - data.totalAbsences); // Location total
			document.getElementById("totalworking").textContent = (data.totalHours - data.totalAbsences);
			document.getElementById("standardHours").textContent = standardHours; // ✅ Update dynamically

			
		
        })
        .catch(error => {
            console.error("Error fetching summary data:", error);
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
        console.error("Invalid date format:", selectedPeriod);
        return 0; // Return 0 if dates are invalid
    }

    let totalWorkingDays = 0;

    while (startDate <= endDate) {
        if (startDate.getDay() !== 0) { // Exclude Sundays (0 = Sunday)
            totalWorkingDays++;
        }
        startDate.setDate(startDate.getDate() + 1); // Move to next day
    }

    console.log(`Total Working Days (excluding Sundays): ${totalWorkingDays}`);

    return totalWorkingDays * 9; // 1 working day = 9 hours
}



document.addEventListener("DOMContentLoaded", function () {
    let timePeriodElement = document.getElementById("periodDropdown");
	let calender = document.getElementById('calendarPicker');
		let preview = document.getElementById('prevPeriod');
		let nextpre = document.getElementById('nextPeriod');
    
    if (timePeriodElement || calender ) {
        addEventListener("change", function () {
            if (document.getElementById("summarySection").style.display !== "none") {
                generateSummary();
            }
        });
    } 
	
	else {
        console.error("Element with ID 'timePeriod' not found.");
    }

	if(preview || nextpre) {
		addEventListener("click", function(){
			if(document.getElementById("summarySection").style.display !== "none") {
				generateSummary();
			}
		});
	}
	else{
		console.log("Element with ID not found.")
	}
    // Call generateSummary once page loads (if needed)
    generateSummary();
});



/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Employees:", data); // Debugging log

            // Populate Approvers with only Admins
            const adminEmployees = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", adminEmployees);

            // Populate Reviewers & Delegators with all active employees
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })
        .catch(error => console.error("Error fetching employees:", error));
}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; // Clear existing items

    if (!dropdownList) {
        console.error("Dropdown list not found:", dropdownListId);
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
            console.log("Fetched Employees:", data); // Debugging log

            // Filter Admin employees who are also active
            const activeAdmins = data.filter(employee => employee.e_Role === "Admin" && employee.status === "active");
            populateEmployeeDropdown("approversDropdown", "approversList", activeAdmins);

            // Filter all active employees for Reviewers & Delegators
            const activeEmployees = data.filter(employee => employee.status === "active");
            populateEmployeeDropdown("reviewersDropdown", "reviewersList", activeEmployees);
            populateEmployeeDropdown("delegatorDropdown", "delegatorsList", activeEmployees);
        })
        .catch(error => console.error("Error fetching employees:", error));
}

/* Populate Employee Dropdown */
function populateEmployeeDropdown(dropdownButtonId, dropdownListId, employees) {
    const dropdownList = document.getElementById(dropdownListId);
    dropdownList.innerHTML = ""; // Clear existing items

    if (!dropdownList) {
        console.error("Dropdown list not found:", dropdownListId);
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
        alert(`Email not found for ${name}`);
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
        alert("This employee is already added!");
    }
}

/* Remove Specific Employee */
function removeLastEntry(textAreaId) {
    const textArea = document.getElementById(textAreaId);
    if (!textArea) {
        console.error("Text area not found:", textAreaId);
        return;
    }

    let lines = textArea.value.trim().split("\n");
    if (lines.length > 0) {
        lines.pop();
        textArea.value = lines.join("\n"); // Update textarea
    } else {
        alert("No employees to remove!");
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
                alert("Period dropdown not found!");
                return;
            }

            function getSelectedPeriod() {
                return periodDropdown.options[periodDropdown.selectedIndex]?.text || null;
            }

            const selectedPeriod = getSelectedPeriod();
            const loggedInUser = localStorage.getItem("userName"); // ✅ Get username from local storage

            if (!selectedPeriod || !loggedInUser) {
                alert("Please select a period and ensure you're logged in!");
                return;
            }

            const preferences = {
                period: selectedPeriod,
                Employeename: loggedInUser,  // ✅ Ensure username is included
                approvers: document.getElementById("selectedApprovers").value.trim().split("\n").join(","),
                reviewers: document.getElementById("selectedReviewers").value.trim().split("\n").join(","),
                delegator: document.getElementById("selectedDelegators").value.trim().split("\n").join(",")
            };

            console.log("Sending Preferences:", preferences);

            fetch("/savePreferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preferences)
            })
            .then(response => response.text())
            .then(data => {
                alert("Preferences Saved!");
            })
            .catch(error => console.error("Error saving preferences:", error));
        } else {
            console.log("Saving canceled.");
        }
    });
}


function fetchPreferences() {
    const periodDropdown = document.getElementById("periodDropdown");

    if (!periodDropdown) {
        console.error("Period dropdown not found!");
        return;
    }

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex]?.text || null;
    }

    const selectedPeriod = getSelectedPeriod();
    const loggedInUser = localStorage.getItem("userName"); // ✅ Get logged-in username

    if (!selectedPeriod || !loggedInUser) {
        console.warn("Period or username missing!"); 
        resetPreferences(); // Clear fields if no period is selected
        return;
    }

    console.log(`Fetching preferences for ${loggedInUser} - ${selectedPeriod}`);

    fetch(`/getPreferences?period=${selectedPeriod}&employeename=${encodeURIComponent(loggedInUser)}`)
        .then(response => {
            if (!response.ok) {
                console.warn("No saved preferences found.");
                resetPreferences();
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            
            console.log("Fetched Preferences:", data);

            function formatEmails(emails) {
                return (emails || "").split(",").map(email => email.trim()).join("\n");
            }

            document.getElementById("selectedApprovers").value = formatEmails(data.approvers);
            document.getElementById("selectedReviewers").value = formatEmails(data.reviewers);
            document.getElementById("selectedDelegators").value = formatEmails(data.delegator);
        })
        .catch(error => console.error("Error fetching preferences:", error));
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
    } else {
        console.error("Element with ID 'periodDropdown' not found!");
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const sendApprovalBtn = document.getElementById("sendApprovalBtn");
    const username = localStorage.getItem("userName");

    function getSelectedPeriod() {
        return periodDropdown.options[periodDropdown.selectedIndex].text; // Example: "01/03/2024 - 15/03/2024"
    }

	function updateButtonState() {
	    const selectedPeriod = getSelectedPeriod();
	    const username = localStorage.getItem("userName");

	    if (!selectedPeriod) {
	        console.warn("No period selected, skipping button update.");
	        return;
	    }

	    fetch(`/getApprovalStatus?username=${encodeURIComponent(username)}&period=${encodeURIComponent(selectedPeriod)}`)
	        .then(response => response.json())
	        .then(data => {
	            const approvalStatus = data.status || "No Data"; // Default if no data is found
	            console.log("Fetched Status from DB:", approvalStatus); // ✅ Debugging Output

	            const sendApprovalBtn = document.getElementById("sendApprovalBtn");

	            if (!sendApprovalBtn) {
	                console.warn("Send Approval button not found!");
	                return;
	            }

	            if (approvalStatus === "Approved") {
	                sendApprovalBtn.textContent = "Approved";
	                sendApprovalBtn.classList.add("btn-success"); // Add green styling
	                sendApprovalBtn.disabled = true;
	            } else if (approvalStatus === "Pending") {
	                sendApprovalBtn.textContent = "Reviewing";
	                sendApprovalBtn.classList.add("btn-info"); // Add blue styling
	                sendApprovalBtn.disabled = true;
	            } else if (approvalStatus === "Issue") {
	                sendApprovalBtn.textContent = "Timesheet Issue";
	                sendApprovalBtn.classList.add("btn-warning"); // Add yellow styling
	                sendApprovalBtn.disabled = false;
	            } else if (approvalStatus === "No Data") {
	                sendApprovalBtn.textContent = "Send Approval";
	                sendApprovalBtn.classList.remove("btn-success", "btn-warning", "btn-info"); // Reset styles
	                sendApprovalBtn.disabled = false;
	            } else {
	                sendApprovalBtn.textContent = "Send Approval";
	                sendApprovalBtn.disabled = false;
	            }
				
				
				// ✅ Refresh page **ONLY if button text changed to "Approved" or "Timesheet Issue"**
				           if (prevText !== sendApprovalBtn.textContent && (sendApprovalBtn.textContent === "Approved" || sendApprovalBtn.textContent === "Timesheet Issue")) {
				               setTimeout(() => {
				                   location.reload();
				               }, 500); // Small delay to ensure UI update
				           }
				
	        })
			
	        .catch(error => console.error("Error fetching approval status:", error));
			
	}


    // Update button state on page load
    updateButtonState();

    sendApprovalBtn.addEventListener("click", function() {
        const selectedPeriod = getSelectedPeriod();
        console.log("save period:", selectedPeriod);

        if (!selectedPeriod) {
            alert("⚠ Please select a period before sending approval.");
            return;
        }

        fetch("/sendForApproval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, period: selectedPeriod })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sendApprovalBtn.textContent = "Reviewing";
                sendApprovalBtn.disabled = true;
                localStorage.setItem(`approvalStatus_${username}_${selectedPeriod}`, "Reviewing"); // Store state
                alert("Sent for approval!");
			
            }
        })
        .catch(error => console.error("Error sending for approval:", error));
    });

    // Listen for period change and update button state
    periodDropdown.addEventListener("change", updateButtonState);
	calendarPicker.addEventListener("change", updateButtonState);
	nextPeriod.addEventListener("click", updateButtonState);
	prevPeriod.addEventListener("click", updateButtonState);
	
	
});

