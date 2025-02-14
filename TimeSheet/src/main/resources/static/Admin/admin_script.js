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
		   "delegates": `<button class="btn btn-warning mb-3" id="addDelegateBtn">Add Delegates</button><div id="form-container"></div>`,
		   "charge-code": `<button class="btn btn-info mb-3" id="addChargeCodeBtn">Add Code</button><div id="form-container"></div> `
    };

    title.innerText = section.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
    contentBox.innerHTML = sections[section] || "<p>Content Not Found</p>";

    attachFormListeners();
	
	if (section === "manage-user") {
	        fetchEmployeeData();
	    }
		
		if (section === "charge-code") {
		       
		       document.getElementById("chargeCodesBtn").addEventListener("click", function () {
				fetchChargeCodes();
		           
		       });
		       
		       document.getElementById("expenseCodesBtn").addEventListener("click", function () {
		           
		       });
		   }
}


/*
function fetchChargeCodes() {
    fetch("/getChargecodes") 
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Data:", data); // Debugging

            const tableBody = document.getElementById("code-table-body");
            tableBody.innerHTML = ""; 
            
            data.forEach(code => {
                console.log("Processing Code:", code); // Debugging each row

                tableBody.innerHTML += `
                    <tr>
                        <td>${code.id}</td>
                        <td>${code["C-type"]}</td>
                        <td>${code["C-clientname"]}</td>
                        <td>${code["C-code"]}</td>
                        <td>${code["L-name"]}</td>
                        <td>${code["L-code"]}</td>
                        <td>${code["P-type"]}</td>
                        <td>${code["C-onboard"]}</td>
                        <td>${code["C-country"]}</td>
                        <td>${code["C-desc"]}</td>                        
                        <td>
                            <button class="btn btn-success btn-sm" onclick="deleteChargeCode(${code.id})">Finished</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching charge codes:", error));
} 


function deleteChargeCode(id) {
    
    console.log(`Delete charge code with ID: ${id}`);
} */


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
                <option value="Expense-code">Expense Code</option>
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

/*
function handleChargeTypeSelection() {
    const selectedType = document.getElementById("chargeType").value;
    const chargeFormContainer = document.getElementById("chargeFormContainer");

    if (selectedType === "external") {
        chargeFormContainer.innerHTML = createForm("charge-code");
    } else if (selectedType === "internal") {
        chargeFormContainer.innerHTML = createForm("internal-charge-code");
    }
}*/

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
                        <td>${employee.e_Name}</td>
                        <td>${employee.e_Mail}</td>
						<td>${employee.e_Password}</td>
                        <td>${employee.e_Role}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" onclick="deleteEmployee('${employee.id}')">Disable</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching employees:", error));
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
                    ${inputField("Delegates Name", "text", "De-name")}
                    ${inputField("Email", "email", "SA-email")}
					${inputField("Password", "text", "SA-pass")}
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
				${inputField("Charge Code", "text", "code")}
				${formButtons()}
                </form>
            </div>
        `,
        "leave-code": `
            <div class="card p-3 mb-3">
                <h4>Add Leave Code</h4>
                <form action="/addChargeCode" method="POST">
				    ${selectField("Code Type", "codeType", ["Leave code"])} 
                    ${inputField("Leave Code", "text", "code")}
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

    return forms[type] || "<p>Form Not Found</p>";
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

function inputField(label, type, name) {
    const isPasswordField = name === "E-pass" || name === "SA-pass" ;
    const isChargeCodeField = name === "code";
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

