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
        "manage-admin": `<button class="btn btn-warning mb-3" id="addAdminBtn">Add Sub-Admin</button><div id="form-container"></div>`,
        "charge-code": `<button class="btn btn-info mb-3" id="addChargeCodeBtn">Add Charge Code</button><div id="form-container"></div>`,
        "leave-code": `<button class="btn btn-success mb-3" id="addLeaveCodeBtn">Add Leave Code</button><div id="form-container"></div>`,
		"Expense-code": `<button class="btn btn-success mb-3" id="addExpenseCodeBtn">Add Expense Code</button><div id="form-container"></div>`
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
    document.getElementById("addAdminBtn")?.addEventListener("click", () => showForm("sub-admin"));
    document.getElementById("addChargeCodeBtn")?.addEventListener("click", () => showForm("charge-code"));
    document.getElementById("addLeaveCodeBtn")?.addEventListener("click", () => showForm("leave-code"));
	document.getElementById("addExpenseCodeBtn")?.addEventListener("click", () => showForm("Expense-code"));
}

function showForm(type) {
    const formContainer = document.getElementById("form-container");
    formContainer.innerHTML = createForm(type);
}

function createForm(type) {
    const forms = {
        "employee": `
            <div class="card p-3 mb-3">
                <h4>Add Employee</h4>
                <form action="/addEmployee" method="POST">
                    ${inputField("Employee Name", "text", "E-name")}
					${inputField("Employee Email", "text", "E-mail")}
					${inputField("Employee Password", "text", "E-pass")}
                    ${selectField("Role", "E-role", ["Admin", "Team Lead","Employee"])}
                    ${formButtons()}
                </form>
            </div>
        `,
        "sub-admin": `
            <div class="card p-3 mb-3">
                <h4>Add Sub-Admin</h4>
                <form action="/addSubAdmin" method="POST">
                    ${inputField("Sub-Admin Name", "text", "SA-name")}
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
                    ${inputField("Charge Code", "text", "C-code")}
					${inputField("Client", "text", "C-clientname")}
					${inputField("Contact Number", "number", "C-contact")}
					${inputField("Country/Region", "text", "C-country")}
                    ${textareaField("Description", "C-desc")}
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
					${selectField("Expense Name", "Ex-name", ["Network Expense", "Travel"])}
		            ${formButtons()}
		        </form>
		   </div>
		`
    };

    return forms[type] || "<p>Form Not Found</p>";
}


function generatePassword(inputId) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomPassword = "";
    for (let i = 0; i < 8; i++) {
        randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
	const inputField = document.getElementById(inputId);
	    inputField.value = randomPassword;
	    inputField.setAttribute("readonly", true); // Prevent manual typing
	    inputField.onkeydown = function(event) { event.preventDefault(); };
}

function inputField(label, type, name) {
	const isPasswordField = name === "E-pass" || name === "SA-pass" || name === "C-code";
    return `
        <div class="mb-3">
            <label class="form-label">${label}</label>
            <input type="${type}" class="form-control" name="${name}" id="${name}" required>
			${isPasswordField ? `<button class="btn btn-outline-primary" type="button" onclick="generatePassword('${name}')" style="margin-top: 10px;">Generate</button>` : ""}
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

