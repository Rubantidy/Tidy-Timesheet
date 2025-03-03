
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

	        // 🛑 Skip "Total Hours" row
	        if (rowIndex >= tableRows.length) return;

	        let row = tableRows[rowIndex];
	        if (!row) return;

	        // ✅ Fix: Properly update Charge Code Cell
	        let chargeCodeCell = row.cells[0]; // First column (Charge Code)
	        if (chargeCodeCell && chargeCode) {
	            // Check if charge code dropdown exists inside the cell
	            let chargeCodeDropdown = chargeCodeCell.querySelector("select");
	            if (chargeCodeDropdown) {
	                // Set dropdown value
	                chargeCodeDropdown.value = chargeCode;
	            } else {
	                // Directly set text if no dropdown exists
	                chargeCodeCell.textContent = chargeCode;
	            }
	            console.log(`✅ Charge Code Set: "${chargeCode}" in Row ${rowIndex + 1}`);
	        }

	        // ✅ Insert Hours only if empty
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

	    console.log("Checking Table Rows:", rows);

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

	        // Select all valid input fields
	        const inputs = row.querySelectorAll("td input:not(.dropdown-search)");

	        if (inputs.length === 0) {
	            console.log("❌ Skipping Row: No Valid Input Fields");
	            return;
	        }

	        console.log("🎯 Found Valid Inputs in Row:", inputs);

	        inputs.forEach((input, colIndex) => {
	            let actualColIndex = colIndex + 1; // Adjust for column shift like in populateTable()
	            let cellIndex = `${rowIndex}_${actualColIndex}`; // ✅ Store the correct column index

	            console.log(`🔍 Checking Input - Cell Index: ${cellIndex}, Hours: ${input.value.trim()}`);

	            if (input.value.trim() !== "") { 
	                timesheetEntries.push({
	                    username: localStorage.getItem("userName"),
	                    period: selectedPeriod,
	                    chargeCode: chargeCode,
	                    cellIndex: cellIndex, // ✅ Store cellIndex instead of ID
	                    hours: input.value.trim()
	                });
	            }
	        });
	    });

	    console.log("Final Data to Send:", timesheetEntries);

	    if (timesheetEntries.length === 0) {
	        console.error("❌ No valid data collected! Not calling backend.");
	        alert("⚠ No changes detected to save!");
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
			.then(response => response.text()) // Change to .text() to handle plain responses
			.then(result => {
			    console.log("✅ Save Successful:", result);
			    alert(result); // Show success message
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







	

	