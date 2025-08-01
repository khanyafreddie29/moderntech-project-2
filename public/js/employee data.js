document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.getElementById("employeeCardContainer");
  const searchInput = document.getElementById("searchInput");
  const departmentFilter = document.getElementById("departmentFilter");
  const API_URL = "http://localhost:8090/api/employees";

  // Redirect to login if token is missing
  if (!localStorage.getItem("token")) {
    window.location.href = "../html/login.html";
  }

  // Centralized auth fetch helper
  function getToken() {
    return localStorage.getItem("token");
  }

  async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "../html/login.html";
      throw new Error("Unauthorized");
    }

    return response;
  }

  async function fetchEmployees() {
    try {
      const response = await fetchWithAuth(API_URL);
      return await response.json();
    } catch (err) {
      alert("Failed to load employee data: " + err.message);
      console.error(err);
      return [];
    }
  }

  function renderEmployeeCards(data) {
    cardContainer.innerHTML = "";
    if (data.length === 0) {
      cardContainer.innerHTML = '<p class="text-center">No employees found.</p>';
      return;
    }

    data.forEach((emp, index) => {
      const initials = (emp.full_name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      const statusClass = emp.status === "Active" ? "status-active" : "status-onleave";
      const imgSrc = emp.profile_image?.trim()
        ? emp.profile_image
        : `https://via.placeholder.com/80x80.png?text=${initials}`;
      const cardId = `history-${index}`;
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 mb-4";

      col.innerHTML = `
        <div class="employee-card d-flex flex-column h-100">
          <div class="d-flex align-items-center mb-3">
            <img src="${imgSrc}" alt="${initials}" class="avatar-img"
              onerror="this.onerror=null;this.src='https://via.placeholder.com/80x80.png?text=${initials}'" />
            <div class="ms-3">
              <h5 class="mb-0">${emp.full_name || "Unknown"}</h5>
              <small class="text-muted">EMP${(emp.id || 0).toString().padStart(3, "0")}</small>
            </div>
          </div>
          <p><strong>Position:</strong><br>${emp.position || "N/A"}</p>
          <p><strong>Department:</strong><br>${emp.department || "N/A"}</p>
          <p><strong>Salary:</strong><br>R ${(emp.salary || 0).toLocaleString()}</p>
          <div>
            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#${cardId}">
              View History
            </button>
            <div class="collapse mt-2" id="${cardId}">
              <p><strong>History:</strong><br>${emp.employment_history || "No history available"}</p>
            </div>
          </div>
          <p class="mt-2"><strong>Status:</strong><br><span class="status-badge ${statusClass}">${emp.status}</span></p>
          <div class="d-flex justify-content-between mt-2">
            <button class="btn btn-sm btn-warning" onclick='openEditModal(${JSON.stringify(emp)})'>
              <i class="bi bi-pencil-square"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id})">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      cardContainer.appendChild(col);
    });
  }

  function filterAndRender(employees) {
    const searchText = searchInput.value.toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const filtered = employees.filter(emp =>
      (emp.full_name || "").toLowerCase().includes(searchText) &&
      (!selectedDepartment || emp.department === selectedDepartment)
    );
    renderEmployeeCards(filtered);
  }

  async function populateDepartmentFilter(employees) {
    const departments = [...new Set(employees.map((e) => e.department).filter(dep => dep))];
    departmentFilter.innerHTML = '<option value="">All Departments</option>';
    departments.forEach((dep) => {
      const opt = document.createElement("option");
      opt.value = dep;
      opt.textContent = dep;
      departmentFilter.appendChild(opt);
    });
  }

  document.getElementById("addEmployeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    if (!data.salary || isNaN(data.salary) || parseFloat(data.salary) < 0) {
      alert("Salary must be a valid positive number");
      return;
    }

    try {
      const res = await fetchWithAuth(API_URL, {
        method: "POST",
        body: JSON.stringify({ ...data, salary: parseFloat(data.salary) }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error adding employee: ${errorData.error || res.statusText}`);
      }
      e.target.reset();
      bootstrap.Modal.getInstance(document.getElementById("addEmployeeModal")).hide();
      await init();
    } catch (err) {
      alert(err.message);
      console.error("Add employee error:", err);
    }
  });

  window.openEditModal = (emp) => {
    const form = document.getElementById("editEmployeeForm");
    form.id.value = emp.id;
    form.full_name.value = emp.full_name;
    form.position.value = emp.position;
    form.department.value = emp.department;
    form.salary.value = emp.salary;
    form.status.value = emp.status;
    form.employment_history.value = emp.employment_history;
    form.profile_image.value = emp.profile_image;
    form.email.value = emp.email || "";
    form.phone_number.value = emp.phone_number || "";
    new bootstrap.Modal(document.getElementById("editEmployeeModal")).show();
  };

  document.getElementById("editEmployeeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    if (!data.salary || isNaN(data.salary) || parseFloat(data.salary) < 0) {
      alert("Salary must be a valid positive number");
      return;
    }

    const id = data.id;
    delete data.id;
    try {
      const res = await fetchWithAuth(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...data, salary: parseFloat(data.salary) }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error updating employee: ${errorData.error || res.statusText}`);
      }
      bootstrap.Modal.getInstance(document.getElementById("editEmployeeModal")).hide();
      await init();
    } catch (err) {
      alert(err.message);
      console.error("Update employee error:", err);
    }
  });

  window.deleteEmployee = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error deleting employee: ${errorData.error || res.statusText}`);
      }
      await init();
    } catch (err) {
      alert(err.message);
      console.error("Delete employee error:", err);
    }
  };

  async function init() {
    const employees = await fetchEmployees();
    await populateDepartmentFilter(employees);
    renderEmployeeCards(employees);
    searchInput.addEventListener("input", () => filterAndRender(employees));
    departmentFilter.addEventListener("change", () => filterAndRender(employees));
  }

  init();
});
