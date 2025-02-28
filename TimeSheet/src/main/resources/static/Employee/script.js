
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
	
	