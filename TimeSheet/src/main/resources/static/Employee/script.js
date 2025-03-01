
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
	
	

	// ✅ Function to collect table data (MUST be defined first)
	function getTableData(status) {
	    let timesheetData = {
	        employeeName: localStorage.getItem('userName'),
	        period: document.getElementById("periodDropdown").selectedOptions[0]?.textContent || "",
	        status: status,
	        entries: []
	    };

	    const rows = document.querySelectorAll("#tableBody tr");

	    rows.forEach(row => {
	        let chargeCode = row.querySelector(".dropdown-button")?.textContent.trim();
	        if (!chargeCode || chargeCode === "Select Charge Code") return; // Skip empty rows

	        const inputs = row.querySelectorAll("td input[type='text']");
	        inputs.forEach((input, index) => {
	            let headerElement = document.querySelector(`#tableHeaders th:nth-child(${index + 2})`);
	            if (!headerElement) {
	                console.error(`Error: Missing table header for index ${index + 2}`);
	                return;
	            }

	            let date = headerElement.textContent.split(' ')[0]; // Extract date
	            let hours = parseFloat(input.value) || 0;
	            let workLocation = row.classList.contains("static-row") ? "00" : "00";
	            let companyCode = row.classList.contains("static-row") ? "001" : "001";

	            if (hours > 0) {
	                timesheetData.entries.push({
	                    chargeCode: chargeCode,
	                    date: convertToISODate(date),
	                    hours: hours,
	                    workLocation: workLocation,
	                    companyCode: companyCode
	                });
	            }
	        });
	    });

	    return timesheetData;
	}

	
	