export function setupLogoutButton(buttonId = "logoutBtn", redirectURL = "../html/login.html") {
  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById(buttonId);

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("token");

          await fetch("http://localhost:8090/api/auth/logout", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          // Clear localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Toast
          const toastBox = document.getElementById("toastBox");
          const toastMessage = document.getElementById("toastMessage");
          toastMessage.textContent = "You’ve logged out.";
          toastBox.classList.remove("text-bg-success", "text-bg-danger");
          toastBox.classList.add("text-bg-primary");

          const toast = new bootstrap.Toast(toastBox);
          toast.show();

          setTimeout(() => {
            window.location.href = redirectURL;
          }, 1500);
        } catch (err) {
          console.error("Logout failed:", err);
          alert("Error logging out.");
        }
      });
    }
  });
}
    