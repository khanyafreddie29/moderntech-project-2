function showToast(message, type = 'primary') {
  const toastBox = document.getElementById('toastBox');
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;

  toastBox.classList.remove('text-bg-primary', 'text-bg-success', 'text-bg-danger');
  toastBox.classList.add(`text-bg-${type}`);

  const toast = new bootstrap.Toast(toastBox);
  toast.show();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch('http://localhost:8090/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || 'Login failed', 'danger');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showToast('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '../html/dashboard.html';
    }, 1500);

  } catch (error) {
    console.error(error);
    showToast('Server error. Please try again.', 'danger');
  }
});


// Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('togglePasswordIcon');
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('bi-eye');
    icon.classList.toggle('bi-eye-slash');
    icon.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});
