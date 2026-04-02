/* ============================================
   DASHBOARD MODULE — Library Management System
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildSidebar('dashboard');
  initMobileSidebar();
  loadDashboard();
  setCurrentDate();
  setWelcomeMessage();
});

function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

function setWelcomeMessage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('welcomeMsg');
  if (el) {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    el.textContent = `${greeting}, ${user.username || 'User'}! 👋`;
  }
}

async function loadDashboard() {
  try {
    const stats = await apiGet('/dashboard/stats');
    animateCounter('totalBooks', stats.totalBooks || 0);
    animateCounter('totalMembers', stats.totalMembers || 0);
    animateCounter('activeLoans', stats.activeLoans || 0);
    animateCounter('overdueLoans', stats.overdueLoans || 0);

    renderRecentLoans(stats.recentLoans || []);
  } catch (error) {
    // If API is not available, show sample data
    document.getElementById('totalBooks').textContent = '0';
    document.getElementById('totalMembers').textContent = '0';
    document.getElementById('activeLoans').textContent = '0';
    document.getElementById('overdueLoans').textContent = '0';

    const tbody = document.getElementById('recentLoansBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state" style="padding:32px">
            <div class="empty-icon">📋</div>
            <h3>No activity yet</h3>
            <p>Recent loan activities will appear here once the backend is connected.</p>
          </div>
        </td>
      </tr>
    `;
  }
}

function renderRecentLoans(loans) {
  const tbody = document.getElementById('recentLoansBody');

  if (!loans || loans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state" style="padding:32px">
            <div class="empty-icon">📋</div>
            <h3>No recent activity</h3>
            <p>Issue a book to see activity here.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = loans.map(loan => {
    const statusClass = loan.status === 'ACTIVE' ? 'badge-active' :
                        loan.status === 'OVERDUE' ? 'badge-overdue' : 'badge-returned';
    return `
      <tr>
        <td><strong>${escapeHtml(loan.bookTitle || loan.book?.title || '—')}</strong></td>
        <td>${escapeHtml(loan.memberName || loan.member?.name || '—')}</td>
        <td>${formatDate(loan.issueDate)}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="badge ${statusClass}">${loan.status}</span></td>
      </tr>
    `;
  }).join('');
}

function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 800;
  const start = performance.now();
  const startVal = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
