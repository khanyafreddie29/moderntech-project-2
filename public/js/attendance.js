
document.addEventListener("DOMContentLoaded", () => {
  const attendanceTableBody = document.getElementById("attendanceTableBody");

  const totalCountEl = document.getElementById("total-count");
  const presentCountEl = document.getElementById("present-count");
  const lateCountEl = document.getElementById("late-count");
  const absentCountEl = document.getElementById("absent-count");

  const presentPercentEl = document.getElementById("present-percentage");
  const latePercentEl = document.getElementById("late-percentage");
  const absentPercentEl = document.getElementById("absent-percentage");

  const filterButtons = document.querySelectorAll(".filter-btn");
  const employeeSelect = document.getElementById("employeeSelect");
  const attendanceStatus = document.getElementById("attendanceStatus");
  const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
  const addAttendanceModal = new bootstrap.Modal(document.getElementById("addAttendanceModal"));
  const toastBox = document.getElementById("toastBox");
  const toastMessage = document.getElementById("toastMessage");

  let attendanceData = [];

 
  function showToast(message, type = "primary") {
    toastMessage.textContent = message;
    toastBox.classList.remove("text-bg-primary", "text-bg-danger", "text-bg-success");
    toastBox.classList.add(`text-bg-${type}`);
    const toast = new bootstrap.Toast(toastBox);
    toast.show();
  }

  
  async function loadEmployees() {
    try {
      const res = await fetchWithAuth("http://localhost:8090/api/employees");
      const employees = await res.json();
      employeeSelect.innerHTML = '<option value="">-- Select Employee --</option>';
      employees.forEach((employee) => {
        const option = document.createElement("option");
        option.value = employee.id;
        option.textContent = employee.full_name;
        employeeSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading employees:", error);
      showToast("Failed to load employees", "danger");
    }
  }

  async function loadTodayAttendance() {
    try {
      const res = await fetchWithAuth("http://localhost:8090/api/attendance/today");
      const data = await res.json();
      attendanceData = data;
      renderTableRows(attendanceData);
      updateSummary(attendanceData);
    } catch (error) {
      console.error("Error loading attendance:", error);
      showToast("Failed to load attendance", "danger");
    }
  }

  function renderTableRows(data) {
    attendanceTableBody.innerHTML = "";

    data.forEach((employee, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>
          <img src="${employee.profile_image || "default.png"}" alt="Profile" width="40" height="40" style="border-radius: 50%;" />
        </td>
        <td>${index + 1}</td>
        <td>${employee.full_name}</td>
        <td>${employee.position}</td>
        <td>${employee.department}</td>
        <td>${employee.time_in ? employee.time_in : "-"}</td>
        <td>
          <select class="form-select attendance-status" data-employee-id="${employee.employee_id}">
            <option value="">-- Select --</option>
            <option value="Present" ${employee.attendance_status === "Present" ? "selected" : ""}>Present</option>
            <option value="Absent" ${employee.attendance_status === "Absent" ? "selected" : ""}>Absent</option>
            <option value="Late" ${employee.attendance_status === "Late" ? "selected" : ""}>Late</option>
          </select>
        </td>
      `;

      attendanceTableBody.appendChild(row);
    });

    attachStatusListeners();
  }

  async function updateAttendance(employeeId, status) {
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetchWithAuth("http://localhost:8090/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          employee_id: employeeId,
          time_in: today,
          attendance_status: status,
        }),
      });

      const data = await res.json();
      showToast(data.message, "primary");
      loadTodayAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
      showToast("Failed to update attendance", "danger");
    }
  }

  function handleAddAttendance() {
    const employeeId = employeeSelect.value;
    const status = attendanceStatus.value;

    if (!employeeId || !status) {
      showToast("Please select an employee and status", "danger");
      return;
    }

    updateAttendance(employeeId, status);
    addAttendanceModal.hide();
    employeeSelect.value = "";
    attendanceStatus.value = "";
  }

  function attachStatusListeners() {
    const selects = document.querySelectorAll(".attendance-status");
    selects.forEach((select) => {
      select.addEventListener("change", (event) => {
        const employeeId = event.target.dataset.employeeId;
        const selectedStatus = event.target.value;
        if (selectedStatus) {
          updateAttendance(employeeId, selectedStatus);
        }
      });
    });
  }

  function updateSummary(data) {
    const total = data.length;
    const presentCount = data.filter((e) => e.attendance_status === "Present").length;
    const lateCount = data.filter((e) => e.attendance_status === "Late").length;
    const absentCount = data.filter((e) => e.attendance_status === "Absent").length;

    totalCountEl.textContent = total;
    presentCountEl.textContent = presentCount;
    lateCountEl.textContent = lateCount;
    absentCountEl.textContent = absentCount;

    presentPercentEl.textContent = total ? ((presentCount / total) * 100).toFixed(2) + "%" : "0%";
    latePercentEl.textContent = total ? ((lateCount / total) * 100).toFixed(2) + "%" : "0%";
    absentPercentEl.textContent = total ? ((absentCount / total) * 100).toFixed(2) + "%" : "0%";
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      if (filter === "all") {
        renderTableRows(attendanceData);
      } else {
        renderTableRows(attendanceData.filter((e) => e.attendance_status === filter));
      }
    });
  });

  saveAttendanceBtn.addEventListener("click", handleAddAttendance);

  const currentDateEl = document.getElementById("current-date");
  const todayStr = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  currentDateEl.textContent = todayStr;

  // Initial load
  loadEmployees();
  loadTodayAttendance();
});
