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


function openBankEditModal() {
  document.getElementById('inputAccountHolder').value = document.getElementById('bankAccountHolder').textContent;
  document.getElementById('inputAccountNumber').value = document.getElementById('bankAccountNumber').textContent;
  document.getElementById('inputIFSC').value = document.getElementById('bankIFSC').textContent;
  document.getElementById('inputBankName').value = document.getElementById('bankName').textContent;
  document.getElementById('inputUpiId').value = document.getElementById('bankUpiId').textContent;

  const modal = new bootstrap.Modal(document.getElementById('bankEditModal'));
  modal.show();
}


function saveBankDetails() {
    const username = sessionStorage.getItem("userName");
    const accountHolder = document.getElementById('inputAccountHolder').value.trim();
    const accountNumber = document.getElementById('inputAccountNumber').value.trim();
    const ifsc = document.getElementById('inputIFSC').value.trim().toUpperCase();
    const bankName = document.getElementById('inputBankName').value.trim();
    const upiId = document.getElementById('inputUpiId').value.trim();

    // Clear previous error messages
    const errorFields = ['errorAccountHolder', 'errorAccountNumber', 'errorIFSC', 'errorBankName', 'errorUpiId'];
    errorFields.forEach(id => document.getElementById(id).innerText = "");

    let hasError = false;

    if (!accountHolder) {
        document.getElementById("errorAccountHolder").innerText = "Please enter account holder name.";
        hasError = true;
    }

    if (!accountNumber) {
        document.getElementById("errorAccountNumber").innerText = "Please enter account number.";
        hasError = true;
    } else if (!/^\d{9,18}$/.test(accountNumber)) {
        document.getElementById("errorAccountNumber").innerText = "Account number must be 9 to 18 digits.";
        hasError = true;
    }

    if (!ifsc) {
        document.getElementById("errorIFSC").innerText = "Please enter IFSC code.";
        hasError = true;
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        document.getElementById("errorIFSC").innerText = "Invalid IFSC format (e.g., SBIN0001234).";
        hasError = true;
    }

    if (!bankName) {
        document.getElementById("errorBankName").innerText = "Please enter bank name.";
        hasError = true;
    }

    if (!upiId) {
        document.getElementById("errorUpiId").innerText = "Please enter UPI ID.";
        hasError = true;
    } else if (!/^[\w.-]+@[\w]+$/.test(upiId)) {
        document.getElementById("errorUpiId").innerText = "Invalid UPI ID format (e.g., name@bank).";
        hasError = true;
    }

    if (hasError) return;

    // Confirmation modal setup
    document.getElementById("confirmBankText").innerText =
        `Are you sure you want to save the bank details for ${accountHolder}?`;
    document.getElementById("bankWarningNote").innerText =
        "Note: If you enter wrong details, it may affect the salary process.";

    const confirmModal = new bootstrap.Modal(document.getElementById("confirmBankModal"));
    confirmModal.show();

    document.getElementById("confirmSaveBank").onclick = function () {
        let formData = new FormData();
        formData.append("Employeename", username);
        formData.append("accountHolder", accountHolder);
        formData.append("accountNumber", accountNumber);
        formData.append("ifsc", ifsc);
        formData.append("bankName", bankName);
        formData.append("upiId", upiId);

        fetch("/saveBankDetails", {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json",
            }
        })
        .then(response => {
            if (response.ok) return response.json();
            else throw new Error('Error saving bank details');
        })
        .then(data => {
            showAlert(data.message, "success");
            document.getElementById("bankEditForm").reset();
            bootstrap.Modal.getInstance(document.getElementById("bankEditModal")).hide();
            fetchBankDetails();
        })
        .catch(error => {
            console.error("Error:", error);
            showAlert(error.message || "Error saving bank details!", "danger");
        })
        .finally(() => {
            confirmModal.hide();
        });
    };
}





function fetchBankDetails() {
    const username = sessionStorage.getItem("userName");
    if (!username) {
        console.error("Username not found in session");
        return;
    }

    fetch(`/getBankDetails?Employeename=${encodeURIComponent(username)}`)
        .then(response => {
            if (!response.ok) throw new Error("Bank details not found");
            return response.json();
        })
        .then(data => {
            // Fill the table fields
            document.getElementById("bankAccountHolder").innerText = data.accountHolder || "-";
            document.getElementById("bankAccountNumber").innerText = data.accountNumber || "-";
            document.getElementById("bankIFSC").innerText = data.ifsc || "-";
            document.getElementById("bankName").innerText = data.bankName || "-";
            document.getElementById("bankUpiId").innerText = data.upiId || "-";
        })
        .catch(error => {
            console.error("Error fetching bank details:", error);
            showAlert("Unable to load bank details", "danger");
        });
}



