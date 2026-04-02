/* ============================================
   USER MANAGEMENT — Library Management System
   Admin only — manage users, roles, status
   ============================================ */

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    if (!isAdmin()) { window.location.href = 'dashboard.html'; return; }
    buildSidebar('users');
    initMobileSidebar();
    loadUsers();

    document.getElementById('userSearch')?.addEventListener('input', debounce(filterUsers, 300));
    document.getElementById('roleFilter')?.addEventListener('change', filterUsers);
    document.getElementById('statusFilter')?.addEventListener('change', filterUsers);

    // Event delegation for user table + detail modal buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action   = btn.dataset.action;
        const id       = parseInt(btn.dataset.id);
        const username = btn.dataset.username || '';
        const role     = btn.dataset.role     || '';
        const active   = btn.dataset.active === 'true';

        if (action === 'view')   viewUser(id);
        if (action === 'role')   openRoleModal(id, username, role);
        if (action === 'toggle') toggleStatus(id, active);
    });
});

// ── Load users ────────────────────────────────────────────────
async function loadUsers() {
    const wrapper = document.getElementById('usersTableWrapper');
    showLoading(wrapper);

    try {
        const data = await apiGet('/profile/users');
        allUsers = Array.isArray(data) ? data : [];
        renderUsers(allUsers);
        updateUserCount(allUsers.length);
    } catch (error) {
        renderUsers([]);
        showToast(error.message || 'Failed to load users.', 'error');
    } finally {
        hideLoading(wrapper);
    }
}

// ── Filter ────────────────────────────────────────────────────
function filterUsers() {
    const search = (document.getElementById('userSearch')?.value || '').toLowerCase();
    const role = document.getElementById('roleFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    let filtered = allUsers;

    if (search) filtered = filtered.filter(u =>
        (u.fullName || '').toLowerCase().includes(search) ||
        (u.username || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search)
    );
    if (role) filtered = filtered.filter(u => u.role === role);
    if (status) filtered = filtered.filter(u => String(u.active) === status);

    renderUsers(filtered);
    updateUserCount(filtered.length);
}

function updateUserCount(count) {
    const el = document.getElementById('userCount');
    if (el) el.textContent = `${count} user${count !== 1 ? 's' : ''}`;
}

// ── Render table ──────────────────────────────────────────────
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (!users || users.length === 0) {
        tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      </td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const name = user.fullName || user.username;
        const avatarHtml = renderUserAvatar(user, 36);
        const statusHtml = user.active
            ? '<span class="badge badge-active">Active</span>'
            : '<span class="badge badge-inactive">Inactive</span>';

        return `
      <tr>
        <td>
          <div class="member-cell">
            ${avatarHtml}
            <div class="member-info">
              <div class="name">${escapeHtml(name)}</div>
            </div>
          </div>
        </td>
        <td><code style="font-size:0.8125rem;color:var(--text-muted);">${escapeHtml(user.username)}</code></td>
        <td>${escapeHtml(user.email || '—')}</td>
        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
        <td>${statusHtml}</td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" title="View details"
              data-action="view" data-id="${user.id}">👁</button>
            <button class="btn-icon edit" title="Change role"
              data-action="role" data-id="${user.id}"
              data-username="${escapeHtml(user.username)}" data-role="${user.role}">🔑</button>
            <button class="btn-icon ${user.active ? 'delete' : ''}" title="${user.active ? 'Deactivate' : 'Activate'}"
              data-action="toggle" data-id="${user.id}" data-active="${user.active}">
              ${user.active ? '🚫' : '✅'}
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

// ── Render inline avatar ──────────────────────────────────────
function renderUserAvatar(user, size = 36) {
    const name = user.fullName || user.username;
    if (user.profilePicture) {
        return `<img class="user-avatar" style="width:${size}px;height:${size}px;"
      src="${API_BASE.replace('/api', '')}${user.profilePicture}"
      alt="${escapeHtml(name)}"
      onerror="this.outerHTML='<div class=\\'user-avatar-initials\\' style=\\'width:${size}px;height:${size}px;\\'>${getInitials(name)}</div>'" />`;
    }
    return `<div class="user-avatar-initials" style="width:${size}px;height:${size}px;">${getInitials(name)}</div>`;
}

// ── View user detail modal ────────────────────────────────────
async function viewUser(id) {
    try {
        const user = await apiGet(`/profile/users/${id}`);
        const name = user.fullName || user.username;

        // Avatar
        const avatarContainer = document.getElementById('detailAvatar');
        if (user.profilePicture) {
            avatarContainer.innerHTML = `<img style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--border-color,#e8ecf0);"
        src="${API_BASE.replace('/api', '')}${user.profilePicture}" alt="${escapeHtml(name)}"
        onerror="this.outerHTML='<div style=\\'width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#2d5f9e);color:#fff;font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;\\'>${getInitials(name)}</div>'" />`;
        } else {
            avatarContainer.innerHTML = `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#2d5f9e);color:#fff;font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;">${getInitials(name)}</div>`;
        }

        document.getElementById('detailName').textContent = name;
        document.getElementById('detailEmail').textContent = user.email || '—';

        const badge = document.getElementById('detailRoleBadge');
        badge.textContent = user.role;
        badge.className = `role-badge role-${user.role}`;

        document.getElementById('detailRows').innerHTML = `
      <div class="summary-row"><span>Username</span><strong>${escapeHtml(user.username)}</strong></div>
      <div class="summary-row"><span>Phone</span><strong>${escapeHtml(user.phone || '—')}</strong></div>
      <div class="summary-row"><span>Status</span><strong>${user.active ? '✅ Active' : '❌ Inactive'}</strong></div>
      <div class="summary-row"><span>Member ID</span><strong>${user.memberId || '—'}</strong></div>
      <div class="summary-row"><span>Joined</span><strong>${formatDate(user.createdAt)}</strong></div>
    `;

        document.getElementById('detailFooter').innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal('userDetailModal')">Close</button>
      <button class="btn btn-primary"
        data-action="role" data-id="${user.id}"
        data-username="${escapeHtml(user.username)}" data-role="${user.role}"
        onclick="closeModal('userDetailModal')">Change Role</button>
    `;

        openModal('userDetailModal');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ── Role modal ────────────────────────────────────────────────
function openRoleModal(userId, username, currentRole) {
    document.getElementById('roleModalUserId').value = userId;
    document.getElementById('roleModalUsername').textContent = username;
    document.getElementById('selectedRole').value = currentRole;
    document.getElementById('saveRoleBtn').disabled = true;

    // Highlight current role
    document.querySelectorAll('.role-option').forEach(el => {
        el.classList.toggle('active', el.dataset.role === currentRole);
    });

    openModal('roleModal');
}

function selectRole(role, el) {
    document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('selectedRole').value = role;
    document.getElementById('saveRoleBtn').disabled = false;
}

async function saveRole() {
    const id = document.getElementById('roleModalUserId').value;
    const role = document.getElementById('selectedRole').value;
    const btn = document.getElementById('saveRoleBtn');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        await apiPut(`/profile/users/${id}/role`, { role });
        const u = allUsers.find(u => String(u.id) === String(id));
        if (u) u.role = role;
        renderUsers(filterCurrent());
        showToast('User role updated successfully!', 'success');
        closeModal('roleModal');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Role';
    }
}

// ── Toggle active status ──────────────────────────────────────
function toggleStatus(id, currentActive) {
    const action = currentActive ? 'deactivate' : 'activate';
    showConfirm(
        `${currentActive ? 'Deactivate' : 'Activate'} User`,
        `Are you sure you want to ${action} this user?`,
        () => doToggleStatus(id, !currentActive)
    );
}

async function doToggleStatus(id, newActive) {
    try {
        await apiPut(`/profile/users/${id}/status`, { active: newActive });
        const u = allUsers.find(u => String(u.id) === String(id));
        if (u) u.active = newActive;
        renderUsers(filterCurrent());
        showToast(`User ${newActive ? 'activated' : 'deactivated'} successfully!`, 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ── Re-apply current filters to allUsers ──────────────────────
function filterCurrent() {
    const search = (document.getElementById('userSearch')?.value || '').toLowerCase();
    const role = document.getElementById('roleFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    let filtered = allUsers;
    if (search) filtered = filtered.filter(u => (u.fullName || '').toLowerCase().includes(search) || (u.username || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search));
    if (role) filtered = filtered.filter(u => u.role === role);
    if (status) filtered = filtered.filter(u => String(u.active) === status);
    return filtered;
}