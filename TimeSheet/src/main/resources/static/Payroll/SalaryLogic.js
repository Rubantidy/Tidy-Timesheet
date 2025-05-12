// SalaryLogic.js

function fetchEmployeesForSalaryForm() {
    fetch("/getEmployeesforSalary")
        .then(response => response.json())
        .then(data => {
			console.log(data)
            const select = document.getElementById("salaryEmployeeSelect");
            if (!select) return;

            select.innerHTML = '<option value="">Select Employee</option>';

            data.forEach(emp => {
                const option = document.createElement("option");
                option.value = emp["E-name"];
                option.textContent = emp["E-name"];
                option.dataset.doj = emp["onborad"];
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching employees for salary:", error));
}

function updateDOJ() {
    const select = document.getElementById("salaryEmployeeSelect");
    const dojInput = document.getElementById("doj");

    const selectedOption = select.options[select.selectedIndex];
    dojInput.value = selectedOption.dataset.doj || "";
}
