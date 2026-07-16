import { supplierService } from './api.js';

let suppliers = [];

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

// Fetch and display suppliers
async function fetchSuppliers() {
  const loading = document.getElementById('panel-loading');
  loading.classList.add('active');
  try {
    suppliers = await supplierService.getAll();
    renderSuppliers(suppliers);
  } catch (error) {
    showToast('Failed to load suppliers directory.', 'danger');
    console.error(error);
  } finally {
    loading.classList.remove('active');
  }
}

// Render list to table body
function renderSuppliers(list) {
  const tableBody = document.getElementById('suppliers-table-body');
  tableBody.innerHTML = '';

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">🤝</div>
          <div class="empty-state-title">No suppliers found</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Click 'Add Supplier' to record a new vendor relation.</p>
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(sup => {
    const contactInfo = `
      <div style="font-size: 0.85rem;">
        <div>✉️ ${sup.email}</div>
        <div style="margin-top: 0.15rem;">📞 ${sup.phone}</div>
      </div>
    `;

    const locationInfo = `
      <div style="font-size: 0.85rem; color: var(--text-muted);">
        <div>${sup.address || ''}</div>
        <div>${[sup.city, sup.state].filter(Boolean).join(', ')}</div>
      </div>
    `;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sup.id}</td>
      <td><strong>${sup.supplierName}</strong></td>
      <td>${sup.companyName}</td>
      <td>${contactInfo}</td>
      <td>${locationInfo}</td>
      <td style="text-align: center;">
        <div class="actions-cell" style="justify-content: center;">
          <button class="btn-icon edit-btn" data-id="${sup.id}" title="Edit Supplier">✏️</button>
          <button class="btn-icon delete-btn" data-id="${sup.id}" title="Delete Supplier">🗑️</button>
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

// Search and filter
function handleSearch(e) {
  const keyword = e.target.value.toLowerCase().trim();
  const filtered = suppliers.filter(sup => 
    sup.supplierName.toLowerCase().includes(keyword) || 
    sup.companyName.toLowerCase().includes(keyword) ||
    sup.email.toLowerCase().includes(keyword) ||
    (sup.phone && sup.phone.includes(keyword)) ||
    (sup.city && sup.city.toLowerCase().includes(keyword))
  );
  renderSuppliers(filtered);
}

// Modal actions
const modal = document.getElementById('supplier-modal');
const form = document.getElementById('supplier-form');

function openAddModal() {
  document.getElementById('modal-title').innerText = 'Create Supplier';
  document.getElementById('supplier-id').value = '';
  form.reset();
  hideValidationErrors();
  modal.classList.add('active');
}

async function openEditModal(id) {
  hideValidationErrors();
  document.getElementById('modal-title').innerText = 'Edit Supplier';
  
  try {
    const sup = await supplierService.getById(id);
    document.getElementById('supplier-id').value = sup.id;
    document.getElementById('supplierName').value = sup.supplierName;
    document.getElementById('companyName').value = sup.companyName;
    document.getElementById('email').value = sup.email;
    document.getElementById('phone').value = sup.phone;
    document.getElementById('address').value = sup.address || '';
    document.getElementById('city').value = sup.city || '';
    document.getElementById('state').value = sup.state || '';
    modal.classList.add('active');
  } catch (error) {
    showToast('Failed to fetch supplier details.', 'danger');
  }
}

function closeModal() {
  modal.classList.remove('active');
}

function hideValidationErrors() {
  document.getElementById('error-supplier-name').style.display = 'none';
  document.getElementById('error-supplier-email').style.display = 'none';
}

// Handle Form Submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('supplier-id').value;
  const name = document.getElementById('supplierName').value.trim();
  const companyName = document.getElementById('companyName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();

  const payload = {
    supplierName: name,
    companyName: companyName,
    email: email,
    phone: phone,
    address: address,
    city: city,
    state: state
  };

  const submitBtn = document.getElementById('btn-modal-submit');
  submitBtn.disabled = true;

  try {
    if (id) {
      await supplierService.update(id, payload);
      showToast('Supplier updated successfully!', 'success');
    } else {
      await supplierService.create(payload);
      showToast('Supplier registered successfully!', 'success');
    }
    closeModal();
    fetchSuppliers();
  } catch (error) {
    const errDetails = error.details;
    if (errDetails && errDetails.message && errDetails.message.includes('already exists')) {
      const errSpan = document.getElementById('error-supplier-email');
      errSpan.innerText = 'Supplier email already registered';
      errSpan.style.display = 'block';
    } else if (errDetails && errDetails.validationErrors) {
      if (errDetails.validationErrors.email) {
        const errSpan = document.getElementById('error-supplier-email');
        errSpan.innerText = errDetails.validationErrors.email;
        errSpan.style.display = 'block';
      }
      if (errDetails.validationErrors.supplierName) {
        const errSpan = document.getElementById('error-supplier-name');
        errSpan.innerText = errDetails.validationErrors.supplierName;
        errSpan.style.display = 'block';
      }
    } else {
      showToast(error.message || 'Operation failed.', 'danger');
    }
  } finally {
    submitBtn.disabled = false;
  }
}

// Delete action with confirmation
async function handleDelete(id) {
  if (confirm('Are you sure you want to remove this supplier? All associated products must be updated or deleted first.')) {
    try {
      await supplierService.delete(id);
      showToast('Supplier deleted successfully.', 'success');
      fetchSuppliers();
    } catch (error) {
      showToast('Failed to delete supplier. It might be in use by products.', 'danger');
    }
  }
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  fetchSuppliers();

  document.getElementById('btn-add-supplier').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);
  document.getElementById('search-input').addEventListener('input', handleSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
});
