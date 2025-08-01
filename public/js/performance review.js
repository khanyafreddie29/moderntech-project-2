document.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = "http://localhost:8090/api/performance-reviews";
  const reviewCardContainer = document.getElementById("reviewCardContainer");
  const reviewForm = document.getElementById("reviewForm");

  const reviewId = document.getElementById("reviewId");
  const employeeSelect = document.getElementById("employeeSelect");
  const employeeDepartment = document.getElementById("employeeDepartment");
  const employeePosition = document.getElementById("employeePosition");
  const employeeImage = document.getElementById("employeeImage");
  const reviewDate = document.getElementById("reviewDate");
  const reviewer = document.getElementById("reviewer");
  const performanceRating = document.getElementById("performanceRating");
  const reviewComments = document.getElementById("reviewComments");
  const reviewStatus = document.getElementById("reviewStatus");
  const reviewCategory = document.getElementById("reviewCategory");

  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const categoryFilter = document.getElementById("categoryFilter");

  const defaultImage = "https://via.placeholder.com/80x80.png?text=No+Image";
  let reviews = [];
  let employees = [];

  // Use global fetchWithAuth for all requests:
  async function fetchEmployees() {
    const res = await fetchWithAuth(`${apiBaseUrl}/employees`);
    employees = await res.json();

    // Populate dropdown
    employeeSelect.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.id;
      option.textContent = emp.full_name;
      employeeSelect.appendChild(option);
    });
  }

  async function fetchReviews() {
    const res = await fetchWithAuth(apiBaseUrl);
    reviews = await res.json();
    renderReviews();
  }

  function renderStars(rating) {
    const stars = { Excellent: 5, Good: 4, Average: 3, Poor: 2 }[rating] || 1;
    return `<span class="star-rating">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>`;
  }

  function getStatusClass(status) {
    return status === "Reviewed" ? "card-reviewed" :
      status === "Pending" ? "card-pending" :
        status === "Action Required" ? "card-action-required" : "";
  }

  function renderReviews() {
    const nameFilter = searchInput.value.toLowerCase();
    const statusVal = statusFilter.value;
    const categoryVal = categoryFilter.value.toLowerCase();
    reviewCardContainer.innerHTML = "";

    reviews.forEach(review => {
      const emp = employees.find(e => e.id === review.employee_id);
      if (!emp) return;

      if (!emp.full_name.toLowerCase().includes(nameFilter)) return;
      if (statusVal && review.status !== statusVal) return;
      if (categoryVal && !review.category.toLowerCase().includes(categoryVal)) return;

      const img = emp.profile_image || defaultImage;

      const card = document.createElement("div");
      card.className = "col-md-4 mb-3";
      card.innerHTML = `
        <div class="card shadow-sm ${getStatusClass(review.status)}">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <img src="${img}" class="img-thumbnail rounded-circle me-3" width="60" height="60"/>
              <div>
                <h5 class="card-title mb-0 employee-name">${emp.full_name}</h5>
                <small class="text-muted">${emp.position} — ${emp.department}</small><br/>
                <small class="text-muted">${new Date(review.review_date).toLocaleDateString()}</small>
              </div>
            </div>
            <p><strong>Reviewer:</strong> ${review.reviewer}</p>
            <p><strong>Rating:</strong> ${renderStars(review.rating)}</p>
            <p><strong>Comments:</strong> ${review.comments}</p>
            <p><strong>Status:</strong> ${review.status}</p>
            <p><strong>Category:</strong> ${review.category}</p>
            <button class="btn btn-danger btn-sm mt-2" onclick="deleteReview(${review.id})"><i class="bi bi-trash"></i> Delete</button>
            <button class="btn btn-secondary btn-sm mt-2 ms-2" onclick='editReview(${JSON.stringify(review)})'><i class="bi bi-pencil"></i> Edit</button>
          </div>
        </div>
      `;

      reviewCardContainer.appendChild(card);
    });
  }

  window.deleteReview = async function (id) {
    if (confirm("Are you sure you want to delete this review?")) {
      await fetchWithAuth(`${apiBaseUrl}/${id}`, { method: "DELETE" });
      await fetchReviews();
    }
  };

  window.editReview = function (review) {
    const emp = employees.find(e => e.id === review.employee_id);
    if (!emp) return;

    reviewId.value = review.id;
    employeeSelect.value = emp.id;
    employeeDepartment.value = emp.department;
    employeePosition.value = emp.position;
    employeeImage.value = emp.profile_image || "";

    // Fix date formatting for <input type="date">
    if (review.review_date) {
      const dt = new Date(review.review_date);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      reviewDate.value = `${yyyy}-${mm}-${dd}`;
    } else {
      reviewDate.value = "";
    }

    reviewer.value = review.reviewer;
    performanceRating.value = review.rating;
    reviewComments.value = review.comments;
    reviewStatus.value = review.status;
    reviewCategory.value = review.category;

    bootstrap.Modal.getOrCreateInstance(document.getElementById("addReviewModal")).show();
  };

  employeeSelect.addEventListener("change", () => {
    const selected = employees.find(e => e.id == employeeSelect.value);
    if (selected) {
      employeeDepartment.value = selected.department;
      employeePosition.value = selected.position;
      employeeImage.value = selected.profile_image || "";
    } else {
      employeeDepartment.value = "";
      employeePosition.value = "";
      employeeImage.value = "";
    }
  });

  reviewForm.addEventListener("submit", async e => {
    e.preventDefault();

    const id = reviewId.value;
    const empId = employeeSelect.value;

    if (!empId) {
      alert("Please select an employee.");
      return;
    }

    const review = {
      employee_id: parseInt(empId),
      review_date: reviewDate.value,
      reviewer: reviewer.value,
      rating: performanceRating.value,
      comments: reviewComments.value,
      status: reviewStatus.value,
      category: reviewCategory.value
    };

    console.log("Sending review data:", review);

    const res = await fetchWithAuth(id ? `${apiBaseUrl}/${id}` : apiBaseUrl, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review)
    });

    if (!res.ok) {
      alert("Failed to save review.");
      return;
    }

    reviewForm.reset();
    reviewId.value = "";
    bootstrap.Modal.getInstance(document.getElementById("addReviewModal")).hide();
    await fetchReviews();
  });

  searchInput.addEventListener("input", renderReviews);
  statusFilter.addEventListener("change", renderReviews);
  categoryFilter.addEventListener("input", renderReviews);

  fetchEmployees();
  fetchReviews();
});
