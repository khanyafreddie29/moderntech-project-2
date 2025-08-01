document.addEventListener("DOMContentLoaded", () => {
  const empSelect = document.getElementById("empSelect");
  const salaryInput = document.getElementById("empSalary");
  const hoursInput = document.getElementById("empHours");
  const leaveInput = document.getElementById("empLeave");
  const addForm = document.getElementById("addForm");
  const tableBody = document.querySelector("#payrollTable tbody");
  const yearlyBody = document.querySelector("#yearlyTable tbody");
  const searchInput = document.getElementById("searchInput");
  const submitButton = addForm.querySelector("button[type='submit']");
  const salaryChartCtx = document.getElementById("salaryChart").getContext("2d");
  let salaryChart;
  let editingId = null;

  // Fetch employees for dropdown using fetchWithAuth
  async function fetchEmployees() {
    try {
      const response = await fetchWithAuth('http://localhost:8090/api/payroll/employees');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const employees = await response.json();
      empSelect.innerHTML = '<option value="">-- Choose Employee --</option>';
      employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = emp.name;
        empSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to load employees.');
    }
  }

  // Prefill salary, hours, leave on select change using fetchWithAuth
  empSelect.addEventListener("change", async () => {
    try {
      const response = await fetchWithAuth('http://localhost:8090/api/payroll/employees');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const employees = await response.json();
      const selected = employees.find(e => e.id == empSelect.value);
      if (selected) {
        salaryInput.value = selected.salary;
        hoursInput.value = 160;
        leaveInput.value = 0;
      } else {
        salaryInput.value = hoursInput.value = leaveInput.value = "";
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      alert('Failed to load employee data.');
    }
  });

  // Fetch and render payroll data using fetchWithAuth
  async function fetchPayrolls(keyword = '') {
    try {
      const url = keyword
        ? `http://localhost:8090/api/payroll/search?name=${encodeURIComponent(keyword)}`
        : 'http://localhost:8090/api/payroll';
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const payrolls = await response.json();
      renderTable(payrolls);
      renderYearlyTable(payrolls);
      updateCharts(payrolls);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      alert('Failed to load payroll data.');
    }
  }

  // Add or update payroll entry with fetchWithAuth
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payrollData = {
      employee_id: empSelect.value,
      hours_worked: parseInt(hoursInput.value),
      leave_days: parseInt(leaveInput.value),
      salary: parseFloat(salaryInput.value)
    };

    if (!payrollData.employee_id || isNaN(payrollData.hours_worked) || isNaN(payrollData.leave_days) || isNaN(payrollData.salary)) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    try {
      const url = editingId ? `http://localhost:8090/api/payroll/${editingId}` : 'http://localhost:8090/api/payroll';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollData)
      });

      if (response.ok) {
        addForm.reset();
        submitButton.textContent = "Add Payroll";
        editingId = null;
        fetchEmployees(); // reload employee dropdown
        fetchPayrolls();
        document.getElementById("payrollModalLabel").textContent = "Add Payroll Entry";
        // Hide modal
        const modalEl = document.getElementById('payrollModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} payroll:`, error);
      alert(`Failed to ${editingId ? 'update' : 'add'} payroll.`);
    }
  });

  // Reset form on cancel
  addForm.addEventListener("reset", () => {
    submitButton.textContent = "Add Payroll";
    editingId = null;
    document.getElementById("payrollModalLabel").textContent = "Add Payroll Entry";
    salaryInput.value = "";
    hoursInput.value = "";
    leaveInput.value = "";
  });

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(emp => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${emp.employee_id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>R ${emp.salary?.toLocaleString() || 0}</td>
        <td>${emp.hours_worked}</td>
        <td>${emp.leave_days}</td>
        <td>R ${emp.deductions?.toLocaleString() || 0}</td>
        <td>R ${emp.final_salary?.toLocaleString() || 0}</td>
        <td>
          <button class="btn btn-sm btn-success me-2" onclick="downloadPayslip(${emp.id})">Payslip</button>
          <button class="btn btn-sm btn-primary me-1" onclick="editPayroll(${emp.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="removePayroll(${emp.id})">Remove</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderYearlyTable(data) {
    yearlyBody.innerHTML = "";
    data.forEach(emp => {
      const gross = (emp.salary || 0) * 12;
      const deductions = (emp.deductions || 0) * 12;
      const net = (emp.final_salary || 0) * 12;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${emp.employee_id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>R ${gross.toLocaleString()}</td>
        <td>R ${deductions.toLocaleString()}</td>
        <td>R ${net.toLocaleString()}</td>
      `;
      yearlyBody.appendChild(row);
    });
  }

  function updateCharts(data) {
    if (!data || !data.length) {
      console.warn("No data to show in charts.");
      return;
    }

    const names = data.map(e => e.name);
    const salaries = data.map(e => e.salary || 0);
    const deductions = data.map(e => e.deductions || 0);
    const finalSalaries = data.map(e => e.final_salary || 0);

    const totalGross = salaries.reduce((a, b) => a + b, 0);
    const totalDeductions = deductions.reduce((a, b) => a + b, 0);
    const totalNet = finalSalaries.reduce((a, b) => a + b, 0);

    if (totalGross === 0 && totalDeductions === 0 && totalNet === 0) {
      console.warn("All chart values are zero.");
      return;
    }

    if (salaryChart) salaryChart.destroy();

    salaryChart = new Chart(salaryChartCtx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: 'Gross Salary',
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            data: salaries
          },
          {
            label: 'Deductions',
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            data: deductions
          },
          {
            label: 'Net Salary',
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            data: finalSalaries
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Payroll Breakdown per Employee' }
        }
      }
    });
  }

  // Edit payroll
  window.editPayroll = async function(id) {
    try {
      const response = await fetchWithAuth(`http://localhost:8090/api/payroll/${id}`);
      if (!response.ok) throw new Error("Failed to fetch payroll for edit");
      const data = await response.json();
      if (!data) return;

      editingId = id;
      empSelect.innerHTML = `<option value="${data.employee_id}">${data.name}</option>`;
      empSelect.value = data.employee_id;
      salaryInput.value = data.salary;
      hoursInput.value = data.hours_worked;
      leaveInput.value = data.leave_days;

      submitButton.textContent = "Update Payroll";
      document.getElementById("payrollModalLabel").textContent = "Edit Payroll Entry";
      new bootstrap.Modal(document.getElementById('payrollModal')).show();
    } catch (error) {
      console.error('Error loading payroll for editing:', error);
      alert("Could not load payroll entry.");
    }
  };

  // Remove payroll
  window.removePayroll = async function(id) {
    try {
      const response = await fetchWithAuth(`http://localhost:8090/api/payroll/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchPayrolls();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error deleting payroll:', error);
      alert('Failed to delete payroll.');
    }
  };

  // Download payslip
  window.downloadPayslip = async function(id) {
    try {
      const response = await fetchWithAuth(`http://localhost:8090/api/payroll/payslip/${id}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const emp = await response.json();
      if (!emp) {
        alert('Payroll entry not found.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Employee Payslip", 80, 10);
      doc.setFontSize(12);

      const lines = [
        `Employee ID: ${emp.employee_id}`,
        `Name: ${emp.name}`,
        `Department: ${emp.department}`,
        ``,
        `--- Monthly Salary Breakdown ---`,
        `Gross Salary: R ${emp.salary.toLocaleString()}`,
        `Hours Worked: ${emp.hours_worked}`,
        `Leave Days: ${emp.leave_days}`,
        `Tax (18%): R ${emp.tax.toLocaleString()}`,
        `UIF (1%): R ${emp.uif.toLocaleString()}`,
        `Leave Deduction: R ${emp.leave_penalty.toLocaleString()}`,
        `Total Deductions: R ${emp.deductions.toLocaleString()}`,
        `Net Salary: R ${emp.final_salary.toLocaleString()}`,
        ``,
        `--- Yearly Summary ---`,
        `Gross Yearly Salary: R ${(emp.salary * 12).toLocaleString()}`,
        `Total Yearly Deductions: R ${(emp.deductions * 12).toLocaleString()}`,
        `Net Yearly Salary: R ${(emp.final_salary * 12).toLocaleString()}`
      ];

      let y = 20;
      lines.forEach(line => {
        doc.text(line, 20, y);
        y += 8;
      });

      doc.save(`${emp.name.replace(/\s+/g, "_")}_Payslip.pdf`);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      alert('Failed to generate payslip.');
    }
  };

  // Initial load
  fetchEmployees();
  fetchPayrolls();

  // Optional: Add search input listener if you want live search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      fetchPayrolls(searchInput.value.trim());
    });
  }
});
