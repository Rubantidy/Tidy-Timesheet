document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showContent(this.dataset.section);
            setActiveNavLink(this);
            closeSidebarOnMobile(); // Hide sidebar after clicking a menu item (on mobile)
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
		"manage-user": `<button class="btn btn-primary mb-3" id="addEmployeeBtn">Add Employee</button><div id="form-container"></div>`,
		 "delegates": `<button class="btn btn-warning mb-3" id="addDelegateBtn">Add Delegates</button><div id="form-container"></div>`,
		 "charge-code": `<button class="btn btn-info mb-3" id="addChargeCodeBtn">Add Code</button><div id="form-container"></div>`
    };

    title.innerText = section.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
    contentBox.innerHTML = sections[section] || "<p>Content Not Found</p>";

    attachFormListeners();
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
	const formContainer = document.getElementById("form-container");
	if (selectedValue === "charge-code") {
	        formContainer.innerHTML += `
	            <div class="mb-3">
	                <label class="form-label">Select Type</label>
	                <select class="form-control" id="chargeType" onchange="handleChargeTypeSelection()">
	                    <option value="">Select</option>
	                    <option value="external">External</option>
	                    <option value="internal">Internal</option>
	                </select>
	            </div>
	            <div id="chargeFormContainer"></div>
	        `;
	    } else if (selectedValue) {
	        showForm(selectedValue);
	    }
}

function handleChargeTypeSelection() {
    const selectedType = document.getElementById("chargeType").value;
    const chargeFormContainer = document.getElementById("chargeFormContainer");

    if (selectedType === "external") {
        chargeFormContainer.innerHTML = createForm("charge-code");
    } else if (selectedType === "internal") {
        chargeFormContainer.innerHTML = createForm("internal-charge-code");
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
				${selectField("Type", "C-type", ["External"])}
				${inputField("Client", "text", "C-clientname")}
				${inputField("Onboard Date", "date", "C-onboard")}
				${inputField("Country/Region", "text", "C-country")}
				${textareaField("Description", "C-desc")}
				${inputField("Charge Code", "text", "C-code")}
				${formButtons()}
                </form>
            </div>
        `,
		"internal-charge-code": `
		            <div class="card p-3 mb-3">
		                <h4>Add Internal Project Code</h4>
		                <form action="/addInternalCode" method="POST">
		                    ${selectField("Type", "C-type", ["Internal"])}
		                    ${inputField("Project Name", "text", "P-name")}
		                    ${inputField("Start Date", "date", "P-start")}
		                    ${inputField("Project Code", "text", "P-code")}
		                    ${formButtons()}
		                </form>
		            </div>
		        `,
        "leave-code": `
            <div class="card p-3 mb-3">
                <h4>Add Leave Code</h4>
                <form action="/addLeaveCode" method="POST">
                    ${inputField("Leave Code", "number", "L-code")}
					${inputField("Leave Name", "text", "L-name")}
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
					${selectField("Expense Name", "Ex-name", ["Select", "Network Expense", "Travel"])}
		            ${formButtons()}
		        </form>
		   </div>
		`
    };

    return forms[type] || "<p>Form Not Found</p>";
}

function codeGenerate() {
    const clientNameInput = document.getElementById("C-clientname");
    const onboardDateInput = document.getElementById("C-onboard");
    const chargeCodeInput = document.getElementById("C-code");
    
    if (!clientNameInput || !onboardDateInput || !chargeCodeInput) {
        console.error("Missing input fields for Charge Code generation.");
        return;
    }
    
    if (chargeCodeInput.value) {
        return; // Prevent regenerating if already generated
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
    const isPasswordField = name === "E-pass" || name === "SA-pass" || name === "P-code";
    const isChargeCodeField = name === "C-code";
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

