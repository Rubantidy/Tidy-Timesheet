
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
		        while (tableRows.length <= rowIndex) {
		            addRow(); // Dynamically add missing rows
		            tableRows = document.querySelectorAll("#tableBody tr"); // Update list after adding
		        }

		        let row = tableRows[rowIndex];
		        if (!row) return;

		        // ✅ Fix: Properly update Charge Code Cell
		        let chargeCodeCell = row.cells[0]; // First column (Charge Code)
		        if (chargeCodeCell && chargeCode) {
		            let chargeCodeDropdown = chargeCodeCell.querySelector("select");
		            if (chargeCodeDropdown) {
		                chargeCodeDropdown.value = chargeCode;
		            } else {
		                chargeCodeCell.textContent = chargeCode;
		            }
		            console.log(`✅ Charge Code Set: "${chargeCode}" in Row ${rowIndex + 1}`);
		        }

		        // ✅ Insert Hours
		        let cell = row.cells[colIndex];
		        if (cell) {
		            let input = cell.querySelector("input");
		            if (input && input.value.trim() === "") {
		                input.value = hours;
		                console.log(`✅ Inserted Hours: ${hours} at ${cellIndex}`);
		            }
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
		        return new Date(parts[2], parts[1] - 1, parts[0]);
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

		    // Clear previous highlights
		    document.querySelectorAll("#tableBody tr td input").forEach(input => {
		        input.style.border = "";
		    });

		    rows.forEach((row, rowIndex) => {
		        let chargeCodeCell = row.cells[0];
		        if (!chargeCodeCell) return;

		        let chargeCode = chargeCodeCell.textContent.trim();
		        if (chargeCode.includes("Select Charge Code")) {
		            console.log("❌ Skipping Row: Select Charge Code");
		            return;
		        }
		        chargeCode = chargeCode.replace(/✖.*/, "").trim();
		        if (!chargeCode || chargeCode === "") {
		            console.log("❌ Skipping Empty or Invalid Charge Code Row");
		            return;
		        }
		        console.log("✅ Valid Charge Code Found:", chargeCode);

		        let isStaticRow = chargeCode.toLowerCase().includes("work location") || chargeCode.toLowerCase().includes("company code");
		        let rowHasValue = false;
		        const inputs = row.querySelectorAll("td input:not(.dropdown-search)");

		        inputs.forEach((input, colIndex) => {
		            let actualColIndex = colIndex + 1;
		            let cellIndex = `${rowIndex}_${actualColIndex}`;

		            if (sundayColumns.includes(actualColIndex)) return;

		            if (input.value.trim() !== "") {
		                rowHasValue = true;
		                if (!isStaticRow) columnFilled[actualColIndex] = true;

		                timesheetEntries.push({
		                    username: localStorage.getItem("userName"),
		                    period: selectedPeriod,
		                    chargeCode: chargeCode,
		                    cellIndex: cellIndex,
		                    hours: input.value.trim()
		                });

		                // Remove red border when value is entered
		                input.style.border = "";
		            } else if (!isStaticRow) {
		                // Add red border only for dynamic rows
		                input.style.border = "2px solid red";

		                // Add event listener to remove border when value is entered
		                input.addEventListener("input", function () {
		                    if (input.value.trim() !== "") {
		                        input.style.border = "";
		                    }
		                });
		            }
		        });

		        if (rowHasValue) {
		            hasValidDynamicRow = true;
		        }
		    });

		    const totalColumns = document.querySelectorAll("#tableBody tr:first-child td input").length;
		    let emptyColumns = [];

		    for (let col = 1; col <= totalColumns; col++) {
		        if (sundayColumns.includes(col)) continue;
		        if (!columnFilled[col]) emptyColumns.push(col);
		    }

		    if (emptyColumns.length > 0) {
		        alert("⚠ Some columns in dynamic rows are completely empty (excluding Sundays). Please fill all required fields.");
		        return;
		    }

		    if (!hasValidDynamicRow) {
		        alert("⚠ No valid data entered in dynamic rows!");
		        return;
		    }

		    try {
		        const jsonPayload = JSON.stringify(timesheetEntries);
		        console.log("✅ JSON Payload:", jsonPayload);

		        fetch("/saveTimesheet", {
		            method: "POST",
		            headers: { "Content-Type": "application/json" },
		            body: jsonPayload
		        })
		        .then(response => response.text())
		        .then(result => {
		            console.log("✅ Save Successful:", result);
		            alert(result);
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







	

	