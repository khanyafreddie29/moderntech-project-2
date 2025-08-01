document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:8090/api";

  const totalEmployeesEl = document.getElementById("total-employees");
  const activeEmployeesEl = document.getElementById("active-employees");
  const presentCountEl = document.getElementById("present-count");
  const presentPercentageEl = document.getElementById("present-percentage");
  const pendingLeavesEl = document.getElementById("pending-leaves");
  const totalLeavesEl = document.getElementById("total-leaves");
  const totalPayrollEl = document.getElementById("total-payroll");
  const totalDeductionsEl = document.getElementById("total-deductions");
  const recentActivityEl = document.getElementById("recentActivity");
  const departmentChartCtx = document.getElementById("departmentChart").getContext("2d");
  const performanceChartCtx = document.getElementById("performanceChart").getContext("2d");
  const greetingTextEl = document.getElementById("greetingText");
  const clockTextEl = document.getElementById("clockText");

  let departmentChart, performanceChart;

  // If token missing, auto redirect immediately
  if (!localStorage.getItem("token")) {
    alert("Not authenticated. Please log in.");
    window.location.href = "../html/login.html";
    return;
  }

  function showToast(message, type = "primary") {
    const toastMessage = document.getElementById("toastMessage");
    const toastBox = document.getElementById("toastBox");
    toastMessage.textContent = message;
    toastBox.classList.remove("text-bg-primary", "text-bg-danger");
    toastBox.classList.add(`text-bg-${type}`);
    const toast = new bootstrap.Toast(toastBox);
    toast.show();
  }

  function updateClockAndGreeting() {
    const now = new Date();
    clockTextEl.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const hour = now.getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    greetingTextEl.textContent = `${greeting}, Admin`;
  }
  setInterval(updateClockAndGreeting, 1000);

  // Use centralized fetchWithAuth for all fetches
  async function fetchEmployees() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/employees`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      return await response.json();
    } catch (error) {
      showToast("Failed to load employees", "danger");
      console.error(error);
      return [];
    }
  }

  async function fetchAttendance() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/attendance/today`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return await response.json();
    } catch (error) {
      showToast("Failed to load attendance", "danger");
      console.error(error);
      return [];
    }
  }

  async function fetchLeaveRequests() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/leave-requests`);
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      return await response.json();
    } catch (error) {
      showToast("Failed to load leave requests", "danger");
      console.error(error);
      return [];
    }
  }

  async function fetchPayrolls() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/payroll`);
      if (!response.ok) throw new Error("Failed to fetch payroll");
      return await response.json();
    } catch (error) {
      showToast("Failed to load payroll", "danger");
      console.error(error);
      return [];
    }
  }

  async function fetchReviews() {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/performance-reviews`);
      if (!response.ok) throw new Error("Failed to fetch performance reviews");
      return await response.json();
    } catch (error) {
      showToast("Failed to load performance reviews", "danger");
      console.error(error);
      return [];
    }
  }

  async function updateSummaryCards() {
    const employees = await fetchEmployees();
    const attendance = await fetchAttendance();
    const leaves = await fetchLeaveRequests();
    const payrolls = await fetchPayrolls();

    const currencyFormatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === "Active").length;
    totalEmployeesEl.textContent = totalEmployees;
    activeEmployeesEl.textContent = activeEmployees;

    const presentCount = attendance.filter((a) => a.attendance_status === "Present").length;
    const presentPercentage = totalEmployees
      ? ((presentCount / totalEmployees) * 100).toFixed(2) + "%"
      : "0%";
    presentCountEl.textContent = presentCount;
    presentPercentageEl.textContent = presentPercentage;

    const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
    totalLeavesEl.textContent = leaves.length;
    pendingLeavesEl.textContent = pendingLeaves;

    const totalPayroll = payrolls.reduce((sum, p) => sum + parseFloat(p.final_salary || 0), 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + parseFloat(p.deductions || 0), 0);
    totalPayrollEl.textContent = currencyFormatter.format(totalPayroll);
    totalDeductionsEl.textContent = currencyFormatter.format(totalDeductions);
  }

  async function renderDepartmentChart() {
    const employees = await fetchEmployees();
    const departments = [...new Set(employees.map((e) => e.department))];
    const departmentCounts = departments.map((dep) => employees.filter((e) => e.department === dep).length);

    if (departmentChart) departmentChart.destroy();
    departmentChart = new Chart(departmentChartCtx, {
      type: "pie",
      data: {
        labels: departments,
        datasets: [
          {
            data: departmentCounts,
            backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0", "#FFCE56", "#9966FF"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Employees by Department" },
        },
      },
    });
  }

  async function renderPerformanceChart() {
    const reviews = await fetchReviews();
    const ratings = ["Excellent", "Good", "Average", "Poor"];
    const ratingCounts = ratings.map((rating) => reviews.filter((r) => r.rating === rating).length);

    if (performanceChart) performanceChart.destroy();
    performanceChart = new Chart(performanceChartCtx, {
      type: "bar",
      data: {
        labels: ratings,
        datasets: [
          {
            label: "Number of Reviews",
            data: ratingCounts,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Performance Review Ratings" },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  async function renderRecentActivity() {
    const leaves = await fetchLeaveRequests();
    const reviews = await fetchReviews();
    const attendance = await fetchAttendance();
    const employees = await fetchEmployees();

    const activities = [
      ...leaves.map((l) => ({
        type: "Leave Request",
        description: `${l.full_name} requested ${l.leave_type} from ${l.start_date} to ${l.end_date}`,
        time: new Date(l.start_date),
      })),
      ...reviews.map((r) => ({
        type: "Performance Review",
        description: `${r.reviewer} reviewed ${employees.find((e) => e.id === r.employee_id)?.full_name || "Unknown"} (${
          r.rating
        })`,
        time: new Date(r.review_date),
      })),
      ...attendance.map((a) => ({
        type: "Attendance",
        description: `${a.full_name} marked as ${a.attendance_status} at ${a.time_in || "N/A"}`,
        time: new Date(),
      })),
    ];

    activities.sort((a, b) => b.time - a.time);
    recentActivityEl.innerHTML = activities
      .slice(0, 5)
      .map(
        (a) => `
      <li class="list-group-item">
        <strong>${a.type}</strong>: ${a.description}
        <small class="text-muted d-block">${a.time.toLocaleString()}</small>
      </li>
    `
      )
      .join("");
  }

  async function renderTopPerformers() {
    const reviews = await fetchReviews();
    const employees = await fetchEmployees();
    const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e.full_name]));

    const ratingMap = { Excellent: 4, Good: 3, Average: 2, Poor: 1 };
    const scores = {};

    reviews.forEach((r) => {
      if (!scores[r.employee_id]) scores[r.employee_id] = [];
      if (ratingMap[r.rating]) scores[r.employee_id].push(ratingMap[r.rating]);
    });

    const avgScores = Object.entries(scores).map(([id, ratings]) => ({
      id,
      name: employeeMap[id] || "Unknown",
      avg: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2),
      count: ratings.length,
    }));

    avgScores.sort((a, b) => b.avg - a.avg || b.count - a.count);
    const top3 = avgScores.slice(0, 3);
    const ranks = ["🥇", "🥈", "🥉"];
    const topList = document.getElementById("topPerformersList");

    if (top3.length === 0) {
      topList.innerHTML = `<li class="list-group-item text-muted">No reviews available</li>`;
      return;
    }

    topList.innerHTML = top3
      .map(
        (p, index) => `
      <li class="list-group-item d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <span class="fs-3">${ranks[index]}</span>
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&size=40" class="rounded-circle" alt="Avatar" width="40" height="40" />
          <div>
            <strong>${p.name}</strong><br>
            <small class="text-muted">Avg Score: ${p.avg} (${p.count} reviews)</small>
          </div>
        </div>
      </li>
    `
      )
      .join("");
  }

  // Initial calls
  updateSummaryCards();
  renderDepartmentChart();
  renderPerformanceChart();
  renderRecentActivity();
  renderTopPerformers();
});
