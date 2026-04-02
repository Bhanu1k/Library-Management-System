/* ============================================
   BOOKS MODULE — Library Management System
   ============================================ */

let allBooks = [];
let currentPage = 0;
const pageSize = 10;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildSidebar('books');
  initMobileSidebar();
  applyRoleRestrictions();
  loadBooks();

  // Search with debounce
  const searchInput = document.getElementById('bookSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentPage = 0;
      loadBooks();
    }, 300));
  }

  // Category filter
  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', () => {
      currentPage = 0;
      loadBooks();
    });
  }

  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.addEventListener('change', () => {
      currentPage = 0;
      loadBooks();
    });
  }

  const sortDir = document.getElementById('sortDir');
  if (sortDir) {
    sortDir.addEventListener('change', () => {
      currentPage = 0;
      loadBooks();
    });
  }

  // Event delegation for book table action buttons
  const tbody = document.getElementById('booksTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;
      const action = btn.dataset.action;
      const id     = parseInt(btn.dataset.id);
      const title  = btn.dataset.title || '';
      if (action === 'borrow')      borrowBook(id);
      if (action === 'edit-book')   editBook(id);
      if (action === 'delete-book') confirmDeleteBook(id, title);
    });
  }
});

function applyRoleRestrictions() {
  if (isMember()) {
    const actions = document.getElementById('bookActions');
    if (actions) actions.classList.add('hidden');
  }
}

async function loadBooks() {
  const wrapper = document.getElementById('booksTableWrapper');
  showLoading(wrapper);

  try {
    const search = document.getElementById('bookSearch')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'title';
    const sortDir = document.getElementById('sortDir')?.value || 'asc';

    let endpoint = `/books/search?page=${currentPage}&size=${pageSize}`;
    if (search) endpoint += `&query=${encodeURIComponent(search)}`;
    if (category) endpoint += `&category=${encodeURIComponent(category)}`;
    endpoint += `&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(sortDir)}`;

    const data = await apiGet(endpoint);

    // Handle paginated or array response
    if (data.content) {
      allBooks = data.content;
      renderBooks(allBooks);
      renderPagination(data.totalPages || 1, data.currentPage || 0);
      updateBookCount(data.totalElements || allBooks.length);
      updateCategories(allBooks);
    } else if (Array.isArray(data)) {
      allBooks = data;
      renderBooks(allBooks);
      updateBookCount(allBooks.length);
      updateCategories(allBooks);
    }
  } catch (error) {
    renderBooks([]);
    updateBookCount(0);
  } finally {
    hideLoading(wrapper);
  }
}

function updateBookCount(count) {
  const el = document.getElementById('bookCount');
  if (el) el.textContent = `${count} book${count !== 1 ? 's' : ''} total`;
}

function updateCategories(books) {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  const currentVal = select.value;
  const categories = [...new Set(books.map(b => b.category).filter(Boolean))].sort();
  const options = '<option value="">All Categories</option>' +
    categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
  select.innerHTML = options;
}

function renderBooks(books) {
  const tbody = document.getElementById('booksTableBody');

  if (!books || books.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${isMember() ? 6 : 7}">
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No books found</h3>
            <p>Try adjusting your search or add a new book to the catalog.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = books.map(book => {
    const available = book.availableCopies ?? 0;
    const total = book.totalCopies ?? 0;
    let stockClass = 'in-stock';
    if (available === 0) stockClass = 'out-of-stock';
    else if (available <= 1) stockClass = 'low-stock';

    let actionsHtml = '';
    if (isMember()) {
      actionsHtml = `
        <td>
          <button class="btn btn-primary" style="padding:6px 14px;font-size:0.85rem;"
            data-action="borrow" data-id="${book.id}"
            ${available === 0 ? 'disabled' : ''}>${available === 0 ? 'Out of Stock' : 'Borrow'}</button>
        </td>
      `;
    } else {
      actionsHtml = `
        <td>
          <div class="table-actions">
            <button class="btn-icon edit" title="Edit"
              data-action="edit-book" data-id="${book.id}">✏️</button>
            ${isAdmin() ? `<button class="btn-icon delete" title="Delete"
              data-action="delete-book" data-id="${book.id}"
              data-title="${escapeHtml(book.title)}">🗑️</button>` : ''}
          </div>
        </td>
      `;
    }

    return `
      <tr>
        <td>
          <div class="book-title-cell">
            <span class="title">${escapeHtml(book.title)}</span>
            ${book.description ? `<span class="subtitle">${escapeHtml(book.description)}</span>` : ''}
          </div>
        </td>
        <td>${escapeHtml(book.author)}</td>
        <td><code style="font-size:0.8125rem;color:var(--text-muted);">${escapeHtml(book.isbn)}</code></td>
        <td>${book.category ? `<span class="category-tag">${escapeHtml(book.category)}</span>` : '—'}</td>
        <td>
          <span class="availability ${stockClass}">
            <span class="avail-dot"></span>
            ${available} / ${total}
          </span>
        </td>
        <td>${book.publishedYear || '—'}</td>
        ${actionsHtml}
      </tr>
    `;
  }).join('');
}

function renderPagination(totalPages, current) {
  const container = document.getElementById('booksPagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" onclick="goToPage(${current - 1})" ${current <= 0 ? 'disabled' : ''}>‹</button>`;

  let ellipsisShown = false;
  for (let i = 0; i < totalPages; i++) {
    if (totalPages > 7) {
      if (i === 0 || i === totalPages - 1 || (i >= current - 1 && i <= current + 1)) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
        ellipsisShown = false;
      } else if (!ellipsisShown) {
        html += `<span style="padding:0 4px;color:var(--text-muted);">…</span>`;
        ellipsisShown = true;
      }
    } else {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
    }
  }

  html += `<button class="page-btn" onclick="goToPage(${current + 1})" ${current >= totalPages - 1 ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  loadBooks();
}

// ── Modal Operations ──

function openBookModal(book = null) {
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').value = '';

  if (book) {
    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    document.getElementById('bookSubmitBtn').textContent = 'Update Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title || '';
    document.getElementById('bookAuthor').value = book.author || '';
    document.getElementById('bookIsbn').value = book.isbn || '';
    document.getElementById('bookIsbn').readOnly = true;
    document.getElementById('bookCategory').value = book.category || '';
    document.getElementById('bookYear').value = book.publishedYear || '';
    document.getElementById('bookCopies').value = book.totalCopies || 1;
    document.getElementById('bookDescription').value = book.description || '';
  } else {
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    document.getElementById('bookSubmitBtn').textContent = 'Save Book';
    document.getElementById('bookIsbn').readOnly = false;
  }

  openModal('bookModal');
}

async function editBook(id) {
  try {
    const book = await apiGet(`/books/${id}`);
    openBookModal(book);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function saveBook(e) {
  e.preventDefault();
  const id = document.getElementById('bookId').value;
  const submitBtn = document.getElementById('bookSubmitBtn');

  const bookData = {
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    isbn: document.getElementById('bookIsbn').value.trim(),
    category: document.getElementById('bookCategory').value.trim(),
    publishedYear: parseInt(document.getElementById('bookYear').value) || null,
    totalCopies: parseInt(document.getElementById('bookCopies').value) || 1,
    description: document.getElementById('bookDescription').value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (id) {
      await apiPut(`/books/${id}`, bookData);
      showToast('Book updated successfully!', 'success');
    } else {
      await apiPost('/books', bookData);
      showToast('Book added successfully!', 'success');
    }
    closeModal('bookModal');
    loadBooks();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = id ? 'Update Book' : 'Save Book';
  }
}

function confirmDeleteBook(id, title) {
  showConfirm(
    'Delete Book',
    `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    () => deleteBook(id)
  );
}

async function deleteBook(id) {
  try {
    await apiDelete(`/books/${id}`);
    showToast('Book deleted successfully!', 'success');
    loadBooks();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function borrowBook(bookId) {
  try {
    await apiPost(`/loans/borrow/${bookId}`, {});
    showToast('Book borrowed successfully!', 'success');
    loadBooks();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
