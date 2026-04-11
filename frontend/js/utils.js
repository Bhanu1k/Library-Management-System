/* ============================================
   UTILITY HELPERS — Library Management System
   ============================================ */

// ── Toast Notifications ──
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Confirm Dialog ──
function showConfirm(title, message, onConfirm) {
  const existing = document.querySelector('.confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon">⚠</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
        <button class="btn btn-danger" id="confirmOk">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  overlay.querySelector('#confirmCancel').onclick = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.querySelector('#confirmOk').onclick = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onConfirm) onConfirm();
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

// ── Date Formatting ──
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  });
}

function daysFromNow(dateStr) {
  if (!dateStr) return 0;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

// ── Currency Formatting ──
function formatCurrency(amount) {
  return `₹${parseFloat(amount || 0).toFixed(2)}`;
}

// ── Loading State ──
function showLoading(container) {
  const existing = container.querySelector('.loading-overlay');
  if (existing) return;

  const loader = document.createElement('div');
  loader.className = 'loading-overlay';
  loader.innerHTML = '<div class="spinner"></div>';
  container.style.position = 'relative';
  container.appendChild(loader);
}

function hideLoading(container) {
  const loader = container.querySelector('.loading-overlay');
  if (loader) loader.remove();
}

// ── Modal Helper ──
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => {
    m.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// ── Tab Switching ──
function initTabs(tabsContainer) {
  const btns = tabsContainer.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.remove('active');
      });
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });
}

// ── Debounce ──
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Get Initials ──
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Escape HTML ──
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Time Ago ──
function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)    return 'Just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function getBackendBaseUrl() {
  return API_BASE.replace('/api', '');
}

function getProfilePictureVersion() {
  return localStorage.getItem('profilePictureVersion') || '1';
}

function setProfilePictureVersion(version = Date.now().toString()) {
  localStorage.setItem('profilePictureVersion', version);
}

function getProfileImageUrl(path) {
  if (!path) return '';
  const separator = path.includes('?') ? '&' : '?';
  return `${getBackendBaseUrl()}${path}${separator}_v=${getProfilePictureVersion()}`;
}

// ── Build Sidebar ──
function buildSidebar(activePage) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || 'MEMBER').toUpperCase();
  
  console.log('[buildSidebar] user from localStorage:', user);
  console.log('[buildSidebar] profilePicture:', user.profilePicture);

  const navItems = [];

  if (role === 'ADMIN' || role === 'LIBRARIAN') {
    navItems.push({ href: 'dashboard.html', icon: '📊', label: 'Dashboard', id: 'dashboard' });
  }

  navItems.push({ href: 'books.html', icon: '📚', label: 'Books', id: 'books' });

  if (role === 'ADMIN' || role === 'LIBRARIAN') {
    navItems.push({ href: 'members.html', icon: '👥', label: 'Members', id: 'members' });
  }

  navItems.push({ href: 'loans.html', icon: '🔄', label: role === 'MEMBER' ? 'My Loans' : 'Loans', id: 'loans' });
  navItems.push({ href: 'Notifications.html', icon: '🔔', label: 'Notifications', id: 'notifications' });
  navItems.push({ href: 'profile.html', icon: '👤', label: 'Profile', id: 'profile' });

  if (role === 'ADMIN' || role === 'LIBRARIAN') {
    navItems.push({ href: 'Reports.html', icon: '📈', label: 'Reports', id: 'reports' });
  }

  if (role === 'ADMIN') {
    navItems.push({ href: 'users.html', icon: '🛠️', label: 'Users', id: 'users' });
  }

  const navHtml = navItems.map(item => `
    <a href="${item.href}" class="nav-item ${item.id === activePage ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="brand-icon">📖</div>
        <div class="brand-text">
          LibraryMS
          <span>Management System</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-label">Main Menu</div>
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
                  <div class="sidebar-user">
          <div class="user-avatar">${user.profilePicture
            ? `<img src="${getProfileImageUrl(user.profilePicture)}" alt="${escapeHtml(user.username)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="user-avatar" style="display:none;"></div>`
            : ''}</div>
                  <div class="user-info">
          <div class="user-name">${escapeHtml(user.username || 'User')}</div>
          <div class="user-role">${role}</div>
          </div>
        </div>
        <a href="#" class="nav-item" onclick="logout(); return false;" style="margin-top:8px;">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </a>
      </div>
    `;
  }

  // Inject notification bell into header on every page
  injectGlobalBell();
}

function validateProfileImage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.profilePicture) return;

  const img = new Image();
  img.onload = () => console.log('[Profile] Image loaded OK:', user.profilePicture);
  img.onerror = () => {
    console.warn('[Profile] Image failed to load, clearing stale path');
    user.profilePicture = null;
    localStorage.setItem('user', JSON.stringify(user));
    const active = document.querySelector('.sidebar .nav-item.active');
    const href = active?.getAttribute('href') || 'profile.html';
    buildSidebar(href.replace('.html', '').toLowerCase());
  };
  img.src = getProfileImageUrl(user.profilePicture);
}

// ── Global Notification Bell ──
function injectGlobalBell() {
  if (document.getElementById('notifBellBtn')) return;

  // Find or create the header-actions container
  let headerActions = document.getElementById('headerActions');

  if (!headerActions) {
    // Try other known IDs
    headerActions = document.getElementById('loanActions');
  }

  if (!headerActions) {
    // Find .header-actions by class
    headerActions = document.querySelector('.header-actions');
  }

  if (!headerActions) {
    // Last resort: create one inside .top-header
    const topHeader = document.querySelector('.top-header');
    if (!topHeader) return;
    headerActions = document.createElement('div');
    headerActions.className = 'header-actions';
    headerActions.id = 'headerActions';
    topHeader.appendChild(headerActions);
  }

  // Ensure it has an id for future lookups
  if (!headerActions.id) headerActions.id = 'headerActions';

  headerActions.insertAdjacentHTML('afterbegin', `
    <div class="notif-bell-wrap">
      <button id="notifBellBtn" class="btn btn-secondary"
        style="padding:8px 12px;border-radius:var(--border-radius-full);position:relative;"
        onclick="toggleGlobalBell(event)" title="Notifications">
        🔔
        <span id="notifBadge" style="position:absolute;top:-4px;right:-4px;
          background:#e74c3c;color:#fff;font-size:0.6rem;font-weight:700;
          min-width:16px;height:16px;border-radius:999px;
          display:none;align-items:center;justify-content:center;padding:0 3px;">
        </span>
      </button>
      <div id="bellDropdown" class="notif-dropdown" style="display:none;">
        <div class="notif-dropdown-header">
          <span class="notif-dropdown-title">Notifications</span>
          <div style="display:flex;gap:6px;">
            <button class="notif-action-btn" onclick="markAllReadBell()">✓ All read</button>
            <a href="Notifications.html" class="notif-action-btn">View all →</a>
          </div>
        </div>
        <div id="bellList" class="notif-dropdown-list">
          <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.875rem;">Loading...</div>
        </div>
      </div>
    </div>`);

  // Load just the unread count after first paint; fetch the full list only when opened.
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => loadBellUnreadCount(), { timeout: 2000 });
  } else {
    setTimeout(loadBellUnreadCount, 300);
  }

  // Close bell dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.notif-bell-wrap')) {
      const d = document.getElementById('bellDropdown');
      if (d) d.style.display = 'none';
    }
  });
}

async function loadBellUnreadCount() {
  try {
    const data = await apiGet('/notifications/unread-count');
    const unreadCount = data.count || 0;
    const badge = document.getElementById('notifBadge');
    if (!badge) return;

    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  } catch (_) {
    // Keep the bell quiet if the backend is unavailable.
  }
}

async function loadBellNotifications() {
  try {
    const data = await apiGet('/notifications');
    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;

    // Update badge
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Render bell list (top 6)
    const list = document.getElementById('bellList');
    if (!list) return;

    const items = notifications.slice(0, 6);
    if (!items.length) {
      list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:0.875rem;">🔔 No notifications</div>';
      return;
    }

    list.innerHTML = items.map(n => {
      const isUnread = n.status !== 'READ';
      const icon = ({ DUE_DATE_REMINDER: '📅', FINE_ALERT: '💰', NEW_BOOK_ARRIVAL: '📚' })[n.type] || '🔔';
      const time = formatTimeAgo(n.createdAt);
      return `
        <div class="notif-bell-item ${isUnread ? 'unread' : ''}">
          <span class="notif-bell-icon">${icon}</span>
          <div class="notif-bell-body">
            <div class="notif-bell-title">${escapeHtml(n.title)}</div>
            <div class="notif-bell-msg">${escapeHtml(n.message)}</div>
            <div class="notif-bell-time">${time}</div>
          </div>
          ${isUnread ? '<span class="notif-bell-dot"></span>' : ''}
        </div>`;
    }).join('');
  } catch (_) {
    const list = document.getElementById('bellList');
    if (list) list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.8125rem;">Unable to load notifications</div>';
  }
}

function toggleGlobalBell(e) {
  e.stopPropagation();
  const d = document.getElementById('bellDropdown');
  if (!d) return;
  const isOpen = d.style.display === 'block';
  d.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) loadBellNotifications(); // Refresh on open
}

async function markAllReadBell() {
  try {
    await apiPut('/notifications/read-all');
    document.querySelectorAll('#bellList .notif-bell-item').forEach(el => {
      el.classList.remove('unread');
      el.querySelector('.notif-bell-dot')?.remove();
    });
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
    showToast('All notifications marked as read.', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to mark all as read.', 'error');
  }
}

// Poll for new notifications every 60 seconds on protected pages
function startBellPolling() {
  setInterval(loadBellNotifications, 60000);
}

// ── Mobile Sidebar Toggle ──
function initMobileSidebar() {
  const hamburger = document.querySelector('.hamburger-btn');
  const sidebar = document.querySelector('.sidebar');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// ── Role Check ──
// Run on every protected page (skip login page which has no sidebar)
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = !document.querySelector('.sidebar');
  if (!isLoginPage && requireAuth()) {
    startBellPolling();
  }
});

function getUserRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (user.role || 'MEMBER').toUpperCase();
}

function isAdmin() { return getUserRole() === 'ADMIN'; }
function isLibrarian() { return getUserRole() === 'LIBRARIAN'; }
function isMember() { return getUserRole() === 'MEMBER'; }
function canManage() { return isAdmin() || isLibrarian(); }
// ── DOM Helpers ──
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = (val !== undefined && val !== null) ? val : '—'; }
function setVal(id, val)  { const el = document.getElementById(id); if (el) el.value = val || ''; }
function getVal(id)       { return document.getElementById(id)?.value?.trim() || ''; }
