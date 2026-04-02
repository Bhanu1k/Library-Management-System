document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildSidebar('books');
  initMobileSidebar();
  runSearch(0);
});

async function runSearch(page = 0) {
  const errorEl = document.getElementById('searchError');
  const resultsSection = document.getElementById('resultsSection');
  const emptyState = document.getElementById('searchEmpty');
  const tbody = document.getElementById('searchTableBody');
  const meta = document.getElementById('resultsMeta');
  const pagination = document.getElementById('searchPagination');
  const searchBtn = document.getElementById('searchBtn');

  errorEl.style.display = 'none';
  resultsSection.style.display = 'block';
  emptyState.style.display = 'none';
  tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h3>Loading results...</h3></div></td></tr>';
  searchBtn.disabled = true;

  const params = new URLSearchParams({
    page: String(page),
    size: '10',
    sortBy: document.getElementById('sSortBy').value || 'title',
    sortDir: document.getElementById('sSortDir').value || 'asc',
  });

  const queryFields = [
    ['title', 'sTitle'],
    ['author', 'sAuthor'],
    ['isbn', 'sIsbn'],
    ['category', 'sCategory'],
    ['yearFrom', 'sYearFrom'],
    ['yearTo', 'sYearTo'],
  ];

  queryFields.forEach(([param, id]) => {
    const value = document.getElementById(id)?.value?.trim();
    if (value) params.set(param, value);
  });

  if (document.getElementById('sAvailableOnly').checked) {
    params.set('availableOnly', 'true');
  }

  try {
    const data = await apiGet(`/books/search?${params.toString()}`);
    const books = Array.isArray(data.content) ? data.content : [];

    if (!books.length) {
      resultsSection.style.display = 'none';
      emptyState.style.display = 'block';
      pagination.innerHTML = '';
      return;
    }

    meta.textContent = `${data.totalElements || books.length} result${(data.totalElements || books.length) !== 1 ? 's' : ''} found`;
    tbody.innerHTML = books.map((book, index) => `
      <tr>
        <td>${page * 10 + index + 1}</td>
        <td>${escapeHtml(book.title || '—')}</td>
        <td>${escapeHtml(book.author || '—')}</td>
        <td>${escapeHtml(book.isbn || '—')}</td>
        <td>${escapeHtml(book.category || '—')}</td>
        <td>${book.publishedYear || '—'}</td>
        <td>${book.availableCopies ?? 0} / ${book.totalCopies ?? 0}</td>
      </tr>
    `).join('');

    renderSearchPagination(data.totalPages || 1, data.currentPage || 0);
  } catch (error) {
    resultsSection.style.display = 'none';
    emptyState.style.display = 'none';
    errorEl.textContent = error.message || 'Search failed.';
    errorEl.style.display = 'block';
    pagination.innerHTML = '';
  } finally {
    searchBtn.disabled = false;
  }
}

function renderSearchPagination(totalPages, currentPage) {
  const pagination = document.getElementById('searchPagination');
  if (!pagination || totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" onclick="runSearch(${currentPage - 1})" ${currentPage <= 0 ? 'disabled' : ''}>Prev</button>`;

  let ellipsisShown = false;
  for (let i = 0; i < totalPages; i++) {
    if (totalPages > 7) {
      if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="runSearch(${i})">${i + 1}</button>`;
        ellipsisShown = false;
      } else if (!ellipsisShown) {
        html += `<span style="padding:0 4px;color:var(--text-muted);">…</span>`;
        ellipsisShown = true;
      }
    } else {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="runSearch(${i})">${i + 1}</button>`;
    }
  }

  html += `<button class="page-btn" onclick="runSearch(${currentPage + 1})" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>`;
  pagination.innerHTML = html;
}

function resetSearch() {
  ['sTitle', 'sAuthor', 'sIsbn', 'sCategory', 'sPublisher', 'sYearFrom', 'sYearTo', 'sSortBy', 'sSortDir'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = id === 'sSortDir' ? 'asc' : (id === 'sSortBy' ? 'title' : '');
  });

  document.getElementById('sAvailableOnly').checked = false;
  document.getElementById('searchError').style.display = 'none';
  runSearch(0);
}
