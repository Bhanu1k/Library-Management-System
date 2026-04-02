/* ============================================
   NOTIFICATIONS MODULE — Library Management System
   ============================================ */

let allNotifications = [];
let currentFilter = 'all';

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Notif] DOMContentLoaded fired');
  if (!requireAuth()) {
    console.warn('[Notif] requireAuth returned false — redirecting to login');
    return;
  }
  console.log('[Notif] Auth OK');
  buildSidebar('notifications');
  initMobileSidebar();

  // Bell is injected by buildSidebar() → injectGlobalBell() in utils.js
  console.log('[Notif] Bell button:', document.getElementById('notifBellBtn'));

  loadNotifications();
  loadPreferences();

  // Poll unread count every 60s and refresh bell
  setInterval(() => {
    apiGet('/notifications/unread-count')
      .then(d => {
        updateBellBadge(d.count || 0);
        if (typeof loadBellNotifications === 'function') loadBellNotifications();
      })
      .catch(() => {});
  }, 60000);
});

/* ── Load all notifications ─────────────────────────────────── */
async function loadNotifications() {
  const wrapper = document.getElementById('notifWrapper');
  showLoading(wrapper);
  try {
    const data = await apiGet('/notifications');
    allNotifications = data.notifications || [];
    renderNotifications(allNotifications);
    updateCount(data.unreadCount || 0, allNotifications.length);
    updateBellBadge(data.unreadCount || 0);
  } catch (error) {
    showToast(error.message || 'Failed to load notifications.', 'error');
    renderNotifications([]);
  } finally {
    hideLoading(wrapper);
  }
}

/* ── Filter tabs ─────────────────────────────────────────────── */
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('#notifTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  let filtered = allNotifications;
  if (filter === 'unread') {
    filtered = allNotifications.filter(n => n.status !== 'READ');
  } else if (filter !== 'all') {
    filtered = allNotifications.filter(n => n.type === filter);
  }

  renderNotifications(filtered);
  updateCount(
    filtered.filter(n => n.status !== 'READ').length,
    filtered.length
  );
}

/* ── Render full-page list ───────────────────────────────────── */
function renderNotifications(notifications) {
  const container = document.getElementById('notifList');

  if (!notifications || notifications.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 24px;">
        <div class="empty-icon">🔔</div>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>`;
    return;
  }

  container.innerHTML = notifications.map(n => {
    const isUnread = n.status !== 'READ';
    return `
      <div class="notif-item ${isUnread ? 'unread' : ''}" id="notif-${n.id}" onclick="markRead(${n.id})">
        <div class="notif-icon-wrap notif-type-${(n.type||'').toLowerCase()}">${getTypeIcon(n.type)}</div>
        <div class="notif-body">
          <div class="notif-header-row">
            <span class="notif-type-tag">${getTypeLabel(n.type)}</span>
            <span class="notif-time">${formatTimeAgo(n.createdAt)}</span>
          </div>
          <div class="notif-title">${escapeHtml(n.title)}</div>
          <div class="notif-message">${escapeHtml(n.message)}</div>
          <div class="notif-meta">
            <span class="notif-channel">${getChannelIcon(n.deliveryMethod)} ${n.deliveryMethod || 'IN_APP'}</span>
            ${isUnread ? '<span class="notif-unread-dot"></span>' : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── Mark single notification as read ───────────────────────── */
async function markRead(id) {
  const el = document.getElementById(`notif-${id}`);
  if (!el || !el.classList.contains('unread')) return;

  try {
    await apiPut(`/notifications/${id}/read`);
    el.classList.remove('unread');
    el.querySelector('.notif-unread-dot')?.remove();
    const n = allNotifications.find(n => n.id === id);
    if (n) n.status = 'READ';
    updateBellBadge(allNotifications.filter(n => n.status !== 'READ').length);
    if (typeof loadBellNotifications === 'function') loadBellNotifications();
  } catch (_) {}
}

/* ── Mark all as read ────────────────────────────────────────── */
async function markAllRead() {
  try {
    await apiPut('/notifications/read-all');
    allNotifications.forEach(n => n.status = 'READ');
    if (currentFilter === 'unread') {
      renderNotifications([]);
    } else {
      renderNotifications(allNotifications);
    }
    updateBellBadge(0);
    updateCount(0, allNotifications.length);
    if (typeof loadBellNotifications === 'function') loadBellNotifications();
    showToast('All notifications marked as read.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/* ── Preferences ─────────────────────────────────────────────── */
async function loadPreferences() {
  try {
    const p = await apiGet('/notifications/preferences');
    setCheck('prefDueDate',   p.dueDateReminderEnabled);
    setCheck('prefFineAlert', p.fineAlertEnabled);
    setCheck('prefNewBook',   p.newBookArrivalEnabled);
    setCheck('prefInApp',     p.deliveryMethodInApp);
    setCheck('prefEmail',     p.deliveryMethodEmail);
    setCheck('prefSms',       p.deliveryMethodSms);

    const d = document.getElementById('prefDueDays');
    if (d && p.dueDateReminderDaysBefore) d.value = p.dueDateReminderDaysBefore;

    const c = document.getElementById('prefCategories');
    if (c && p.preferredCategories) c.value = p.preferredCategories;

    const f = document.getElementById('prefFrequency');
    if (f && p.notificationFrequency) f.value = p.notificationFrequency;

    togglePrefSub('prefDueDateSub', p.dueDateReminderEnabled);
    togglePrefSub('prefNewBookSub', p.newBookArrivalEnabled);
  } catch (_) {}
}

async function savePreferences(e) {
  e.preventDefault();

  const prefs = {
    dueDateReminderEnabled:    getCheck('prefDueDate'),
    dueDateReminderDaysBefore: parseInt(document.getElementById('prefDueDays')?.value) || 3,
    fineAlertEnabled:          getCheck('prefFineAlert'),
    newBookArrivalEnabled:     getCheck('prefNewBook'),
    preferredCategories:       document.getElementById('prefCategories')?.value?.trim() || '',
    deliveryMethodInApp:       getCheck('prefInApp'),
    deliveryMethodEmail:       getCheck('prefEmail'),
    deliveryMethodSms:         getCheck('prefSms'),
    notificationFrequency:     document.getElementById('prefFrequency')?.value || 'IMMEDIATE',
  };

  try {
    await apiPut('/notifications/preferences', prefs);
    showToast('Preferences saved!', 'success');
    closeModal('prefsModal');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/* ── UI helpers ──────────────────────────────────────────────── */
function updateBellBadge(count) {
  const b = document.getElementById('notifBadge');
  if (!b) return;
  b.textContent = count > 99 ? '99+' : count;
  b.style.display = count > 0 ? 'flex' : 'none';
}

function updateCount(unread, total) {
  const el = document.getElementById('notifCount');
  if (el) el.textContent = `${total} notification${total !== 1 ? 's' : ''}${unread > 0 ? ` · ${unread} unread` : ''}`;
}

/* ── Type helpers ────────────────────────────────────────────── */
function getTypeIcon(type) {
  return ({ DUE_DATE_REMINDER: '📅', FINE_ALERT: '💰', NEW_BOOK_ARRIVAL: '📚' })[type] || '🔔';
}

function getTypeLabel(type) {
  return ({ DUE_DATE_REMINDER: 'Due Date', FINE_ALERT: 'Fine Alert', NEW_BOOK_ARRIVAL: 'New Arrival' })[type] || 'Notification';
}

function getChannelIcon(method) {
  return ({ IN_APP: '🔔', EMAIL: '📧', SMS: '📱' })[method] || '🔔';
}

function setCheck(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function getCheck(id)      { return document.getElementById(id)?.checked || false; }
function togglePrefSub(id, show) { const el = document.getElementById(id); if (el) el.style.display = show ? 'block' : 'none'; }
