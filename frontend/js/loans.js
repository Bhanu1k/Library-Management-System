/* ============================================
   LOANS MODULE — Library Management System
   ============================================ */

let returnLoanId  = null;
let payFineLoanId = null;
let waiveFineLoanId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildSidebar('loans');
  initMobileSidebar();
  applyLoanRoleRestrictions();
  loadAllLoans();

  // Event delegation for Return buttons (active + overdue tabs)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id     = parseInt(btn.dataset.id);

    if (action === 'return') {
      openReturnModal(id, btn.dataset.title, btn.dataset.member, btn.dataset.due);
    }
    if (action === 'pay-fine') {
      openPayFineModal(id, btn.dataset.member, btn.dataset.book, parseFloat(btn.dataset.fine) || 0);
    }
    if (action === 'waive-fine') {
      openWaiveFineModal(id, btn.dataset.member, btn.dataset.book, parseFloat(btn.dataset.fine) || 0);
    }
  });
});

function applyLoanRoleRestrictions() {
  if (isMember()) {
    document.getElementById('pageTitle').innerHTML = 'My Loans <span>History</span>';
    const actions = document.getElementById('loanActions');
    if (actions) actions.classList.add('hidden');

    const h1 = document.getElementById('activeActionsHeader');
    const h2 = document.getElementById('overdueActionsHeader');
    if (h1) h1.classList.add('hidden');
    if (h2) h2.classList.add('hidden');
  }
}

async function loadAllLoans() {
  await Promise.all([
    loadActiveLoans(),
    loadOverdueLoans(),
    loadFines(),
    loadHistoryLoans(),
  ]);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

  const tabMap = { active: 'activeTab', overdue: 'overdueTab', fines: 'finesTab', history: 'historyTab' };
  document.querySelector(`[data-tab="${tabMap[tab]}"]`)?.classList.add('active');
  document.getElementById(tabMap[tab])?.classList.add('active');
}

// ── Active Loans ──────────────────────────────────────────────
async function loadActiveLoans() {
  const wrapper = document.getElementById('activeTableWrapper');
  showLoading(wrapper);
  try {
    const data  = await apiGet('/loans?status=ACTIVE');
    const loans = Array.isArray(data) ? data : (data.content || []);
    renderActiveLoans(loans);
  } catch (error) {
    renderActiveLoans([]);
  } finally {
    hideLoading(wrapper);
  }
}

function renderActiveLoans(loans) {
  const tbody  = document.getElementById('activeLoansBody');
  const colSpan = isMember() ? 6 : 7;

  if (!loans.length) {
    tbody.innerHTML = `<tr><td colspan="${colSpan}"><div class="empty-state"><div class="empty-icon">✅</div><h3>No active loans</h3><p>All books have been returned!</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = loans.map(loan => {
    const days = daysFromNow(loan.dueDate);
    let daysClass = 'safe', daysText = `${days} days left`;
    if (days <= 0)  { daysClass = 'danger';  daysText = `${Math.abs(days)} days overdue`; }
    else if (days <= 3) { daysClass = 'warning'; }

    const actionsHtml = isMember() ? '' : `
      <td>
        <button class="btn-return"
          data-action="return"
          data-id="${loan.id}"
          data-title="${escapeHtml(loan.book?.title || loan.bookTitle || '')}"
          data-member="${escapeHtml(loan.member?.name || loan.memberName || '')}"
          data-due="${loan.dueDate || ''}">Return</button>
      </td>
    `;

    return `
      <tr class="${days <= 0 ? 'overdue-row' : ''}">
        <td><strong>${escapeHtml(loan.book?.title || loan.bookTitle || '—')}</strong></td>
        <td>${escapeHtml(loan.member?.name || loan.memberName || '—')}</td>
        <td>${formatDate(loan.issueDate)}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="days-indicator ${daysClass}">${daysText}</span></td>
        <td><span class="badge badge-active">ACTIVE</span></td>
        ${actionsHtml}
      </tr>
    `;
  }).join('');
}

// ── Overdue Loans ─────────────────────────────────────────────
async function loadOverdueLoans() {
  const wrapper = document.getElementById('overdueTableWrapper');
  showLoading(wrapper);
  try {
    const data  = await apiGet('/loans/overdue');
    const loans = Array.isArray(data) ? data : (data.content || []);
    renderOverdueLoans(loans);
  } catch (error) {
    renderOverdueLoans([]);
  } finally {
    hideLoading(wrapper);
  }
}

function renderOverdueLoans(loans) {
  const tbody   = document.getElementById('overdueLoansBody');
  const colSpan = isMember() ? 6 : 7;

  if (!loans.length) {
    tbody.innerHTML = `<tr><td colspan="${colSpan}"><div class="empty-state"><div class="empty-icon">🎉</div><h3>No overdue loans</h3><p>Great! All books are returned on time.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = loans.map(loan => {
    const daysOverdue   = Math.abs(daysFromNow(loan.dueDate));
    const estimatedFine = Math.min(daysOverdue * 5, 500);

    const actionsHtml = isMember() ? '' : `
      <td>
        <button class="btn-return"
          data-action="return"
          data-id="${loan.id}"
          data-title="${escapeHtml(loan.book?.title || loan.bookTitle || '')}"
          data-member="${escapeHtml(loan.member?.name || loan.memberName || '')}"
          data-due="${loan.dueDate || ''}">Return</button>
      </td>
    `;

    return `
      <tr class="overdue-row">
        <td><strong>${escapeHtml(loan.book?.title || loan.bookTitle || '—')}</strong></td>
        <td>${escapeHtml(loan.member?.name || loan.memberName || '—')}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="days-indicator danger">${daysOverdue} days</span></td>
        <td><span class="text-danger font-mono">${formatCurrency(estimatedFine)}</span></td>
        <td><span class="badge badge-overdue">OVERDUE</span></td>
        ${actionsHtml}
      </tr>
    `;
  }).join('');
}

// ── Fines Tab ─────────────────────────────────────────────────
async function loadFines() {
  const wrapper = document.getElementById('finesTableWrapper');
  showLoading(wrapper);
  try {
    const data  = await apiGet('/loans/fines/unpaid');
    const loans = Array.isArray(data) ? data : (data.content || []);
    renderFines(loans);
  } catch (error) {
    renderFines([]);
  } finally {
    hideLoading(wrapper);
  }
}

function renderFines(loans) {
  const tbody = document.getElementById('finesTableBody');

  if (!loans.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <h3>No unpaid fines</h3>
          <p>All fines have been cleared.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = loans.map(loan => {
    const memberName = escapeHtml(loan.member?.name || loan.memberName || '—');
    const bookTitle  = escapeHtml(loan.book?.title  || loan.bookTitle  || '—');
    const fine       = loan.fineAmount || 0;

    const fineStatusHtml = loan.fineWaived
      ? `<span class="badge badge-returned">WAIVED</span>`
      : loan.finePaid
        ? `<span class="badge badge-active">PAID</span>`
        : `<span class="badge badge-overdue">UNPAID</span>`;

    // Use data-attributes to avoid XSS — member/book names may contain quotes
    const actionsHtml = isMember() ? '' : `
      <div class="table-actions">
        <button class="btn btn-secondary" style="padding:5px 12px;font-size:0.8rem;"
          data-action="pay-fine" data-id="${loan.id}" data-fine="${fine}"
          data-member="${memberName}" data-book="${bookTitle}">
          💵 Mark Paid
        </button>
        ${isAdmin() ? `
        <button class="btn btn-secondary" style="padding:5px 12px;font-size:0.8rem;color:var(--warning,#e67e22);"
          data-action="waive-fine" data-id="${loan.id}" data-fine="${fine}"
          data-member="${memberName}" data-book="${bookTitle}">
          ✕ Waive
        </button>` : ''}
      </div>
    `;

    return `
      <tr>
        <td><strong>${memberName}</strong></td>
        <td>${bookTitle}</td>
        <td>${formatDate(loan.returnDate)}</td>
        <td><span class="text-danger font-mono">${formatCurrency(fine)}</span></td>
        <td>${fineStatusHtml}</td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  }).join('');
}

// ── History ───────────────────────────────────────────────────
async function loadHistoryLoans() {
  const wrapper = document.getElementById('historyTableWrapper');
  showLoading(wrapper);
  try {
    const data  = await apiGet('/loans?status=RETURNED');
    const loans = Array.isArray(data) ? data : (data.content || []);
    renderHistoryLoans(loans);
  } catch (error) {
    renderHistoryLoans([]);
  } finally {
    hideLoading(wrapper);
  }
}

function renderHistoryLoans(loans) {
  const tbody = document.getElementById('historyLoansBody');

  if (!loans.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📋</div><h3>No loan history</h3><p>Returned loans will appear here.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = loans.map(loan => {
    const statusClass = loan.status === 'RETURNED' ? 'badge-returned' : 'badge-active';

    let fineStatusHtml = '—';
    if (loan.fineAmount > 0) {
      if (loan.fineWaived)   fineStatusHtml = `<span class="badge badge-returned">WAIVED</span>`;
      else if (loan.finePaid) fineStatusHtml = `<span class="badge badge-active">PAID</span>`;
      else                   fineStatusHtml = `<span class="badge badge-overdue">UNPAID</span>`;
    }

    return `
      <tr>
        <td><strong>${escapeHtml(loan.book?.title || loan.bookTitle || '—')}</strong></td>
        <td>${escapeHtml(loan.member?.name || loan.memberName || '—')}</td>
        <td>${formatDate(loan.issueDate)}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td>${formatDate(loan.returnDate)}</td>
        <td>${loan.fineAmount > 0 ? `<span class="text-danger font-mono">${formatCurrency(loan.fineAmount)}</span>` : '<span class="text-success">₹0.00</span>'}</td>
        <td>${fineStatusHtml}</td>
        <td><span class="badge ${statusClass}">${loan.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ── Issue Book ────────────────────────────────────────────────
async function openIssueModal() {
  document.getElementById('issueForm').reset();
  document.getElementById('issueSummary').classList.add('hidden');
  document.getElementById('bookAvailability').textContent = '';
  openModal('issueModal');

  try {
    const [booksData, membersData] = await Promise.all([
      apiGet('/books?size=1000'),
      apiGet('/members'),
    ]);

    const books   = Array.isArray(booksData)   ? booksData   : (booksData.content   || []);
    const members = Array.isArray(membersData) ? membersData : (membersData.content || []);

    const bookSelect = document.getElementById('issueBookId');
    bookSelect.innerHTML = '<option value="">— Choose a book —</option>' +
      books.filter(b => (b.availableCopies || 0) > 0).map(b =>
        `<option value="${b.id}">${escapeHtml(b.title)} — ${escapeHtml(b.author)} (${b.availableCopies} available)</option>`
      ).join('');

    const memberSelect = document.getElementById('issueMemberId');
    memberSelect.innerHTML = '<option value="">— Choose a member —</option>' +
      members.filter(m => m.status === 'ACTIVE').map(m =>
        `<option value="${m.id}">${escapeHtml(m.name)} — ${escapeHtml(m.email)}</option>`
      ).join('');

    bookSelect.addEventListener('change', updateIssueSummary);
    memberSelect.addEventListener('change', updateIssueSummary);
  } catch (error) {
    showToast('Failed to load data for issue form.', 'error');
  }
}

function updateIssueSummary() {
  const bookId   = document.getElementById('issueBookId').value;
  const memberId = document.getElementById('issueMemberId').value;
  const summary  = document.getElementById('issueSummary');

  if (bookId && memberId) {
    const today = new Date();
    const due   = new Date(today);
    due.setDate(due.getDate() + 14);
    document.getElementById('summaryIssueDate').textContent = formatDate(today.toISOString());
    document.getElementById('summaryDueDate').textContent   = formatDate(due.toISOString());
    summary.classList.remove('hidden');
  } else {
    summary.classList.add('hidden');
  }
}

async function issueBook(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('issueSubmitBtn');
  const bookId    = document.getElementById('issueBookId').value;
  const memberId  = document.getElementById('issueMemberId').value;

  if (!bookId || !memberId) {
    showToast('Please select both a book and a member.', 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Issuing...';

  try {
    await apiPost('/loans/issue', { bookId: parseInt(bookId), memberId: parseInt(memberId) });
    showToast('Book issued successfully!', 'success');
    closeModal('issueModal');
    loadAllLoans();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Issue Book';
  }
}

// ── Return Book ───────────────────────────────────────────────
// loanData is passed from the data-attributes on the Return button
function openReturnModal(loanId, title, memberName, dueDate) {
  returnLoanId = loanId;
  document.getElementById('returnBookName').textContent   = title      || 'Book';
  document.getElementById('returnMemberName').textContent = memberName ? `Borrowed by: ${memberName}` : '';
  document.getElementById('returnDueDate').textContent    = formatDate(dueDate);
  document.getElementById('returnReturnDate').textContent = formatDate(new Date().toISOString());

  const days    = daysFromNow(dueDate);
  const fineRow = document.getElementById('fineRow');
  if (days < 0) {
    const daysOverdue = Math.abs(days);
    const fine = Math.min(daysOverdue * 5, 500);
    document.getElementById('returnFine').textContent = `${formatCurrency(fine)} (${daysOverdue} days × ₹5)`;
    fineRow.classList.remove('hidden');
  } else {
    fineRow.classList.add('hidden');
  }
  openModal('returnModal');
}

async function confirmReturn() {
  if (!returnLoanId) return;
  const btn = document.getElementById('returnConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const result = await apiPut(`/loans/return/${returnLoanId}`);
    let msg = 'Book returned successfully!';
    if (result.fineAmount && result.fineAmount > 0) {
      msg += ` Fine: ${formatCurrency(result.fineAmount)}`;
    }
    showToast(msg, 'success');
    closeModal('returnModal');
    loadAllLoans();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirm Return';
    returnLoanId = null;
  }
}

// ── Pay Fine ──────────────────────────────────────────────────
function openPayFineModal(loanId, memberName, bookTitle, fineAmount) {
  payFineLoanId = loanId;
  document.getElementById('payFineMember').textContent = memberName;
  document.getElementById('payFineBook').textContent   = bookTitle;
  document.getElementById('payFineAmount').textContent = formatCurrency(fineAmount);
  openModal('payFineModal');
}

async function confirmPayFine() {
  if (!payFineLoanId) return;
  const btn = document.getElementById('payFineConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    await apiPut(`/loans/${payFineLoanId}/pay-fine`);
    showToast('Fine marked as paid successfully!', 'success');
    closeModal('payFineModal');
    loadAllLoans();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '✓ Confirm Payment';
    payFineLoanId = null;
  }
}

// ── Waive Fine ────────────────────────────────────────────────
function openWaiveFineModal(loanId, memberName, bookTitle, fineAmount) {
  waiveFineLoanId = loanId;
  document.getElementById('waiveFineMember').textContent = memberName;
  document.getElementById('waiveFineBook').textContent   = bookTitle;
  document.getElementById('waiveFineAmount').textContent = formatCurrency(fineAmount);
  document.getElementById('waiveReason').value           = '';
  openModal('waiveFineModal');
}

async function confirmWaiveFine() {
  if (!waiveFineLoanId) return;

  const reason = document.getElementById('waiveReason').value.trim();
  if (!reason) {
    showToast('Please provide a reason for waiving the fine.', 'warning');
    return;
  }

  const btn = document.getElementById('waiveFineConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Waiving...';

  try {
    await apiPut(`/loans/${waiveFineLoanId}/waive-fine`, { reason });
    showToast('Fine waived successfully!', 'success');
    closeModal('waiveFineModal');
    loadAllLoans();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Waive Fine';
    waiveFineLoanId = null;
  }
}