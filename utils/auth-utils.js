// auth-utils.js (no export, use global functions)

function getToken() {
  return localStorage.getItem("token");
}

function fetchWithAuth(url, options = {}) {
  const token = getToken();
  if (!token) {
    alert("Not authenticated. Please log in.");
    window.location.href = "../html/login.html";
    throw new Error("No token");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return fetch(url, { ...options, headers }).then(async (res) => {
    if (res.status === 401 || res.status === 403) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "../html/login.html";
      throw new Error("Unauthorized");
    }
    return res;
  });
}

// 👇 Make it available globally
window.fetchWithAuth = fetchWithAuth;
