/* ============================================
   AUTH MODULE — Library Management System
   Login, Logout, JWT storage, Auth guards
   ============================================ */

// ── Login Handler ──
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value; // Do NOT trim — spaces are valid in passwords
  const loginBtn = document.getElementById('loginBtn');
  const errorDiv = document.getElementById('loginError');

  // Validation
  if (!username || !password) {
    const errorMsg = document.getElementById('loginErrorMsg');
    if (errorMsg) {
      errorMsg.textContent = 'Please enter both username and password.';
    } else {
      errorDiv.textContent = 'Please enter both username and password.';
    }
    errorDiv.classList.remove('hidden');
    return;
  }

  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Signing in...';
  errorDiv.classList.add('hidden');

  try {
    const data = await apiPost('/auth/login', { username, password });

    // Store the minimal session data we already have so we can redirect immediately.
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      role: data.role,
      profilePicture: null,
      fullName: null,
    }));

    // Redirect based on role
    const role = data.role.toUpperCase();
    if (role === 'MEMBER') {
      window.location.href = 'books.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    const errorMsg = document.getElementById('loginErrorMsg');
    if (errorMsg) {
      errorMsg.textContent = error.message || 'Invalid username or password.';
    } else {
      errorDiv.textContent = error.message || 'Invalid username or password.';
    }
    errorDiv.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Sign In';

    // Shake animation
    const form = document.querySelector('.login-form');
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 600);
  }
}

// ── Logout ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ── Auth Guard — call on every protected page ──
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ── Redirect if already logged in ──
function redirectIfLoggedIn() {
  const token = localStorage.getItem('token');
  if (token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (user.role || 'MEMBER').toUpperCase();
    if (role === 'MEMBER') {
      window.location.href = 'books.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }
}

// ── Init Login Page ──
function initLoginPage() {
  redirectIfLoggedIn();

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  // Password visibility toggle
  const toggleBtn = document.getElementById('togglePassword');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const pwInput = document.getElementById('password');
      const isPassword = pwInput.type === 'password';
      pwInput.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🙈' : '👁';
    });
  }
}
