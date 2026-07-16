import { categoryService } from './api.js';

let categories = [];

// Setup Toast Notification system
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }
  }, 4000);
}

// Fetch and display categories
async function fetchCategories() {
  const loading = document.getElementById('panel-loading');
  loading.classList.add('active');
  try {
    categories = await categoryService.getAll();
    renderCategories(categories);
  } catch (error) {
    showToast('Failed to load categories.', 'danger');
    console.error(error);
  } finally {
    loading.classList.remove('active');
  }
}

// Render list to table body
function renderCategories(list) {
  const tableBody = document.getElementById('categories-table-body');
  tableBody.innerHTML = '';

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <div class="empty-state-icon">🏷️</div>
          <div class="empty-state-title">No categories found</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Click 'Add Category' to get started.</p>
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(cat => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cat.id}</td>
      <td><strong>${cat.categoryName}</strong></td>
      <td style="color: var(--text-muted);">${cat.description || 'No description'}</td>
      <td style="text-align: center;">
        <div class="actions-cell" style="justify-content: center;">
          <button class="btn-icon edit-btn" data-id="${cat.id}" title="Edit Category">✏️</button>
          <button class="btn-icon delete-btn" data-id="${cat.id}" title="Delete Category">🗑️</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Attach button event listeners
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openEditModal(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      handleDelete(id);
    });
  });
}

// Search and filter (using streams / array manipulations)
function handleSearch(e) {
  const keyword = e.target.value.toLowerCase().trim();
  const filtered = categories.filter(cat => 
    cat.categoryName.toLowerCase().includes(keyword) || 
    (cat.description && cat.description.toLowerCase().includes(keyword))
  );
  renderCategories(filtered);
}

// Modal open/close actions
const modal = document.getElementById('category-modal');
const form = document.getElementById('category-form');

function openAddModal() {
  document.getElementById('modal-title').innerText = 'Create Category';
  document.getElementById('category-id').value = '';
  form.reset();
  hideValidationErrors();
  modal.classList.add('active');
}

async function openEditModal(id) {
  hideValidationErrors();
  document.getElementById('modal-title').innerText = 'Edit Category';
  
  try {
    const cat = await categoryService.getById(id);
    document.getElementById('category-id').value = cat.id;
    document.getElementById('categoryName').value = cat.categoryName;
    document.getElementById('description').value = cat.description || '';
    modal.classList.add('active');
  } catch (error) {
    showToast('Failed to fetch category details.', 'danger');
  }
}

function closeModal() {
  modal.classList.remove('active');
}

function hideValidationErrors() {
  document.getElementById('error-category-name').style.display = 'none';
}

// Handle Form Submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('category-id').value;
  const name = document.getElementById('categoryName').value.trim();
  const desc = document.getElementById('description').value.trim();

  const payload = {
    categoryName: name,
    description: desc
  };

  const submitBtn = document.getElementById('btn-modal-submit');
  submitBtn.disabled = true;

  try {
    if (id) {
      // Update Category
      await categoryService.update(id, payload);
      showToast('Category updated successfully!', 'success');
    } else {
      // Create Category
      await categoryService.create(payload);
      showToast('Category created successfully!', 'success');
    }
    closeModal();
    fetchCategories();
  } catch (error) {
    // If validation/already exists error
    const errDetails = error.details;
    if (errDetails && errDetails.message && errDetails.message.includes('already exists')) {
      const errSpan = document.getElementById('error-category-name');
      errSpan.innerText = 'Category name already exists';
      errSpan.style.display = 'block';
    } else if (errDetails && errDetails.validationErrors && errDetails.validationErrors.categoryName) {
      const errSpan = document.getElementById('error-category-name');
      errSpan.innerText = errDetails.validationErrors.categoryName;
      errSpan.style.display = 'block';
    } else {
      showToast(error.message || 'Operation failed.', 'danger');
    }
  } finally {
    submitBtn.disabled = false;
  }
}

// Delete action with confirmation
async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this category? All associated products must be updated or deleted first.')) {
    try {
      await categoryService.delete(id);
      showToast('Category deleted successfully.', 'success');
      fetchCategories();
    } catch (error) {
      showToast('Failed to delete category. It might be in use by products.', 'danger');
    }
  }
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();

  document.getElementById('btn-add-category').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);
  document.getElementById('search-input').addEventListener('input', handleSearch);

  // Close modal when clicking outside container
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
});
