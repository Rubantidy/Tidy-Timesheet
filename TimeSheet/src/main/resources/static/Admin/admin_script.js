


document.addEventListener("DOMContentLoaded", function() {
	    const userName = sessionStorage.getItem("userName");

	    // Redirect to login page if user session is null
	    if (userName === null) {
	        window.location.href = "/login";
	    }
	});

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

    // Set a fixed dismiss duration for all toasts
    const toast = new bootstrap.Toast(alertToast, { delay: 3000 }); // 4 seconds for all
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

       // Clear any session or sessionStorage data if needed
       sessionStorage.removeItem('userName'); // Example of clearing the user name stored in sessionStorage

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
		<div>
		    <button class="btn btn-info" id="showEmployeesBtn" onclick="listAssignedEmployees()">Show Assigned Employees</button>
		</div>
		<br>

		<!-- Search Box -->
		<input type="text" id="searchAssignedEmployee" class="form-control mb-2" 
		       placeholder="Search Assigned Employee..." style="display: none;">

		<!-- Scrollable Assigned Employees Table -->
		<div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; display: none;" id="assignedEmployeeTableContainer">
		    <table id="assignedEmployeeTable" class="table table-bordered table-striped">
		        <thead class="table-dark">
		            <tr>
		                <th>Employee Name</th>
		                <th>Charge Code</th>
		                <th>Description</th>
		            </tr>
		        </thead>
		        <tbody id="assignedEmployeeTableBody">
		            <!-- Rows will be added dynamically -->
		        </tbody>
		    </table>
		</div> <br>


		<div class="d-flex gap-3">
		    <div class="card text-center bg-warning text-white" style="cursor: pointer;" onclick="showSection('pending')">
		        <div class="card-body">
		            <h5 class="card-title">Pending</h5>
		            <h3 id="pendingCount">0</h3>
		        </div>
		    </div>

		    <div class="card text-center bg-success text-white" style="cursor: pointer;" onclick="showSection('approved')">
		        <div class="card-body">
		            <h5 class="card-title">Approved</h5>
		            <h3 id="approvedCount">0</h3>
		        </div>
		    </div>

		    <div class="card text-center bg-danger text-white" style="cursor: pointer;" onclick="showSection('issue')">
		        <div class="card-body">
		            <h5 class="card-title">Issue</h5>
		            <h3 id="issueCount">0</h3>
		        </div>
		    </div>
		</div> <br> <br>

		<!-- Sections (Initially Hidden) -->
		<div id="pendingSection" style="display: none;">
		    <h3>Pending Approvals</h3>
		    <select id="employeeDropdown1" class="form-select mb-3">
		        <option value="">Select Employee</option>
		    </select>
		    <div id="pendingSummaryContent" class="border p-3 bg-light">
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
		            <tbody id="pendingSummaryBody">
		                <!-- Data will be inserted here dynamically -->
		            </tbody>
		        </table>
		    </div>
		    <div class="d-flex gap-3 mt-3">
		        <button id="approveBtn" class="btn btn-success" onclick="handleApproval()">✅ Approve</button>
		        <button id="issueBtn" class="btn btn-danger" onclick="handleIssue()">🛑 Reject</button>
		    </div>
		</div>

		<div id="approvedSection" style="display: none;">
		    <h3>Approved List</h3>
		    <select id="employeeDropdown2" class="form-select mb-3">
		        <option value="">Select Employee</option>
		    </select>
		    <div id="approvedSummaryContent" class="border p-3 bg-light">
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
		            <tbody id="approvedSummaryBody">
		                <!-- Data will be inserted here dynamically -->
		            </tbody>
		        </table>
		    </div>
		</div>

		<div id="issueSection" style="display: none;">
		    <h3>Issued List</h3>
		    <select id="employeeDropdown3" class="form-select mb-3">
		        <option value="">Select Employee</option>
		    </select>
		    <div id="issueSummaryContent" class="border p-3 bg-light">
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
		            <tbody id="issueSummaryBody">
		                <!-- Data will be inserted here dynamically -->
		            </tbody>
		        </table>
		    </div>
		</div>

		       `,
		"manage-user": `<button class="btn btn-info mb-3" id="addEmployeeBtn">Add Users</button><div id="form-container"></div>
		     <div id="form-container"></div>
		         
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
		   "delegates": `<button class="btn btn-info mb-3" id="addDelegateBtn">Add Delegates</button><div id="form-container"></div>
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
				
				
			
	        }) 
	        .catch(error => console.error("Error fetching data for dashboard:", error));
			
			    }
				
				else if(section === "approval") {
						fetchPendingApprovals();
						fetchApprovalslist();
						fetchIssuelist();
						fetchCounts();
					}
						
				}
						
				function listAssignedEmployees() {
				    const searchInput = document.getElementById("searchAssignedEmployee");
				    const employeeTableBody = document.getElementById("assignedEmployeeTableBody");
				    const tableContainer = document.getElementById("assignedEmployeeTableContainer");

				    // ✅ Toggle visibility on button click
				    if (tableContainer.style.display === "block") {
				        searchInput.style.display = "none";
				        tableContainer.style.display = "none";
				        return; // ✅ Exit function if hiding the table
				    }

				    fetch("/assigned-employees") // ✅ Fetching assigned employees
				        .then(response => response.json())
				        .then(data => {
				            employeeTableBody.innerHTML = ""; // ✅ Clear previous table rows

				            data.forEach(employee => {
				                const row = document.createElement("tr");

				                row.innerHTML = `
				                    <td>${employee.employeeName}</td>
				                    <td>${employee.chargeCode}</td>
				                    <td>${employee.description}</td>
				                `;

				                employeeTableBody.appendChild(row);
				            });

				            // ✅ Show the search input and table container
				            searchInput.style.display = "block";
				            tableContainer.style.display = "block";
				        })
				        .catch(error => console.error("❌ Error fetching employees:", error));

				    // ✅ Search Functionality
				    searchInput.addEventListener("keyup", function () {
				        const filter = searchInput.value.toLowerCase();
				        const rows = employeeTableBody.getElementsByTagName("tr");

				        Array.from(rows).forEach(row => {
				            const text = row.textContent.toLowerCase();
				            row.style.display = text.includes(filter) ? "" : "none";
				        });
				    });
				}





					
							function showSection(section) {
							    document.getElementById("pendingSection").style.display = "none";
							    document.getElementById("approvedSection").style.display = "none";
							    document.getElementById("issueSection").style.display = "none";

							    if (section === "pending") {
							        document.getElementById("pendingSection").style.display = "block";
							    } else if (section === "approved") {
							        document.getElementById("approvedSection").style.display = "block";
							    } else if (section === "issue") {
							        document.getElementById("issueSection").style.display = "block";
							    }
							}

							document.addEventListener("DOMContentLoaded", function () {
							
							    
							    // Ensure the dropdowns exist before calling the functions
							    if (document.getElementById("employeeDropdown1") &&
							        document.getElementById("employeeDropdown2") &&
							        document.getElementById("employeeDropdown3") &&
									document.getElementById("issueCount") &&
									document.getElementById("approvedCount") &&
									document.getElementById("pendingCount")
								
								
								) {
							        
							        fetchPendingApprovals();
							        fetchApprovalslist();
							        fetchIssuelist();
							        fetchCounts();
							    } 
							});


							function fetchCounts() {
							    fetch('/counts')
							        .then(response => response.json())
							        .then(data => {
							         

							            let pendingCountElem = document.getElementById("pendingCount");
							            let approvedCountElem = document.getElementById("approvedCount");
							            let issueCountElem = document.getElementById("issueCount");


							            // Update values
							            pendingCountElem.textContent = data.pending ?? 0;
							            approvedCountElem.textContent = data.approved ?? 0;
							            issueCountElem.textContent = data.issue ?? 0;
							        })
							        .catch(error => console.error("❌ Error fetching counts:", error));
							}


							// ✅ Fetch pending approvals and populate dropdown
							function fetchPendingApprovals() {
							    fetch("/getPendingApprovals")
							        .then(response => response.json())
							        .then(data => populateDropdown("employeeDropdown1", data, "Pending"))
							        .catch(error => console.error("Error fetching pending approvals:", error));
							}

							// ✅ Fetch approved list and populate dropdown
							function fetchApprovalslist() {
							    fetch("/getApprovalslist")
							        .then(response => response.json())
							        .then(data => populateDropdown("employeeDropdown2", data, "Approved"))
							        .catch(error => console.error("Error fetching approvals list:", error));
							}

							// ✅ Fetch issue list and populate dropdown
							function fetchIssuelist() {
							    fetch("/getIssuelist")
							        .then(response => response.json())
							        .then(data => populateDropdown("employeeDropdown3", data, "Issue"))
							        .catch(error => console.error("Error fetching issue list:", error));
							}

							function populateDropdown(dropdownId, data, status) {
							    let dropdown = document.getElementById(dropdownId);
							    
							    // 🔴 Fix: Check if dropdown exists before modifying it
							    if (!dropdown) {
							        console.error(`Error: Dropdown with ID '${dropdownId}' not found.`);
							        return;
							    }

							    dropdown.innerHTML = '<option value="">Select Employee</option>'; // Reset dropdown

							    if (!Array.isArray(data)) {
							        console.error("Error: Data is not an array", data);
							        return;
							    }

							    data.forEach(entry => {
							        let option = document.createElement("option");
							        option.value = `${entry.username}  ${entry.period}`;
							        option.textContent = `${entry.username} - ${entry.period}`;
							        dropdown.appendChild(option);
							    });

							    // ✅ Add event listener for dropdown selection
							    dropdown.addEventListener("change", function () {
							        let selectedOption = this.value;
							        if (!selectedOption) return;

							        let [username, period] = selectedOption.split("  ");
							        sessionStorage.setItem("SummaryEmployee", username);

							        fetchEmployeeSummary(username, period, status);
							    });
							}

							// ✅ Fetch employee summary based on selection
							function fetchEmployeeSummary(username, period, status) {
							    console.log(`Fetching summary for ${username} - ${period} [${status}]`);

							    let url = `/getSummary?username=${encodeURIComponent(username)}&period=${encodeURIComponent(period)}&status=${encodeURIComponent(status)}`;
							    
							    fetch(url)
							        .then(response => response.json())
							        .then(summary => updateSummaryTable(summary, username, period, status))
							        .catch(error => console.error("Error fetching summary data:", error));
							}

							// ✅ Update the correct table with fetched data
							function updateSummaryTable(summary, username, period, status) {
							    let tableBody = getTableBodyByStatus(status);
							    tableBody.innerHTML = ""; // Clear previous data

							    if (!summary || Object.keys(summary).length === 0) {
							        tableBody.innerHTML = `<tr><td colspan="5">No data available</td></tr>`;
							        return;
							    }

							    let chargeCodeRows = summary.entries.map(entry =>
							        `<tr>
							            <td>${entry.chargeCode}</td>
							            <td>${entry.hours}</td>
							        </tr>`
							    ).join("");

							    let row = `
							        <tr>
							            <td rowspan="${summary.entries.length + 1}">${username}</td>
							            <td rowspan="${summary.entries.length + 1}">${period}</td>
							            <td rowspan="${summary.entries.length + 1}">${summary.totalHours}</td>
							            <td rowspan="${summary.entries.length + 1}">${summary.totalAbsences}</td>
							        </tr>`;

							    tableBody.innerHTML = row + chargeCodeRows;
							}

							// ✅ Helper function to get the correct table body
							function getTableBodyByStatus(status) {
							    if (status === "Approved") return document.getElementById("approvedSummaryBody");
							    if (status === "Issue") return document.getElementById("issueSummaryBody");
							    return document.getElementById("pendingSummaryBody"); // Default to pending
							}



			let selectedUsername, selectedPeriod; // Store selected values

			function handleApproval() {
			    let dropdown = document.getElementById("employeeDropdown1");
			    let selectedValue = dropdown.value;

				
				
			    if (!selectedValue) {
			        showAlert("Please select an employee before approving.", "danger");
			        return;
			    }

			    // ✅ Store selected values globally
			    [selectedUsername, selectedPeriod] = selectedValue.split("  ");

			    // ✅ Update modal message dynamically
			    document.getElementById("approvalMessage").innerText = 
			        `Are you sure you want to approve ${selectedUsername}'s timesheet for ${selectedPeriod}?`;

			    // ✅ Show the modal
			    let approvalModal = new bootstrap.Modal(document.getElementById("approvalConfirmModal"));
			    approvalModal.show();
			}

			// ✅ Handle Approval after Confirming in the Modal
			document.getElementById("confirmApprovalBtn").addEventListener("click", function () {
			    let approveBtn = document.getElementById("approveBtn");
			    approveBtn.disabled = true;

			    let adminSummaryBody = document.getElementById("pendingSummaryBody");

			    fetch("/approve", {
			        method: "POST",
			        headers: { "Content-Type": "application/json" },
			        body: JSON.stringify({ username: selectedUsername, period: selectedPeriod })
			    })
			    .then(response => response.json())
			    .then(result => {
			        showAlert(result.message, "success");
			        fetchPendingApprovals(); // Refresh list after approval

			        // ✅ Update Employee button dynamically
			        updateEmployeeButton(selectedUsername, selectedPeriod, "Approved");

			        adminSummaryBody.innerHTML = ""; // Clear previous data
			    })
			    .catch(error => console.error("Error approving timesheet:", error))
			    .finally(() => approveBtn.disabled = false);

			    // ✅ Close the modal after confirmation
			    let approvalModal = bootstrap.Modal.getInstance(document.getElementById("approvalConfirmModal"));
			    approvalModal.hide();
			});

			

			function handleIssue() {
			    let issueBtn = document.getElementById("issueBtn");
			    let dropdown = document.getElementById("employeeDropdown1");
			    let selectedValue = dropdown.value;

			  

			    if (!selectedValue) {
			        showAlert("Please select an employee before raising an issue.", "danger");
			        issueBtn.disabled = false;
			        return;
			    }

			    // Store selected username & period in a global variable for later use
			    [selectedUsername, selectedPeriod] = selectedValue.split("  ");

			    // Show the issue message modal
			    let issueModal = new bootstrap.Modal(document.getElementById("issueMessageModal"));
			    issueModal.show();
			}

			// Handle Issue Submission from Modal
			document.getElementById("confirmIssueBtn").addEventListener("click", function () {
			    let issueMessage = document.getElementById("issueMessageInput").value.trim();
			    let issueError = document.getElementById("issueError");

			    if (!issueMessage) {
			        issueError.style.display = "block";
			        return;
			    }
			    issueError.style.display = "none";

			    // Close modal
			    let issueModal = bootstrap.Modal.getInstance(document.getElementById("issueMessageModal"));
			    issueModal.hide();

			    // Call the API to raise an issue
			    fetch("/raiseIssue", {
			        method: "POST",
			        headers: { "Content-Type": "application/json" },
			        body: JSON.stringify({ username: selectedUsername, period: selectedPeriod, issueMessage })
			    })
			    .then(response => response.json())
			    .then(result => {
			        showAlert(result.message, "success");
			        fetchPendingApprovals(); // Refresh pending approvals list
			        updateEmployeeButton(selectedUsername, selectedPeriod, "Timesheet Issue");
			        document.getElementById("pendingSummaryBody").innerHTML = ""; // Clear previous data
			    })
			    .catch(error => console.error("Error raising issue:", error))
			    .finally(() => document.getElementById("issueBtn").disabled = false);
			});


			// ✅ Function to update the button state dynamically
			function updateEmployeeButton(username, period, status) {
			    sessionStorage.setItem(`approvalStatus_${username}_${period}`, status);
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
	showLoader();
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
        showAlert(data, "success");
		
        hideForm(); 
    })
    .catch(error => {
        console.error("Error:", error);
    })
	.finally(() => hideLoader());
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




/* Fetch Charge Codes */
function fetchCodeDatas() {
    fetch("/getChargecodes") 
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("code-table-body");
            tableBody.innerHTML = ""; 
            
            data.forEach(code => {
                // Set row color for "Complete" status
                let rowClass = code.status.toLowerCase() === "complete" ? 'class="table-success"' : '';

                // Show dropdown only if it's a Charge Code & Status is "Progress"
                let dropdownMenu = (code.codeType.toLowerCase() === "charge code" && code.status.toLowerCase() === "progress") ? `
                    <div class="dropdown">
                        <button class="btn btn-success" type="button" id="dropdownMenu${code.id}" data-bs-toggle="dropdown" aria-expanded="false">
                            &#8942; <!-- Vertical 3 dots -->
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenu${code.id}">
                            <li><a class="dropdown-item" href="#" onclick="completeChargeCode('${code.id}')">Complete</a></li>
                            <li><a class="dropdown-item" href="#" onclick="openAssignModal('${code.id}', '${code.code}', '${code.description}')">Assign to</a></li>
                        </ul>
                    </div>` : '';

                tableBody.innerHTML += `
                    <tr ${rowClass}>
                        <td>${code.id}</td>
                        <td>${code.codeType}</td>
                        <td>${code.code}</td>
                        <td>${code.clientName}</td>
                        <td>${code.description}</td>
                        <td>${code.projectType}</td>
                        <td>${code.startDate}</td>
                        <td>${code.country}</td>
                        <td>${dropdownMenu}</td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching Charge codes:", error));
}



let selectedChargeCodeId = null; // Store selected charge code ID

/* Function to show modal instead of confirm */
function completeChargeCode(id) {
    selectedChargeCodeId = id; // Store the ID for confirmation
    var completeModal = new bootstrap.Modal(document.getElementById("completeModal"));
    completeModal.show(); // Show the modal
}

/* Handle modal confirmation button click */
document.getElementById("confirmCompleteBtn").addEventListener("click", function() {
    if (selectedChargeCodeId) {
        fetch(`/completeChargeCode/${selectedChargeCodeId}`, {
            method: "PUT"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert("Charge Code marked as Complete!", "success");
                fetchCodeDatas(); // Refresh table
            } else {
                showAlert("Error: " + data.message, "danger");
            }
        })
        .catch(error => {
            console.error("Error updating charge code status:", error);
            showAlert("An error occurred while completing the charge code.", "danger");
        })
        .finally(() => {
            var completeModal = bootstrap.Modal.getInstance(document.getElementById("completeModal"));
            completeModal.hide(); // Close modal after action
        });
    }
});



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
		
		showLoader();
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
        })

		.finally(() => {
		           hideLoader(); // ✅ Hide loader when action completes
		           confirmationModal.hide(); // Hide confirmation modal
		           bootstrap.Modal.getInstance(document.getElementById("assignModal")).hide(); // Hide assign modal
		       });
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





	