document.addEventListener("DOMContentLoaded", () => {
  const empSelect = document.getElementById("employeeSelect");
  const leaveType = document.getElementById("leaveType");
  const otherContainer = document.getElementById("otherLeaveTypeContainer");
  const otherInput = document.getElementById("otherLeaveType");
  const form = document.getElementById("leaveForm");
  const tableBody = document.querySelector("#requestsTable tbody");
  const modalEl = document.getElementById("leaveModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const filterButtons = document.querySelectorAll(".filter-btn");
  let currentFilter = "all"; // Default: show all requests

  const API_BASE_URL = "http://localhost:8090/api"; // Adjust if your backend runs on a different port

  // Fetch employees from the backend using fetchWithAuth
  async function fetchEmployees() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const employees = await response.json();
      empSelect.innerHTML = '<option value="">-- Select Employee --</option>';
      employees.forEach(emp => {
        const opt = new Option(emp.full_name, emp.id);
        empSelect.appendChild(opt);
      });
      return employees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to load employees. Please try again.");
      return [];
    }
  }

  // Fetch leave requests from the backend using fetchWithAuth
  async function fetchLeaveRequests(status = "all") {
    try {
      const url = status === "all" ? `${API_BASE_URL}/leave-requests` : `${API_BASE_URL}/leave-requests?status=${status}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      const requests = await response.json();
      return requests;
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      alert("Failed to load leave requests. Please try again.");
      return [];
    }
  }

  // Render leave requests applying current filter
  async function renderFilteredRequests() {
    tableBody.innerHTML = "";
    const requests = await fetchLeaveRequests(currentFilter);
    requests.forEach((req, i) => addRow(req, i));
  }

  // Initialize data
  async function initialize() {
    await fetchEmployees();
    await renderFilteredRequests();
  }

  initialize();

  // Filter buttons event
  filterButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-status") === "Denied" ? "Rejected" : btn.getAttribute("data-status");
      await renderFilteredRequests();
    });
  });

  // Show/hide "other" leave type input
  leaveType.addEventListener("change", () => {
    if (leaveType.value === "other") {
      otherContainer.classList.remove("d-none");
      otherInput.required = true;
    } else {
      otherContainer.classList.add("d-none");
      otherInput.required = false;
      otherInput.value = "";
      otherInput.classList.remove("is-invalid");
    }
  });

  // Form submit handler
  form.addEventListener("submit", async e => {
    e.preventDefault();
    form.classList.remove("was-validated");
    otherInput.classList.remove("is-invalid");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const empId = empSelect.value;
    let type = leaveType.value;
    if (type === "other") {
      type = otherInput.value.trim();
      if (!type) {
        otherInput.classList.add("is-invalid");
        otherInput.focus();
        return;
      }
    }

    const start = document.getElementById("startDate").value;
    const end = document.getElementById("endDate").value;
    const reason = document.getElementById("reason").value.trim();

    if (new Date(start) > new Date(end)) {
      alert("Start date cannot be after end date.");
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leave-requests`, {
        method: "POST",
        body: JSON.stringify({
          employee_id: empId,
          leave_type: type,
          reason,
          start_date: start,
          end_date: end,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create leave request");
      }

      form.reset();
      otherContainer.classList.add("d-none");
      otherInput.required = false;
      modal.hide();
      await renderFilteredRequests();
    } catch (error) {
      console.error("Error creating leave request:", error);
      alert(error.message);
    }
  });

  // Add a leave request row to the table
  function addRow(data, idx) {
    const initials = data.full_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const profileImage =
      data.profile_image && data.profile_image.trim() !== ""
        ? data.profile_image
        : `https://via.placeholder.com/40x40.png?text=${initials}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${profileImage}" alt="${initials}" class="avatar-img" 
          style="width: 40px; height: 40px; border-radius: 50%;" 
          onerror="this.onerror=null;this.src='https://via.placeholder.com/40x40.png?text=${initials}'" />
      </td>
      <td>${data.full_name}</td>
      <td>${data.leave_type || 'N/A'}</td>
      <td>${data.start_date || 'N/A'}</td>
      <td>${data.end_date || 'N/A'}</td>
      <td>${data.reason || 'N/A'}</td>
      <td class="status-cell">${data.status === 'Rejected' ? 'Denied' : data.status}</td>
      <td>
        <button class="btn btn-sm btn-success approve">Approve</button>
        <button class="btn btn-sm btn-danger deny ms-2">Deny</button>
        <button class="btn btn-sm btn-outline-secondary remove ms-2">Remove</button>
      </td>
    `;

    // Approve button handler
    tr.querySelector(".approve").addEventListener("click", async () => {
      await updateStatus(data.id, tr, "Approved");
    });

    // Deny button handler
    tr.querySelector(".deny").addEventListener("click", async () => {
      await updateStatus(data.id, tr, "Rejected");
    });

    // Remove button handler
    tr.querySelector(".remove").addEventListener("click", async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/leave-requests/${data.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete leave request");
        await renderFilteredRequests();
      } catch (error) {
        console.error("Error deleting leave request:", error);
        alert("Failed to delete leave request. Please try again.");
      }
    });

    tableBody.appendChild(tr);
  }

  // Update leave request status
  async function updateStatus(id, row, newStatus) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leave-requests/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update leave request status");
      const updatedRequest = await response.json();
      row.querySelector(".status-cell").textContent = updatedRequest.status === "Rejected" ? "Denied" : updatedRequest.status;
    } catch (error) {
      console.error("Error updating leave request status:", error);
      alert("Failed to update leave request status. Please try again.");
    }
  }
});
