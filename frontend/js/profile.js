/* ============================================
   PROFILE MODULE — Library Management System
   ============================================ */

// ── Helper functions (missing from utils.js) ─────────────────
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── Module state ──────────────────────────────────────────────
let currentUser = null;
let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;
    buildSidebar('profile');
    initMobileSidebar();
    loadProfile();
});

// ── Load profile ──────────────────────────────────────────────
async function loadProfile() {
    try {
        const user = await apiGet('/profile/me');
        currentUser = user;
        renderProfile(user);
        // Sync localStorage so sidebar picks up profile picture
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.fullName = user.fullName;
        stored.profilePicture = user.profilePicture;
        localStorage.setItem('user', JSON.stringify(stored));
        buildSidebar('profile');
    } catch (error) {
        showToast(error.message || 'Failed to load profile.', 'error');
    }
}

function renderProfile(user) {
    // Avatar
    renderAvatar('avatarDisplay', user.profilePicture, user.fullName || user.username);

    // Header card
    setText('profileName', user.fullName || user.username);
    setText('profileEmail', user.email || '—');

    const badge = document.getElementById('profileRoleBadge');
    if (badge) {
        badge.textContent = user.role;
        badge.className = `role-badge role-${user.role}`;
    }

    // Account info
    setText('infoUsername', user.username);
    setText('infoRole', user.role);
    setText('infoStatus', user.active ? '✅ Active' : '❌ Inactive');
    setText('infoJoined', formatDate(user.createdAt));

    // Form fields
    setVal('editFullName', user.fullName || '');
    setVal('editEmail', user.email || '');
    setVal('editPhone', user.phone || '');

    // Show/hide remove button
    const removeBtn = document.getElementById('removePicBtn');
    if (removeBtn) removeBtn.style.display = user.profilePicture ? 'inline-flex' : 'none';
}

// ── Render avatar ─────────────────────────────────────────────
function renderAvatar(containerId, picturePath, name, size = 120) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (picturePath) {
        const separator = picturePath.includes('?') ? '&' : '?';
        container.innerHTML = `
      <img class="avatar-img" src="${API_BASE.replace('/api', '')}${picturePath}${separator}_t=${Date.now()}"
        alt="${escapeHtml(name)}" style="width:${size}px;height:${size}px;"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      <div class="avatar-initials" style="width:${size}px;height:${size}px;display:none;font-size:${size / 3.5}rem;"></div>`;
    } else {
        container.innerHTML = `
      <div class="avatar-initials" style="width:${size}px;height:${size}px;font-size:${size / 3.5}rem;"></div>`;
    }
}

// ── Save profile ──────────────────────────────────────────────
async function saveProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const body = {
            fullName: getVal('editFullName'),
            email: getVal('editEmail'),
            phone: getVal('editPhone'),
        };
        const res = await apiPut('/profile/me', body);
        currentUser = res.user;
        renderProfile(res.user);

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.fullName = res.user.fullName;
        stored.profilePicture = res.user.profilePicture;
        localStorage.setItem('user', JSON.stringify(stored));
        buildSidebar('profile');

        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
    }
}

// ── Change password ───────────────────────────────────────────
async function changePassword(e) {
    e.preventDefault();
    const newPwd = getVal('newPassword');
    const confirmPwd = getVal('confirmPassword');

    if (newPwd !== confirmPwd) {
        showToast('New passwords do not match.', 'error');
        return;
    }

    const btn = document.getElementById('savePasswordBtn');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
        await apiPut('/profile/me/password', {
            currentPassword: getVal('currentPassword'),
            newPassword: newPwd,
        });
        document.getElementById('passwordForm').reset();
        showToast('Password updated successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Update Password';
    }
}

// ── Profile picture upload ────────────────────────────────────
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function handleDragOver(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.add('dragover');
}

function handleDragLeave(event) {
    document.getElementById('dropZone').classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    const picError = document.getElementById('picError');
    const uploadBtn = document.getElementById('uploadBtn');
    const previewWrap = document.getElementById('previewWrap');

    picError.style.display = 'none';

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
        picError.textContent = 'Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.';
        picError.style.display = 'block';
        selectedFile = null;
        uploadBtn.disabled = true;
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        picError.textContent = 'File too large. Maximum size is 2MB.';
        picError.style.display = 'block';
        selectedFile = null;
        uploadBtn.disabled = true;
        return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        previewWrap.style.display = 'block';
    };
    reader.readAsDataURL(file);
    uploadBtn.disabled = false;
}

async function uploadPicture() {
    if (!selectedFile) return;

    const btn = document.getElementById('uploadBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/profile/me/picture`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (response.status === 401) { window.location.href = 'index.html'; return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed.');

        currentUser.profilePicture = data.profilePicture;
        renderAvatar('avatarDisplay', data.profilePicture, currentUser.fullName || currentUser.username);
        document.getElementById('removePicBtn').style.display = 'inline-flex';

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.profilePicture = data.profilePicture;
        localStorage.setItem('user', JSON.stringify(stored));
        buildSidebar('profile');

        closeModal('pictureModal');
        resetPictureModal();
        showToast('Profile picture updated!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Upload Photo';
    }
}

function confirmRemovePicture() {
    showConfirm(
        'Remove Photo',
        'Are you sure you want to remove your profile picture?',
        removePicture
    );
}

async function removePicture() {
    try {
        await apiDelete('/profile/me/picture');
        currentUser.profilePicture = null;
        renderAvatar('avatarDisplay', null, currentUser.fullName || currentUser.username);
        document.getElementById('removePicBtn').style.display = 'none';

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.profilePicture = null;
        localStorage.setItem('user', JSON.stringify(stored));
        buildSidebar('profile');

        showToast('Profile picture removed.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function resetPictureModal() {
    selectedFile = null;
    document.getElementById('picFileInput').value = '';
    document.getElementById('previewWrap').style.display = 'none';
    document.getElementById('picError').style.display = 'none';
    document.getElementById('uploadBtn').disabled = true;
}
