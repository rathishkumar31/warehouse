import { warehouseService } from './api.js';

let warehouses = [];

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

// Fetch and display warehouses
async function fetchWarehouses() {
  const loading = document.getElementById('panel-loading');
  loading.classList.add('active');
  try {
    warehouses = await warehouseService.getAll();
    renderWarehouses(warehouses);
  } catch (error) {
    showToast('Failed to load warehouses.', 'danger');
    console.error(error);
  } finally {
    loading.classList.remove('active');
  }
}

// Render list to table body
function renderWarehouses(list) {
  const tableBody = document.getElementById('warehouses-table-body');
  tableBody.innerHTML = '';

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">🏢</div>
          <div class="empty-state-title">No warehouses registered</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Click 'Add Warehouse' to register a new storage facility.</p>
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(wh => {
    const contactInfo = `
      <div style="font-size: 0.85rem;">
        <strong>${wh.managerName}</strong>
        <div style="color: var(--text-muted); margin-top: 0.15rem;">📞 ${wh.phone}</div>
      </div>
    `;

    const locationDetails = `
      <div style="font-size: 0.85rem;">
        <div>${wh.address}</div>
        <div style="color: var(--text-muted);">${wh.city}, ${wh.state} - ${wh.pincode}</div>
      </div>
    `;

    const statusClass = wh.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive';
    const statusText = wh.status === 'ACTIVE' ? 'Active' : 'Inactive';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${wh.warehouseCode}</strong></td>
      <td><strong>${wh.warehouseName}</strong></td>
      <td>${contactInfo}</td>
      <td>${locationDetails}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td style="text-align: center;">
        <div class="actions-cell" style="justify-content: center;">
          <button class="btn-icon edit-btn" data-id="${wh.id}" title="Edit Warehouse">✏️</button>
          <button class="btn-icon delete-btn" data-id="${wh.id}" title="Delete Warehouse">🗑️</button>
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
  const filtered = warehouses.filter(wh => 
    wh.warehouseName.toLowerCase().includes(keyword) || 
    wh.warehouseCode.toLowerCase().includes(keyword) ||
    wh.managerName.toLowerCase().includes(keyword) ||
    wh.city.toLowerCase().includes(keyword) ||
    wh.state.toLowerCase().includes(keyword)
  );
  renderWarehouses(filtered);
}

// Modal actions
const modal = document.getElementById('warehouse-modal');
const form = document.getElementById('warehouse-form');

function openAddModal() {
  document.getElementById('modal-title').innerText = 'Create Warehouse';
  document.getElementById('warehouse-id').value = '';
  form.reset();
  hideValidationErrors();
  modal.classList.add('active');
}

async function openEditModal(id) {
  hideValidationErrors();
  document.getElementById('modal-title').innerText = 'Edit Warehouse';
  
  try {
    const wh = await warehouseService.getById(id);
    document.getElementById('warehouse-id').value = wh.id;
    document.getElementById('warehouseCode').value = wh.warehouseCode;
    document.getElementById('warehouseName').value = wh.warehouseName;
    document.getElementById('managerName').value = wh.managerName;
    document.getElementById('phone').value = wh.phone;
    document.getElementById('address').value = wh.address;
    document.getElementById('city').value = wh.city;
    document.getElementById('state').value = wh.state;
    document.getElementById('pincode').value = wh.pincode;
    document.getElementById('status').value = wh.status;
    modal.classList.add('active');
  } catch (error) {
    showToast('Failed to fetch warehouse details.', 'danger');
  }
}

function closeModal() {
  modal.classList.remove('active');
}

function hideValidationErrors() {
  document.getElementById('error-warehouse-code').style.display = 'none';
}

// Handle Form Submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('warehouse-id').value;
  const code = document.getElementById('warehouseCode').value.trim();
  const name = document.getElementById('warehouseName').value.trim();
  const manager = document.getElementById('managerName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();
  const status = document.getElementById('status').value;

  const payload = {
    warehouseCode: code,
    warehouseName: name,
    managerName: manager,
    phone: phone,
    address: address,
    city: city,
    state: state,
    pincode: pincode,
    status: status
  };

  const submitBtn = document.getElementById('btn-modal-submit');
  submitBtn.disabled = true;

  try {
    if (id) {
      await warehouseService.update(id, payload);
      showToast('Warehouse updated successfully!', 'success');
    } else {
      await warehouseService.create(payload);
      showToast('Warehouse registered successfully!', 'success');
    }
    closeModal();
    fetchWarehouses();
  } catch (error) {
    const errDetails = error.details;
    if (errDetails && errDetails.message && errDetails.message.includes('already exists')) {
      const errSpan = document.getElementById('error-warehouse-code');
      errSpan.innerText = `Warehouse code '${code}' already exists`;
      errSpan.style.display = 'block';
    } else if (errDetails && errDetails.validationErrors && errDetails.validationErrors.warehouseCode) {
      const errSpan = document.getElementById('error-warehouse-code');
      errSpan.innerText = errDetails.validationErrors.warehouseCode;
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
  if (confirm('Are you sure you want to delete this warehouse? All associated products must be updated or deleted first.')) {
    try {
      await warehouseService.delete(id);
      showToast('Warehouse deleted successfully.', 'success');
      fetchWarehouses();
    } catch (error) {
      showToast('Failed to delete warehouse. It might be in use by products.', 'danger');
    }
  }
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  fetchWarehouses();

  document.getElementById('btn-add-warehouse').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);
  document.getElementById('search-input').addEventListener('input', handleSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
});
