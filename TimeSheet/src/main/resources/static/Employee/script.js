
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


document.addEventListener("DOMContentLoaded", function () {
    const templateIcon = document.getElementById("templateIcon");
    const username = localStorage.getItem("userName"); // Logged-in employee

    if (!username) {
        console.error("❌ Error: No username found in local storage.");
        return;
    }

    // ✅ Click event for saving the template
    templateIcon.addEventListener("click", function () {
        console.log("📌 Template icon clicked! Saving template...");
        saveTemplate();
    });

    function saveTemplate() {
        let templateEntries = [];

        document.querySelectorAll("#tableBody tr").forEach((row, rowIndex) => {
            let chargeCodeCell = row.cells[0];
            if (!chargeCodeCell) return;

            let chargeCode = chargeCodeCell.textContent.trim();
            if (!chargeCode || chargeCode === "Select Charge Code") return;

            let isStaticRow = chargeCode.toLowerCase().includes("work location") || chargeCode.toLowerCase().includes("company code");
            if (isStaticRow) return; // ❌ Skip static rows

            let weekdayValues = {};
            let hasValidEntry = false;

            row.querySelectorAll("td input:not(.dropdown-search)").forEach((input, colIndex) => {
                let dayIndex = colIndex + 1; // Adjust column index
                if (dayIndex % 7 === 0) return; // ❌ Ignore Sundays

                let value = input.value.trim();
                weekdayValues[dayIndex] = value || "0"; // Default to "0" if empty

                if (value && value !== "0") hasValidEntry = true; // ✅ Track valid data
            });

            if (hasValidEntry) {
                templateEntries.push({
                    username: username,
                    chargeCode: chargeCode,
                    weekdays: weekdayValues
                });
            }
        });

        if (templateEntries.length === 0) {
            console.warn("⚠ No valid data to save in template.");
            alert("⚠ No valid data to save in template!");
            return;
        }

        console.log("📌 Sending Template Data to Backend:", templateEntries);

        fetch("/saveTemplate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(templateEntries)
        })
        .then(response => response.text())
        .then(result => {
            console.log("✅ Template Save Successful:", result);
            alert(result);
        })
        .catch(error => console.error("❌ Error saving template:", error));
    }

    function fetchAndApplyTemplate() {
        fetch(`/getTemplate?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    console.log("📌 Applying template:", data);
                    applyTemplate(data);
                } else {
                    console.warn("⚠ No template data found for this user.");
                }
            })
            .catch(error => console.error("❌ Error fetching template:", error));
    }

    function applyTemplate(templateData) {
        document.querySelectorAll("#tableBody tr").forEach((row, rowIndex) => {
            let chargeCodeCell = row.cells[0];
            if (!chargeCodeCell) return;

            let chargeCode = chargeCodeCell.textContent.trim();
            if (!chargeCode || chargeCode === "Select Charge Code") return;

            let isStaticRow = chargeCode.toLowerCase().includes("work location") || chargeCode.toLowerCase().includes("company code");
            if (isStaticRow) return;

            let matchedTemplate = templateData.find(entry => entry.chargeCode === chargeCode);
            if (!matchedTemplate) return;

            row.querySelectorAll("td input:not(.dropdown-search)").forEach((input, colIndex) => {
                let dayIndex = colIndex + 1;
                if (dayIndex % 7 === 0) return; // ❌ Skip Sundays

                if (!input.value) {
                    input.value = matchedTemplate.weekdays[dayIndex] || "";
                }
            });
        });
    }

    fetchAndApplyTemplate();
});


	

	