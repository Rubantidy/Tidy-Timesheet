
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
	            console.log("Fetched Data:", data); // Debugging
				populateTable(data);
				
				console.log("✅ API Response:", data);

	            data.forEach(entry => {
	                let cellIndex = entry.cellIndex; // Get stored cell index
	                let [rowIndex, columnIndex] = cellIndex.split("_").map(Number);

	                let rows = document.querySelectorAll("#tableBody tr");
	                if (rows[rowIndex]) {
	                    let inputs = rows[rowIndex].querySelectorAll("td input");
	                    if (inputs[columnIndex]) {
	                        inputs[columnIndex].value = entry.hours; // Insert saved data
	                        console.log(`✅ Inserted Data - Cell Index: ${cellIndex}, Hours: ${entry.hours}`);
	                    } else {
	                        console.log(`❌ Column ${columnIndex} Not Found in Row ${rowIndex}`);
	                    }
	                } else {
	                    console.log(`❌ Row ${rowIndex} Not Found`);
	                }
	            });
	        })
	        .catch(error => console.error("Error fetching timesheet:", error));
	}

	function populateTable(fetchedData) {
	    console.log("📌 Populating Table with Data:", fetchedData);

	    fetchedData.forEach(entry => {
	        let { chargeCode, cellIndex, hours } = entry;
	        let [rowIndex, colIndex] = cellIndex.split("_").map(Number);

	        let row = document.querySelector(`#tableBody tr:nth-child(${rowIndex + 1})`);

	        if (!row) {
	            console.warn(`⚠ Row ${rowIndex + 1} Not Found`);
	            return;
	        }

	        // ✅ Ensure Charge Code is Set
	        let chargeCodeCell = row.cells[0];
	        if (chargeCodeCell) {
	            if (!chargeCodeCell.textContent.trim()) { // Prevent overwriting
	                chargeCodeCell.textContent = chargeCode;
	                console.log(`✅ Charge Code "${chargeCode}" set in Row ${rowIndex + 1}`);
	            } else {
	                console.warn(`⚠ Charge Code already exists in Row ${rowIndex + 1}, skipping.`);
	            }
	        }

	        // ✅ Insert Hours Correctly
	        let cell = row.cells[colIndex];
	        if (cell) {
	            let input = cell.querySelector("input");
	            if (input) {
	                if (input.value.trim() === "") { // Avoid overwriting
	                    input.value = hours;
	                    console.log(`✅ Inserted Hours: ${hours} at ${cellIndex}`);
	                } else {
	                    console.warn(`⚠ Skipped Duplicate Hours at ${cellIndex}`);
	                }
	            } else {
	                console.warn(`⚠ Input Not Found in Cell ${cellIndex}`);
	            }
	        } else {
	            console.error(`❌ Column ${colIndex} Not Found in Row ${rowIndex + 1}`);
	        }
	    });
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
	        .then(response => {
	            console.log("✅ Backend Response:", response);
	            return response.json();
	        })
	        .then(result => {
	            console.log("✅ Save Successful:", result);
	            alert("Timesheet saved successfully!");
	        })
	        .catch(error => console.error("❌ Error saving timesheet:", error));

	    } catch (e) {
	        console.error("❌ JSON Formatting Error:", e);
	    }
	}




    saveIcon.addEventListener("click", saveTimesheetData);
    periodDropdown.addEventListener("change", fetchTimesheetData);
    fetchTimesheetData(); // Load data on page load
	
});





	

	