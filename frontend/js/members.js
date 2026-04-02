/* ============================================
   MEMBERS MODULE — Library Management System
   ============================================ */

let allMembers = [];
let renewMemberId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildSidebar('members');
  initMobileSidebar();
  loadMembers();
  loadExpiryBanner();

  const searchInput = document.getElementById('memberSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterMembers, 300));
  }

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', filterMembers);
  }

  // Event delegation for member table action buttons (prevents XSS via inline onclick)
  const tbody = document.getElementById('membersTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name || '';
      if (action === 'edit')       editMember(id);
      if (action === 'renew')      openRenewModal(id, name, btn.dataset.expiry || '');
      if (action === 'loans')      viewMemberLoans(id, name);
      if (action === 'deactivate') confirmDeactivate(id, name);
    });
  }
});

// ── Load members ──────────────────────────────────────────────
async function loadMembers() {
  const wrapper = document.getElementById('membersTableWrapper');
  showLoading(wrapper);

  try {
    const data = await apiGet('/members');
    allMembers = Array.isArray(data) ? data : (data.content || []);
    renderMembers(allMembers);
    updateMemberCount(allMembers.length);
  } catch (error) {
    renderMembers([]);
    updateMemberCount(0);
  } finally {
    hideLoading(wrapper);
  }
}

// ── Expiry banner (warn about members expiring in 30 days) ────
async function loadExpiryBanner() {
  try {
    const data = await apiGet('/members/expiring?days=30');
    const expiring = Array.isArray(data) ? data : [];
    const banner = document.getElementById('expiryBanner');
    const bannerText = document.getElementById('expiryBannerText');

    if (expiring.length > 0) {
      bannerText.textContent = `${expiring.length} membership${expiring.length > 1 ? 's' : ''} expiring within 30 days.`;
      banner.style.display = 'flex';
    }
  } catch (_) { /* silent — banner is non-critical */ }
}

// ── Filter ────────────────────────────────────────────────────
function filterMembers() {
  const search = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const status = document.getElementById('statusFilter')?.value || '';

  let filtered = allMembers;

  if (search) {
    filtered = filtered.filter(m =>
      (m.name || '').toLowerCase().includes(search) ||
      (m.email || '').toLowerCase().includes(search) ||
      (m.phone || '').includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter(m => m.status === status);
  }

  renderMembers(filtered);
  updateMemberCount(filtered.length);
}

function updateMemberCount(count) {
  const el = document.getElementById('memberCount');
  if (el) el.textContent = `${count} member${count !== 1 ? 's' : ''}`;
}

// ── Render table ──────────────────────────────────────────────
function renderMembers(members) {
  const tbody = document.getElementById('membersTableBody');

  if (!members || members.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No members found</h3>
            <p>Register a new member to get started.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = members.map(member => {
    const statusClass = member.status === 'ACTIVE' ? 'badge-active' :
      member.status === 'EXPIRED' ? 'badge-overdue' : 'badge-inactive';

    const expiryHtml = renderExpiryCell(member.expiryDate, member.status);

    // Use data-attributes instead of inline onclick to avoid XSS via names containing quotes
    const renewBtn = (isAdmin() && member.status !== 'INACTIVE')
      ? `<button class="btn-icon" title="Renew Membership"
           data-action="renew" data-id="${member.id}"
           data-name="${escapeHtml(member.name)}" data-expiry="${member.expiryDate || ''}">🔄</button>`
      : '';

    return `
      <tr>
        <td>
          <div class="member-cell">
            <div class="member-avatar">${getInitials(member.name)}</div>
            <div class="member-info">
              <div class="name">${escapeHtml(member.name)}</div>
              ${member.address ? `<div class="address">${escapeHtml(member.address)}</div>` : ''}
            </div>
          </div>
        </td>
        <td>${escapeHtml(member.email)}</td>
        <td>${escapeHtml(member.phone || '—')}</td>
        <td>${formatDate(member.joinedDate)}</td>
        <td>${expiryHtml}</td>
        <td><span class="badge ${statusClass}">${member.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon edit" title="Edit"
              data-action="edit" data-id="${member.id}">✏️</button>
            ${renewBtn}
            <button class="btn-icon" title="View Loans"
              data-action="loans" data-id="${member.id}" data-name="${escapeHtml(member.name)}">📋</button>
            ${isAdmin() ? `<button class="btn-icon delete" title="Deactivate"
              data-action="deactivate" data-id="${member.id}" data-name="${escapeHtml(member.name)}">🚫</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Expiry cell with colour coding ────────────────────────────
function renderExpiryCell(expiryDate, status) {
  if (!expiryDate) return '—';

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - today;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (status === 'EXPIRED' || days < 0) {
    return `<span class="expiry-tag expiry-expired">${formatDate(expiryDate)}<br><small>Expired</small></span>`;
  } else if (days <= 30) {
    return `<span class="expiry-tag expiry-soon">${formatDate(expiryDate)}<br><small>${days}d left</small></span>`;
  }
  return `<span class="expiry-tag expiry-ok">${formatDate(expiryDate)}</span>`;
}

// ── Show expiring members filter ──────────────────────────────
function showExpiringMembers() {
  document.getElementById('statusFilter').value = 'ACTIVE';
  const today30 = new Date();
  today30.setDate(today30.getDate() + 30);

  const filtered = allMembers.filter(m => {
    if (m.status !== 'ACTIVE' || !m.expiryDate) return false;
    return new Date(m.expiryDate) <= today30;
  });

  renderMembers(filtered);
  updateMemberCount(filtered.length);
}

// ── Add / Edit Member Modal ───────────────────────────────────
function openMemberModal(member = null) {
  document.getElementById('memberForm').reset();
  document.getElementById('memberId').value = '';

  if (member) {
    document.getElementById('memberModalTitle').textContent = 'Edit Member';
    document.getElementById('memberSubmitBtn').textContent = 'Update Member';
    document.getElementById('memberId').value = member.id;
    document.getElementById('memberName').value = member.name || '';
    document.getElementById('memberEmail').value = member.email || '';
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberAddress').value = member.address || '';
    document.getElementById('memberExpiry').value = member.expiryDate || '';
  } else {
    document.getElementById('memberModalTitle').textContent = 'Register New Member';
    document.getElementById('memberSubmitBtn').textContent = 'Register Member';
  }

  openModal('memberModal');
}

async function editMember(id) {
  try {
    const member = await apiGet(`/members/${id}`);
    openMemberModal(member);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function saveMember(e) {
  e.preventDefault();
  const id = document.getElementById('memberId').value;
  const submitBtn = document.getElementById('memberSubmitBtn');

  const memberData = {
    name: document.getElementById('memberName').value.trim(),
    email: document.getElementById('memberEmail').value.trim(),
    phone: document.getElementById('memberPhone').value.trim(),
    address: document.getElementById('memberAddress').value.trim(),
    expiryDate: document.getElementById('memberExpiry').value || null,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (id) {
      await apiPut(`/members/${id}`, memberData);
      showToast('Member updated successfully!', 'success');
    } else {
      await apiPost('/members', memberData);
      showToast('Member registered successfully!', 'success');
    }
    closeModal('memberModal');
    loadMembers();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = id ? 'Update Member' : 'Register Member';
  }
}

// ── Renew Membership ──────────────────────────────────────────
function openRenewModal(id, name, currentExpiry) {
  renewMemberId = id;

  document.getElementById('renewMemberName').textContent = name;
  document.getElementById('renewCurrentExpiry').textContent = currentExpiry
    ? formatDate(currentExpiry) : 'Not set';

  // Calculate new expiry: extend from current expiry or today (whichever is later)
  const base = (currentExpiry && new Date(currentExpiry) > new Date())
    ? new Date(currentExpiry)
    : new Date();
  base.setFullYear(base.getFullYear() + 1);
  document.getElementById('renewNewExpiry').textContent = formatDate(base.toISOString());

  openModal('renewModal');
}

async function confirmRenew() {
  if (!renewMemberId) return;
  const btn = document.getElementById('renewConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Renewing...';

  try {
    await apiPut(`/members/${renewMemberId}/renew`);
    showToast('Membership renewed successfully!', 'success');
    closeModal('renewModal');
    loadMembers();
    loadExpiryBanner();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '✓ Confirm Renewal';
    renewMemberId = null;
  }
}

// ── Deactivate ────────────────────────────────────────────────
function confirmDeactivate(id, name) {
  showConfirm(
    'Deactivate Member',
    `Are you sure you want to deactivate "${name}"? They will no longer be able to borrow books.`,
    () => deactivateMember(id)
  );
}

async function deactivateMember(id) {
  try {
    await apiDelete(`/members/${id}`);
    showToast('Member deactivated successfully!', 'success');
    loadMembers();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ── View Loans ────────────────────────────────────────────────
async function viewMemberLoans(memberId, memberName) {
  document.getElementById('memberLoansTitle').textContent = `Loans — ${memberName}`;
  const tbody = document.getElementById('memberLoansBody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:24px">Loading loans...</td></tr>';
  openModal('memberLoansModal');

  try {
    const loans = await apiGet(`/loans/member/${memberId}`);
    const loanList = Array.isArray(loans) ? loans : (loans.content || []);

    if (loanList.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="6">
          <div class="empty-state" style="padding:24px">
            <div class="empty-icon">📋</div>
            <h3>No loans</h3>
            <p>This member has no loan history.</p>
          </div>
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = loanList.map(loan => {
      const statusClass = loan.status === 'ACTIVE' ? 'badge-active' :
        loan.status === 'OVERDUE' ? 'badge-overdue' : 'badge-returned';
      return `
        <tr>
          <td><strong>${escapeHtml(loan.book?.title || loan.bookTitle || '—')}</strong></td>
          <td>${formatDate(loan.issueDate)}</td>
          <td>${formatDate(loan.dueDate)}</td>
          <td>${formatDate(loan.returnDate)}</td>
          <td>${loan.fineAmount > 0 ? `<span class="text-danger font-mono">${formatCurrency(loan.fineAmount)}</span>` : '—'}</td>
          <td><span class="badge ${statusClass}">${loan.status}</span></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger" style="padding:24px">${error.message}</td></tr>`;
  }
}