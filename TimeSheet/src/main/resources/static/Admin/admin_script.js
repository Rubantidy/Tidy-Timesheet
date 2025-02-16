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

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
}

function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("show");
    }
}

function showContent(section) {
    const title = document.getElementById("content-title");
    const contentBox = document.getElementById("content-box");

    const sections = {
        "dashboard": `
            <div class="card-box">
                ${createCard("bi-people", "Total Users", "120")}
                ${createCard("bi-person-check", "Admins", "15")}
                ${createCard("bi-credit-card", "Charge Codes", "35")}
                ${createCard("bi-calendar-check", "Leave Codes", "50")}
				${createCard("bi bi-receipt", "Expense Codes", "50")}
            </div>
        `,
		"manage-user": `<button class="btn btn-primary mb-3" id="addEmployeeBtn">Add Employee</button><div id="form-container"></div>
		     <div id="form-container"></div>
		           <h4>Employee List</h4>
		           <table class="table table-striped">
		               <thead>
		                   <tr>
						   	  <th>ID</th>
						   	   <th>Registered Date</th>
		                       <th>Name</th>
		                       <th>Email</th>
							   <th>Password</th>
		                       <th>Role</th>
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
		
		
}



function setActiveNavLink(activeLink) {
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
}

function createCard(icon, title, value) {
    return `
        <div class="card">
            <i class="bi ${icon}"></i>
            <h3>${title}</h3>
            <p>${value}</p>
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
        alert(data); // Show success message
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

/*Fetch Employee Data*/
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
											<td>${employee['E-pass']}</td>
					                        <td>${employee['E-role']}</td>
					                        
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="deleteEmployee('${employee.id}')">Disable</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching employees:", error));
}

/*Fetch Charge codes*/
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
                            <button class="btn btn-success btn-sm" onclick="finishchargecode('${code.id}')">Finish</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching Charge code:", error));
}

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


function createForm(type) {
    const forms = {
        "employee": ` 
            <div class="card p-3 mb-3">
                <h4>Add Employee</h4>
                <form action="/addEmployee" method="POST" autocomplete="off">
                    ${inputField("Employee Name", "text", "E-name")}
					${inputField("Employee Email", "email", "E-mail")}
					${inputField("Employee Password", "text", "E-pass")}
                    ${selectField("Role", "E-role", ["Admin", "Team Lead","Employee"])}
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

/*External code generator*/
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
        alert("Please enter both Client Name and Onboard Date to generate the Charge Code.");
        return;
    }
    
    const codeKey = `${clientName}${onboardDate}`;
    let lastIncrement = parseInt(localStorage.getItem(codeKey)) || 1;
    const incrementedValue = String(lastIncrement).padStart(3, '0');
    
    const generatedCode = `${clientName}${onboardDate}td${incrementedValue}`;
    chargeCodeInput.value = generatedCode;
    chargeCodeInput.setAttribute("readonly", true);
    chargeCodeInput.onkeydown = function(event) { event.preventDefault(); };
    
    lastIncrement++;
    localStorage.setItem(codeKey, lastIncrement);
}


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

function textareaField(label, name) {
    return `
        <div class="mb-3">
            <label class="form-label">${label}</label>
            <textarea class="form-control" name="${name}" required></textarea>
        </div>
    `;
}

function formButtons() {
    return `
        <button class="btn btn-success" type="submit">Save</button>
        <button class="btn btn-secondary" type="button" onclick="hideForm()">Cancel</button>
    `;
}

function generatebtn() {
	return `
	        <button class="btn btn-success" type="button">Generate Password</button>
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

