/* ============================================
   OVERDUE REPORT — Library Management System
   ============================================ */

let allOverdueLoans = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    buildSidebar('reports'); // 'reports' highlights the Reports nav item correctly
    initMobileSidebar();
    loadOverdueReport();
});

// ── Load report data ──────────────────────────────────────────
async function loadOverdueReport() {
    const wrapper = document.getElementById('reportTableWrapper');
    showLoading(wrapper);
    wrapper.style.display = 'block';

    try {
        const data = await apiGet('/reports/overdue');
        allOverdueLoans = Array.isArray(data) ? data : (data.content || []);
        renderStats(allOverdueLoans);
        renderReportTable(allOverdueLoans);
    } catch (error) {
        showToast(error.message || 'Failed to load overdue report.', 'error');
        renderReportTable([]);
    } finally {
        hideLoading(wrapper);
    }
}

// ── Stats cards ───────────────────────────────────────────────
function renderStats(loans) {
    const critical = loans.filter(l => daysOverdue(l) > 14).length;
    const warning = loans.filter(l => daysOverdue(l) >= 7 && daysOverdue(l) <= 14).length;
    const totalFine = loans.reduce((sum, l) => sum + (l.fineAmount || 0), 0);

    setText('statTotal', loans.length);
    setText('statCritical', critical);
    setText('statWarning', warning);
    setText('statFine', formatCurrency(totalFine));
}

// ── Render table ──────────────────────────────────────────────
function renderReportTable(loans) {
    const tbody = document.getElementById('reportTableBody');
    const wrapper = document.getElementById('reportTableWrapper');
    const empty = document.getElementById('reportEmpty');

    if (!loans || loans.length === 0) {
        wrapper.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    wrapper.style.display = 'block';
    empty.style.display = 'none';

    tbody.innerHTML = loans.map((loan, i) => {
        const days = daysOverdue(loan);
        const severity = getSeverity(days);
        const rowClass = severity === 'critical' ? 'overdue-critical' : '';

        return `
      <tr class="${rowClass}">
        <td style="color:var(--text-muted);font-size:0.8125rem;">${i + 1}</td>
        <td><strong>${escapeHtml(loan.member?.name || loan.memberName || '—')}</strong></td>
        <td>${escapeHtml(loan.book?.title || loan.bookTitle || '—')}</td>
        <td>${formatDate(loan.dueDate)}</td>
        <td><span class="days-indicator ${severity}">${days} day${days !== 1 ? 's' : ''}</span></td>
        <td class="text-danger font-mono">${formatCurrency(loan.fineAmount || 0)}</td>
        <td><span class="badge badge-overdue">${severity === 'critical' ? 'CRITICAL' : 'OVERDUE'}</span></td>
      </tr>
    `;
    }).join('');
}

// ── Client-side filter ────────────────────────────────────────
function filterReport() {
    const text = document.getElementById('reportFilter').value.toLowerCase().trim();
    const severity = document.getElementById('reportSeverity').value;

    const filtered = allOverdueLoans.filter(loan => {
        const name = (loan.member?.name || loan.memberName || '').toLowerCase();
        const title = (loan.book?.title || loan.bookTitle || '').toLowerCase();

        const matchText = !text || name.includes(text) || title.includes(text);
        const matchSeverity = !severity || getSeverity(daysOverdue(loan)) === severity;

        return matchText && matchSeverity;
    });

    renderReportTable(filtered);
}

// ── Export PDF ────────────────────────────────────────────────
async function exportPdf() {
    const btn = document.getElementById('exportBtn');
    btn.disabled = true;
    btn.textContent = 'Generating…';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/reports/overdue/export/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Export failed. Please try again.');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `overdue-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '⬇ Export PDF';
    }
}

// ── Helpers ───────────────────────────────────────────────────
function daysOverdue(loan) {
    return Math.abs(daysFromNow(loan.dueDate));
}

function getSeverity(days) {
    if (days > 14) return 'critical';
    if (days >= 7) return 'warning';
    return 'mild';
}

// setText is defined in utils.js — no duplicate needed here