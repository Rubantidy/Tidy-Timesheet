document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showContent(this.dataset.section);
            setActiveNavLink(this);
            closeSidebarOnMobile(); 
        });
    });

    document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);
});

function showAlert(message, type = 'success') {
    const alertToast = document.getElementById('alertToast');
    const alertMessage = document.getElementById('alertMessage');
    
    // Set message and type (success/error)
    alertMessage.textContent = message;
    alertToast.className = `toast align-items-center text-white bg-${type} border-0`;
    
    // Show the toast
    const toast = new bootstrap.Toast(alertToast);
    toast.show();
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("show");
    }
}


/*Script for dashboard icons functions */
document.getElementById('logout').addEventListener('click', function(event) {
       event.preventDefault();

       // Clear any session or localStorage data if needed
       localStorage.removeItem('userName'); // Example of clearing the user name stored in localStorage

       // Redirect to the login page
       window.location.href = '/login'; // Redirect to the login page or wherever needed
	   showAlert("Logout Successfully..! ", "success");
   });
   
   
   
function showContent(section) {
    const title = document.getElementById("content-title");
    const contentBox = document.getElementById("content-box");
	const summery = document.getElementById("summery");

    const sections = {
        "dashboard": `
					
        `,
		"approval": `
		<h3>Pending Approvals</h3>
											            <select id="employeeDropdown" class="form-select mb-3">
											                <option value="">Select Employee</option>
											            </select>
											            <div id="summaryContent" class="border p-3 bg-light">
											                <table class="table table-bordered">
											                    <thead>
											                        <tr>
											                            <th>Username</th>
											                            <th>Period</th>
											                            <th>Total Hours</th>
											                            <th>Total Absences</th>
											                            <th>Charge Code Details</th>
											                        </tr>
											                    </thead>
											                    <tbody id="adminSummaryBody">
											                        <!-- Data will be inserted here dynamically -->
											                    </tbody>
											                </table>
											            </div>
											            <div class="d-flex gap-3 mt-3">
											                <button id="approveBtn" class="btn btn-success" onclick="handleApproval()">✅ Approve</button>
											                <button id="issueBtn" class="btn btn-danger" onclick="handleIssue()" >🛑 Reject</button>
											            </div>		
		       `,
		"manage-user": `<button class="btn btn-primary mb-3" id="addEmployeeBtn">Add Users</button><div id="form-container"></div>
		     <div id="form-container"></div>
		           <h4>Employee List</h4>
		           <table class="table table-striped">
		               <thead>
		                   <tr>
						   	  <th>ID</th>
						   	   <th>Registered Date</th>
		                       <th>Name</th>
		                       <th>Email</th>
		
							   <th>Designation</th>
		           
							   <th>Status</th>
		                       <th>Action</th>
		                   </tr>
		               </thead>
		               <tbody id="employee-table-body"></tbody>
		           </table>
		   `,
		   "delegates": `<button class="btn btn-warning mb-3" id="addDelegateBtn">Add Delegates</button><div id="form-container"></div>
		   <table class="table table-striped">
		   		   		   		<thead>
		   		   		   		   <tr>
		   		   		   				<th>ID</th>
		   		   		   		         <th>Delegator Name</th>
		   		   		   		          <th>Delegator Email</th>
		   		   		   		          <th>Action</th>
		   		   		   		     </tr>
		   		   		   		  </thead>
		   		   		   	 <tbody id="Delegate-table-body"></tbody>
		   		   		  </table>
		   `,
		   "charge-code": `<button class="btn btn-info mb-3" id="addChargeCodeBtn">Add Code</button><div id="form-container"></div> 
		   <h4>Charge Code List</h4>
		   		           <table class="table table-striped">
		   		               <thead>
		   		                   <tr>
		   						   	  <th>ID</th>
		   						   	   <th>Code Type</th>
		   		                       <th>Code</th>
		   		                       <th>Client Name</th>
		   							   <th>Description</th>
		   		                       <th>Project Type</th>
									   <th>Start date </th>
									   <th>Country</th>
		   		                       <th>Action</th>
		   		                   </tr>
		   		               </thead>
		   		               <tbody id="code-table-body"></tbody>
		   		           </table>
		   `,
		   "expense-code": `<button class="btn btn-info mb-3" id="addExpenseCodeBtn">Add Expense Code</button><div id="form-container"></div>
		   <h4>Expense Code List</h4>
		   		  <table class="table table-striped">
		   		   		<thead>
		   		   		   <tr>
		   		   				<th>ID</th>
		   		   		         <th>Expense Code</th>
		   		   		          <th>Expense Type</th>
		   		   		          <th>Action</th>
		   		   		     </tr>
		   		   		  </thead>
		   		   	 <tbody id="Expense-table-body"></tbody>
		   		  </table>
		   		   
		    `
    };

    title.innerText = section.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
    contentBox.innerHTML = sections[section] || "<p>Content Not Found</p>";

    attachFormListeners();
	
	if (section === "manage-user") {
	        fetchEmployeeData();
	    }
	else if(section === "charge-code") {
		fetchCodeDatas();
	}
	else if(section === "expense-code") {

		fetchExpense();
	}
	else if(section === "delegates") {
		fetchDelegator();
	}
	else if (section === "dashboard") {
	        // Fetch the counts for Employees, Delegators, Charge Codes, and Expense Codes
	        Promise.all([
	            fetch("/getEmployeesCount").then(res => res.json()),
	            fetch("/getChargecodesCount").then(res => res.json()),
	            fetch("/getExpensecodesCount").then(res => res.json()),
	            fetch("/getDelegatorsCount").then(res => res.json())
	        ])
	        .then(([totalEmployees, totalChargeCodes, totalExpenseCodes, totalDelegators]) => {
	            // Replace the static values with the dynamic values fetched from the backend
	            const dynamicDashboard = `
	               <div class="dashboard-card-box">
	                    ${createCard("bi-people", "Total Employees", totalEmployees)}
	                   
	                    ${createCard("bi-credit-card", "Charge Codes", totalChargeCodes)}
	                    ${createCard("bi bi-receipt", "Expense Codes", totalExpenseCodes)}
	                </div> <br>
					
	            `;

				
	            // Update the content-box with the dynamically generated content
	            contentBox.innerHTML = dynamicDashboard;
				
				
				
				// 
	        })
	        .catch(error => console.error("Error fetching data for dashboard:", error));
			
			    }
				
	else if(section === "approval") {
		fetchPendingApprovals();
	}
			}

			function fetchPendingApprovals() {
			    fetch("/getPendingApprovals")
			        .then(response => response.json())
			        .then(data => {
			            let dropdown = document.getElementById("employeeDropdown");
			            dropdown.innerHTML = '<option value="">Select Employee</option>'; // Reset dropdown

			            if (!Array.isArray(data)) {
			                console.error("Error: Data is not an array", data);
			                return;
			            }

			            data.forEach(entry => {
			                let option = document.createElement("option");
			                option.value = entry.username + "  " + entry.period;
			                option.textContent = `${entry.username} - ${entry.period}`;
			                dropdown.appendChild(option);
			            });

			            // ✅ Add event listener AFTER dropdown is populated
			            dropdown.addEventListener("change", function () {
			                console.log("Dropdown Changed!"); // Debugging

			                let selectedOption = this.value;
			                console.log("Selected Option:", selectedOption); // Debugging

			                if (!selectedOption) {
			                    console.log("No value selected!"); 
			                    return;
			                }

			                let [username, period] = selectedOption.split("  ");
			                console.log("Extracted Username:", username);
							localStorage.setItem("SummaryEmployee" , username);
			                console.log("Extracted Period:", period);

			                fetchEmployeeSummary(username, period);
			            });
			        })
			        .catch(error => console.error("Error fetching pending approvals:", error));
			}

			// ✅ Ensure dropdown is populated before adding event listeners
			fetchPendingApprovals();



			// ✅ Fetch summary for selected employee
			document.addEventListener("DOMContentLoaded", () => {
			    document.getElementById("employeeDropdown").addEventListener("change", function () {
			        let selectedUser = this.value;
			        if (selectedUser) {
			            fetchEmployeeSummary(selectedUser);
			        }
			    });
			});

			


			function fetchEmployeeSummary(username, period) {
			    console.log("fetchEmployeeSummary() Called!");
			    console.log("Username:", username, "Period:", period);

			    let url = `/getSummary?username=${encodeURIComponent(username)}&period=${encodeURIComponent(period)}`;
			    console.log("Fetching URL:", url); // Debugging

			    fetch(url)
			        .then(response => {
			            console.log("Response Status:", response.status);
			            return response.json();
			        })
			        .then(summary => {
			            console.log("Fetched Summary:", summary);

			            if (!summary || Object.keys(summary).length === 0) {
			                console.warn("No summary data found!");
			                document.getElementById("adminSummaryBody").innerHTML = 
			                   `<tr><td colspan="5">No data available</td></tr>`;
			                return;
			            }

			            let adminSummaryBody = document.getElementById("adminSummaryBody");
			            adminSummaryBody.innerHTML = ""; // Clear previous data

			            let chargeCodeRows = summary.entries.map(entry =>
			                `<tr>
			                    <td>${entry.chargeCode}</td>
			                    <td>${entry.hours}</td>
			                </tr>`
			            ).join("");

			            let row = `<tr>
			                <td rowspan="${summary.entries.length + 1}">${username}</td>
			                <td rowspan="${summary.entries.length + 1}">${period}</td>
			                <td rowspan="${summary.entries.length + 1}">${summary.totalHours}</td>
			                <td rowspan="${summary.entries.length + 1}">${summary.totalAbsences}</td>
			            </tr>`;

			            adminSummaryBody.innerHTML = row + chargeCodeRows;
			        })
			        .catch(error => console.error("Error fetching summary data:", error));
			}

	

			function handleApproval() {
				let approveBtn = document.getElementById("approveBtn");
				   approveBtn.disabled = true;
				   
				let adminSummaryBody = document.getElementById("adminSummaryBody");
						           
			    let dropdown = document.getElementById("employeeDropdown");
			    let selectedValue = dropdown.value;

			    if (!selectedValue) {
			        showAlert("Please select an employee before approving.", "danger");
					approveBtn.disabled = false;
			        return;
			    }

			    let [username, period] = selectedValue.split("  ");

			    fetch("/approve", {
			        method: "POST",
			        headers: { "Content-Type": "application/json" },
			        body: JSON.stringify({ username, period })
			    })
			    .then(response => response.json())
			    .then(result => {
			        showAlert(result.message, "success");
			        fetchPendingApprovals(); // Refresh list after approval

					
			        // ✅ Directly update the Employee button instead of fetching from DB
			        updateEmployeeButton(username, period, "Approved");
					
					adminSummaryBody.innerHTML = ""; // Clear previous data
				
			    })
			    .catch(error => console.error("Error approving timesheet:", error))
				.finally(() => approveBtn.disabled = false);
			}

			function handleIssue() {
				let adminSummaryBody = document.getElementById("adminSummaryBody");
			    let dropdown = document.getElementById("employeeDropdown");
			    let selectedValue = dropdown.value;
				
				let issueBtn = document.getElementById("issueBtn");
				    issueBtn.disabled = true;

			    if (!selectedValue) {
			        showAlert("Please select an employee before raising an issue.", "danger");
					issueBtn.disabled = false;
			        return;
			    }

			    let issueMessage = prompt("Enter the issue details:");
			    if (!issueMessage){ 
					issueBtn.disabled = false;
					return;
				} // If user cancels the prompt, exit
				

			    let [username, period] = selectedValue.split("  ");

			    fetch("/raiseIssue", {
			        method: "POST",
			        headers: { "Content-Type": "application/json" },
			        body: JSON.stringify({ username, period, issueMessage })
			    })
			    .then(response => response.json())
			    .then(result => {
			        showAlert(result.message, "success");
			        fetchPendingApprovals(); // Refresh pending approvals list

			        // ✅ Directly update the Employee button instead of fetching from DB
			        updateEmployeeButton(username, period, "Timesheet Issue");
					adminSummaryBody.innerHTML = ""; // Clear previous data
				
			    })
			    .catch(error => console.error("Error raising issue:", error))
				.finally(() => issueBtn.disabled = false); // Re-enable button
			}

			// ✅ Function to update the button state dynamically
			function updateEmployeeButton(username, period, status) {
			    localStorage.setItem(`approvalStatus_${username}_${period}`, status);
			}



function setActiveNavLink(activeLink) {
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
}

function createCard(icon, title, value) {
    return `
	<div class="dashboard-card">
	           <div class="card-icon">
	               <i class="${icon}"></i>
	           </div>
	           <div class="card-title">${title}</div>
	           <div class="card-value">${value}</div>
	       </div>
    `;
}

function attachFormListeners() {
    document.getElementById("addEmployeeBtn")?.addEventListener("click", () => showForm("employee"));
    document.getElementById("addDelegateBtn")?.addEventListener("click", () => showForm("delegates"));
    document.getElementById("addChargeCodeBtn")?.addEventListener("click", showDropdown);
	document.getElementById("addExpenseCodeBtn")?.addEventListener("click", () => showForm("Expense-code"));
}

function showDropdown() {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Select Code Type</label>
            <select class="form-control" id="codeType" onchange="handleCodeSelection()">
                <option value="">Select</option>
                <option value="charge-code">Charge Code</option>
                <option value="leave-code">Leave Code</option>
            </select>
        </div>
    `;
}

function handleCodeSelection() {
    const selectedValue = document.getElementById("codeType").value;
	if (selectedValue) {
	        showForm(selectedValue);
	    }
}



function showForm(type) {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = createForm(type);
	
	document.querySelector("#form-container form").addEventListener("submit", handleFormSubmit);
}

/*Function for sending data into backend (Java) */
function handleFormSubmit(event) {
    event.preventDefault(); 

    const form = event.target;
    const formData = new FormData(form);
    const jsonData = Object.fromEntries(formData.entries());

    fetch(form.action, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.text())
    .then(data => {
        showAlert(data, "success"); // Show success message
        hideForm(); // Hide the form after successful submission
    })
    .catch(error => {
        console.error("Error:", error);
    });
}


function hideForm() {
    document.getElementById("form-container").innerHTML = "";
}



/*Funtion for fetching Data form backend (Java)*/

/* Fetch Employee Data */
function fetchEmployeeData() {
    fetch("/getEmployees")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("employee-table-body");
            tableBody.innerHTML = "";
            data.forEach(employee => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.createdDate}</td>
                        <td>${employee['E-name']}</td>
                        <td>${employee['E-mail']}</td>
            
                        <td>${employee['E-desg']}</td>
             
                        <td>${employee.status}</td>
                        <td>
                            <button class="btn btn-${employee.status === 'active' ? 'danger' : 'success'} btn-sm" 
                                    onclick="employeeAction('${employee.id}', '${employee.status}')">
                                ${employee.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                `;
            });

			// Populate Assign Employee Dropdown
			const employeeListContainer = document.getElementById("employeeList");
			employeeListContainer.innerHTML = ""; // Clear existing list
			data.forEach(employee => {
			    // Only add active employees to the dropdown
			    if (employee.status === 'active') {
			        const li = document.createElement("li");
			        li.innerHTML = `<a class="dropdown-item" href="#" onclick="addEmployeetofield('${employee['E-name']}', '${employee['E-desg']}')">${employee['E-name']} - ${employee['E-desg']}</a>`;
			        employeeListContainer.appendChild(li);
			    }
			});
        })
        .catch(error => console.error("Error fetching employees:", error));
}

/* Function to handle employee status action */
function employeeAction(employeeId, currentStatus) {
    const confirmationMessage = document.getElementById("confirmationMessage");
    const confirmActionBtn = document.getElementById("confirmActionBtn");

    // Set the confirmation message based on the current status
    if (currentStatus === 'active') {
        confirmationMessage.innerText = "Do you want to deactivate this employee?";
    } else {
        confirmationMessage.innerText = "Do you want to activate this employee?";
    }

    // Show the confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();

    // When the user clicks "Yes", perform the action
    confirmActionBtn.onclick = function() {
        // Perform the employee status update based on the current status
        fetch(`/updateEmployeeStatus/${employeeId}`, {
            method: "PUT"
        })
        .then(response => {
            if (response.ok) {
                showAlert("Employee status updated successfully!", "success");
                fetchEmployeeData();  // Refresh the table after update
                confirmationModal.hide();  // Close the modal
            } else {
                showAlert("Failed to update employee status.", "danger");
                confirmationModal.hide();  // Close the modal
            }
        })
        .catch(error => {
            console.error("Error updating employee status:", error);
            confirmationModal.hide();  // Close the modal
        });
    };
}



/* Fetch Charge codes */
function fetchCodeDatas() {
    fetch("/getChargecodes") 
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("code-table-body");
            tableBody.innerHTML = ""; 
            data.forEach(code => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${code.id}</td>
                        <td>${code.codeType}</td>
                        <td>${code.code}</td>
                        <td>${code.clientName}</td>
                        <td>${code.description}</td>
                        <td>${code.projectType}</td>
                        <td>${code.startDate}</td>
                        <td>${code.country}</td>
                        <td>
                            <div class="dropdown">
                                <button class="btn btn-success " type="button" id="dropdownMenu${code.id}" data-bs-toggle="dropdown" aria-expanded="false">
                                    &#8942; <!-- Vertical 3 dots -->
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenu${code.id}">
                                    <li><a class="dropdown-item" href="#" onclick="completeChargeCode('${code.id}')">Complete</a></li>
                                  <li><a class="dropdown-item" href="#" onclick="openAssignModal('${code.id}', '${code.code}', '${code.description}')">Assign to</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching Charge code:", error));
}

/* Function to handle Complete action */
function completeChargeCode(id) {
    console.log("Charge Code " + id + " marked as Complete");
    // Add backend API call here if needed
}

let selectedEmployees = [];

// Update openAssignModal to accept charge code and description
function openAssignModal(codeId, chargeCode, description) {
    selectedEmployees = [];
    document.getElementById("selectedEmployeesContainer").innerHTML = "";

    // Set Charge Code and Description in Modal
    document.getElementById("chargeCodeDisplay").innerText = chargeCode;
    document.getElementById("chargeCodeDescription").innerText = description;  // Make sure you add this in the modal's HTML

    // Show Modal
    const modal = new bootstrap.Modal(document.getElementById("assignModal"));
    modal.show();
}

function filterEmployees() {
    let searchValue = document.getElementById("employeeSearch").value.toLowerCase();
    let employees = document.querySelectorAll("#employeeList li a");

    employees.forEach(employee => {
        let text = employee.innerText.toLowerCase();
        employee.parentElement.style.display = text.includes(searchValue) ? "block" : "none";
    });
}

function addEmployeetofield(name, role) {
    // Only use employee name, not the role
    if (!selectedEmployees.includes(name)) {
        selectedEmployees.push(name);
        updateSelectedEmployees();
    }
}

function updateSelectedEmployees() {
    let container = document.getElementById("selectedEmployeesContainer");
    container.innerHTML = "";

    selectedEmployees.forEach(employee => {
        let employeeDiv = document.createElement("div");
        employeeDiv.className = "d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1";
        
        employeeDiv.innerHTML = `
            <span>${employee}</span>
            <button class="btn btn-danger btn-sm" onclick="removeEmployee('${employee}')">&times;</button>
        `;

        container.appendChild(employeeDiv);
    });
}

function removeEmployee(employeeName) {
    selectedEmployees = selectedEmployees.filter(emp => emp !== employeeName);
    updateSelectedEmployees();
}

function assignEmployees() {
    if (selectedEmployees.length === 0) {
        showAlert("Please select at least one employee.", "danger");
        return;
    }

    
    const chargeCode = document.getElementById("chargeCodeDisplay").innerText;
    const description = document.getElementById("chargeCodeDescription").innerText;

    // Set the charge code and description inside the confirmation modal
    document.getElementById("confirmationChargeCode").innerText = chargeCode;
    document.getElementById("confirmationDescription").innerText = description;


    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal2'));
    confirmationModal.show();

  
    document.getElementById("confirmAssignment").onclick = function() {
        // Proceed with the assignment logic if the user clicks "Yes, Assign"
        
        const assignmentData = {
            chargeCode: chargeCode,
            description: description,
            employees: selectedEmployees  // Send only names
        };

        // Send data to Spring Boot backend
        fetch("/assignEmployees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(assignmentData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert("Employees Assigned and Email Sent!", "success");
            } else {
                showAlert("Error in assignment: " + data.message, "danger");
            }
        })
        .catch(error => {
            console.error("Error sending data to backend:", error);
            showAlert("An error occurred.", "danger");
        });

        // Hide modal
        confirmationModal.hide();
        
        // Close the current modal (if open)
        bootstrap.Modal.getInstance(document.getElementById("assignModal")).hide();
    };

    // If the user clicks "Cancel", just close the confirmation modal
    document.querySelector('.btn-secondary').onclick = function() {
        confirmationModal.hide();
    };
}




/*Fetch Expense code*/
function fetchExpense() {
    fetch("/getExpensecode") 
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("Expense-table-body");
            tableBody.innerHTML = ""; 
            data.forEach(ExCode => {
                tableBody.innerHTML += `
				<tr>
				    <td>${ExCode.id}</td>
				    <td>${ExCode["Ex-code"]}</td>  <!-- Use correct JSON key -->
				     <td>${ExCode["Ex-type"]}</td>  <!-- Use correct JSON key -->
				      <td>
				      <button class="btn btn-success btn-sm" onclick="editExpense('${ExCode.id}')">Edit</button>
				   </td>
				                 
                `;
            });
        })
        .catch(error => console.error("Error fetching Expense Details:", error));
}

/*Fetch delegator details*/
function fetchDelegator() {
    fetch("/getDelegator") 
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("Delegate-table-body");
            tableBody.innerHTML = ""; 
            data.forEach(Delegator => {
                tableBody.innerHTML += `
				<tr>
				    <td>${Delegator.id}</td>
				    <td>${Delegator["D-name"]}</td>  <!-- Use correct JSON key -->
				     <td>${Delegator["SA-email"]}</td>  <!-- Use correct JSON key -->
				      <td>
				      <button class="btn btn-success btn-sm" onclick="editExpense('${Delegator.id}')">Edit</button>
				   </td>
				                 
                `;
            });
        })
        .catch(error => console.error("Error fetching Delegator Details:", error));
}


/*Form creation for all the options*/
function createForm(type) {
    const forms = {
        "employee": ` 
            <div class="card p-3 mb-3">
                <h4>Add Employee</h4>
                <form action="/addEmployee" method="POST" autocomplete="off">
                    ${inputField("Name", "text", "E-name")}
					${inputField("Email", "email", "E-mail")}
					${inputField("Password", "password", "E-pass")}
					${inputField("Designation", "text", "E-desg")}
                    ${selectField("Role", "E-role", ["Admin","Employee"])}
                    ${formButtons()}
                </form>
            </div>
        `,
        "delegates": `
		<div class="card p-3 mb-3">
		                <h4>Add Delegate</h4>
						<form action="/addDelegate" method="POST">
						<div class="mb-3">
						               <label class="form-label">Delegates Name</label>
						               <select id="delegateName" name="D-name" class="form-control" onchange="updateDelegateEmail()" required>
						                   <option value="">Select Employee</option>
						               </select>
						           </div>

						           <div class="mb-3">
						               <label class="form-label">Email</label>
						               <input type="email" id="delegateEmail" name="SA-email" class="form-control" required >
						           </div>
						           
						            ${formButtons()}
						        </form>
		            </div>
        `,
        "charge-code": `
            <div class="card p-3 mb-3">
                <h4>Add Charge Code</h4>
                <form action="/addChargeCode" method="POST">  
				${selectField("Code Type", "codeType", ["Charge code"])}        
				${selectField("Project Type", "projectType", ["External","Internal"])}
				${inputField("Client/Organization", "text", "clientName")}
				${inputField("Onboard/Start date", "date", "startDate")}
				${inputField("Country/Region", "text", "country")}
				${textareaField("Description", "description")}
				${inputField("Charge Code", "text", "code", "charge-code")}
				${formButtons()}
                </form>
            </div>
        `,
        "leave-code": `
            <div class="card p-3 mb-3">
                <h4>Add Leave Code</h4>
                <form action="/addChargeCode" method="POST">
				    ${selectField("Code Type", "codeType", ["Leave code"])} 
                    ${inputField("Leave Code", "text", "code", "leave-code")}
					${inputField("Leave Name", "text", "description")}
                    ${formButtons()}
                </form>
            </div>
        `
		,
		"Expense-code": `
		   <div class="card p-3 mb-3">
		        <h4>Add Expense Code</h4>
		        <form action="/addExpenseCode" method="POST">
		            ${inputField("Expense Code", "text", "Ex-code")}
					${selectField("Expense Name", "Ex-type", ["Select", "Network Expense", "Travel"])}
		            ${formButtons()}
		        </form>
		   </div>
		`
    };
	setTimeout(fetchEmfordeg, 0);

    return forms[type] || "<p>Form Not Found</p>";
}


/* Function for fetching User detials in the db for making delegate*/
function fetchEmfordeg() {
	fetch("/getEmployeedata")
	       .then(response => response.json())
	       .then(data => {
	           const dropdown = document.getElementById("delegateName");
	           if (!dropdown) return;

	           dropdown.innerHTML = '<option value="">Select Employee</option>'; // Reset options

	           data.forEach(employee => {
	               let option = document.createElement("option");
	               option.value = employee.name;  // Store the actual name
	               option.textContent = employee.name; // Show name
	               option.dataset.email = employee.email; // Store email in dataset
	               dropdown.appendChild(option);
	           });
	       })
	       .catch(error => console.error("Error fetching employee data:", error));
	}
	
function updateDelegateEmail() {
	    const dropdown = document.getElementById("delegateName");
	    const emailField = document.getElementById("delegateEmail");

	    const selectedOption = dropdown.options[dropdown.selectedIndex]; // Get selected option
	    emailField.value = selectedOption.dataset.email || ""; // Set email dynamically
	}

	
/*External charge code generator*/
function codeGenerate() {
	    const clientNameInput = document.getElementById("clientName");
	    const onboardDateInput = document.getElementById("startDate");
	    const chargeCodeInput = document.getElementById("code");
	    
	    if (!clientNameInput || !onboardDateInput || !chargeCodeInput) {
	        console.error("Missing input fields for Charge Code generation.");
	        return;
	    }
	    
	    if (chargeCodeInput.value) {
	        return; 
	    }
	    
	    const clientName = clientNameInput.value.trim().replace(/\s+/g, "").toUpperCase();
	    const onboardDate = onboardDateInput.value.replace(/-/g, "");
	    
	    if (!clientName || !onboardDate) {
	        showAlert("Please enter both Client Name and Onboard Date to generate the Charge Code.", "danger");
	        return;
	    }
	    
	    // Get the next available last 3 digits from the backend
	    getNextCodeIncrement(clientName, onboardDate, chargeCodeInput);
	}

	function getNextCodeIncrement(clientName, onboardDate, chargeCodeInput) {
	    fetch(`/getNextCodeIncrement`)
	        .then(response => response.json())
	        .then(data => {
	            const lastIncrement = data;
	            const incrementedValue = String(lastIncrement).padStart(3, '0');
	            const generatedCode = `${clientName}${onboardDate}td${incrementedValue}`;
	            
	            chargeCodeInput.value = generatedCode;
	            chargeCodeInput.setAttribute("readonly", true);
	            chargeCodeInput.onkeydown = function(event) { event.preventDefault(); };
	        })
	        .catch(error => {
	            console.error("Error generating charge code:", error);
	        });
	}


	/*Temp password Generator*/
function generatePassword(inputId) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomPassword = "";
    for (let i = 0; i < 8; i++) {
        randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
	const inputField = document.getElementById(inputId);
	    inputField.value = randomPassword;
	    inputField.setAttribute("readonly", true); 
	    inputField.onkeydown = function(event) { event.preventDefault(); };
}

/*Input field function*/
function inputField(label, type, name, formType = "") {
	
    const isPasswordField = name === "E-pass" || name === "SA-pass";
    

	const isChargeCodeField = name === "code" && formType === "charge-code";
    
    return `
        <div class="mb-3">
            <label class="form-label">${label}</label>
            <input type="${type}" class="form-control" name="${name}" id="${name}" required>
            ${isPasswordField ? `<button class="btn btn-outline-primary" type="button" onclick="generatePassword('${name}')" style="margin-top: 10px;">Generate</button>` : ""}
            ${isChargeCodeField ? `<button class="btn btn-outline-primary" type="button" onclick="codeGenerate()" style="margin-top: 10px;">Generate Charge Code</button>` : ""}
        </div>
    `;
}

/*Select field function*/
function selectField(label, name, options) {
    return `
        <div class="mb-3">
            <label class="form-label">${label}</label>
            <select class="form-control" name="${name}">
                ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
        </div>
    `;
}

/*Text area field function*/
function textareaField(label, name) {
    return `
        <div class="mb-3">
            <label class="form-label">${label}</label>
            <textarea class="form-control" name="${name}" required></textarea>
        </div>
    `;
}

/*function for buttons*/
function formButtons() {
    return `
        <button class="btn btn-success" type="submit">Save</button>
        <button class="btn btn-secondary" type="button" onclick="hideForm()">Cancel</button>
    `;
}



function hideForm() {
    document.getElementById("form-container").innerHTML = "";
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("show");
    }
}

// Apply it when any menu item is clicked
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function () {
        closeSidebarOnMobile();
    });
});





	