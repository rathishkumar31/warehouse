import { productService, categoryService, supplierService, warehouseService } from './api.js';

let products = [];
let categories = [];
let suppliers = [];
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

// Format currency in INR
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
}

// Load dropdown dependency directories
async function loadDirectories() {
  try {
    const [cats, sups, whs] = await Promise.all([
      categoryService.getAll(),
      supplierService.getAll(),
      warehouseService.getAll(),
    ]);

    categories = cats;
    suppliers = sups;
    warehouses = whs;

    // Populate Filters
    populateDropdown('filter-category', categories, 'id', 'categoryName', 'All Categories');
    populateDropdown('filter-warehouse', warehouses, 'id', 'warehouseName', 'All Warehouses');

    // Populate Modal Dropdowns
    populateDropdown('categoryId', categories, 'id', 'categoryName', 'Select Category');
    populateDropdown('supplierId', suppliers, 'id', 'supplierName', 'Select Supplier');
    populateDropdown('warehouseId', warehouses, 'id', 'warehouseName', 'Select Warehouse');

  } catch (error) {
    showToast('Failed to load dependency dropdowns. Verify the database is seeded.', 'danger');
    console.error(error);
  }
}

// Dropdown populator helper
function populateDropdown(elementId, list, valueField, textField, defaultText) {
  const select = document.getElementById(elementId);
  if (!select) return;

  select.innerHTML = '';
  
  if (defaultText) {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.innerText = defaultText;
    select.appendChild(defaultOpt);
  }

  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueField];
    opt.innerText = item[textField] + (item.warehouseCode ? ` (${item.warehouseCode})` : '');
    select.appendChild(opt);
  });
}

// Fetch products inventory
async function fetchProducts() {
  const loading = document.getElementById('panel-loading');
  loading.classList.add('active');
  try {
    products = await productService.getAll();
    applyFilters();
  } catch (error) {
    showToast('Failed to load products inventory.', 'danger');
    console.error(error);
    const tableBody = document.getElementById('products-table-body');
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title" style="color: var(--danger);">Error loading inventory</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Check console or backend server.</p>
        </td>
      </tr>
    `;
  } finally {
    loading.classList.remove('active');
  }
}

// Apply multi-stage filter (simulating Stream-like manipulation)
function applyFilters() {
  const keyword = document.getElementById('search-input').value.toLowerCase().trim();
  const categoryId = document.getElementById('filter-category').value;
  const warehouseId = document.getElementById('filter-warehouse').value;
  const status = document.getElementById('filter-status').value;

  // Stream operations: filter -> map -> collect
  const filtered = products
    .filter(p => {
      // 1. Keyword search
      if (!keyword) return true;
      return p.productName.toLowerCase().includes(keyword) || p.productCode.toLowerCase().includes(keyword);
    })
    .filter(p => {
      // 2. Category filter
      if (!categoryId) return true;
      return p.categoryId == categoryId;
    })
    .filter(p => {
      // 3. Warehouse filter
      if (!warehouseId) return true;
      return p.warehouseId == warehouseId;
    })
    .filter(p => {
      // 4. Status filter
      if (!status) return true;
      return p.status === status;
    });

  renderProducts(filtered);
}

// Render filtered product list
function renderProducts(list) {
  const tableBody = document.getElementById('products-table-body');
  tableBody.innerHTML = '';

  if (list.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">📦</div>
          <div class="empty-state-title">No products found</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Check filters or click 'Add Product' to insert new inventory.</p>
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(p => {
    let statusClass = 'badge-active';
    let statusText = 'Active';

    if (p.status === 'LOW_STOCK') {
      statusClass = 'badge-low-stock';
      statusText = 'Low Stock';
    } else if (p.status === 'OUT_OF_STOCK') {
      statusClass = 'badge-out-of-stock';
      statusText = 'Out of Stock';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${p.productCode}</strong></td>
      <td><strong>${p.productName}</strong></td>
      <td>${p.categoryName || 'Unassigned'}</td>
      <td>${p.supplierName || 'Unassigned'}</td>
      <td>${p.warehouseName || 'Unassigned'}</td>
      <td>${formatCurrency(p.unitPrice)}</td>
      <td>${p.quantity} <span style="color: var(--text-muted); font-size: 0.8rem;">${p.unit}</span></td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td style="text-align: center;">
        <div class="actions-cell" style="justify-content: center;">
          <button class="btn-icon view-btn" data-id="${p.id}" title="View Details">👁️</button>
          <button class="btn-icon edit-btn" data-id="${p.id}" title="Edit Product">✏️</button>
          <button class="btn-icon delete-btn" data-id="${p.id}" title="Delete Product">🗑️</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Attach button event listeners
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      openViewModal(id);
    });
  });

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

// Modal forms reference
const modal = document.getElementById('product-modal');
const viewModal = document.getElementById('product-view-modal');
const form = document.getElementById('product-form');

function openAddModal() {
  document.getElementById('modal-title').innerText = 'Create Product';
  document.getElementById('product-id').value = '';
  document.getElementById('productCode').readOnly = false;
  form.reset();
  hideValidationErrors();
  modal.classList.add('active');
}

async function openEditModal(id) {
  hideValidationErrors();
  document.getElementById('modal-title').innerText = 'Edit Product';
  document.getElementById('productCode').readOnly = true;

  try {
    const p = await productService.getById(id);
    document.getElementById('product-id').value = p.id;
    document.getElementById('productCode').value = p.productCode;
    document.getElementById('productName').value = p.productName;
    document.getElementById('description').value = p.description || '';
    document.getElementById('unitPrice').value = p.unitPrice;
    document.getElementById('quantity').value = p.quantity;
    document.getElementById('minimumStock').value = p.minimumStock;
    document.getElementById('unit').value = p.unit;
    document.getElementById('categoryId').value = p.categoryId || '';
    document.getElementById('supplierId').value = p.supplierId || '';
    document.getElementById('warehouseId').value = p.warehouseId || '';
    
    modal.classList.add('active');
  } catch (error) {
    showToast('Failed to retrieve product details.', 'danger');
  }
}

async function openViewModal(id) {
  const body = document.getElementById('product-view-body');
  body.innerHTML = '<div class="spinner" style="margin: 2rem auto;"></div>';
  viewModal.classList.add('active');

  try {
    const p = await productService.getById(id);
    let statusClass = 'badge-active';
    let statusText = 'Active';

    if (p.status === 'LOW_STOCK') {
      statusClass = 'badge-low-stock';
      statusText = 'Low Stock';
    } else if (p.status === 'OUT_OF_STOCK') {
      statusClass = 'badge-out-of-stock';
      statusText = 'Out of Stock';
    }

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <span style="font-size: 1.1rem; font-weight: 700;">${p.productName}</span>
          <span class="badge ${statusClass}">${statusText}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
          <div><strong>Product Code:</strong> ${p.productCode}</div>
          <div><strong>Price per Unit:</strong> ${formatCurrency(p.unitPrice)}</div>
          <div><strong>Current Quantity:</strong> ${p.quantity} ${p.unit}</div>
          <div><strong>Minimum Stock Level:</strong> ${p.minimumStock} ${p.unit}</div>
          <div><strong>Category:</strong> ${p.categoryName || 'Unassigned'}</div>
          <div><strong>Supplier:</strong> ${p.supplierName || 'Unassigned'}</div>
          <div style="grid-column: span 2;"><strong>Warehouse Mapping:</strong> ${p.warehouseName || 'Unassigned'}</div>
          <div style="grid-column: span 2; border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
            <strong>Product Description:</strong>
            <p style="color: var(--text-muted); margin-top: 0.25rem;">${p.description || 'No description provided.'}</p>
          </div>
          <div style="grid-column: span 2; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
            Registered At: ${new Date(p.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    body.innerHTML = `<p style="color: var(--danger);">Failed to retrieve details. ${error.message}</p>`;
  }
}

function closeModal() {
  modal.classList.remove('active');
}

function closeViewModal() {
  viewModal.classList.remove('active');
}

function hideValidationErrors() {
  document.getElementById('error-product-code').style.display = 'none';
}

// Handle Form Submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('product-id').value;
  const code = document.getElementById('productCode').value.trim();
  const name = document.getElementById('productName').value.trim();
  const desc = document.getElementById('description').value.trim();
  const price = parseFloat(document.getElementById('unitPrice').value);
  const qty = parseInt(document.getElementById('quantity').value);
  const minStock = parseInt(document.getElementById('minimumStock').value);
  const unit = document.getElementById('unit').value;
  const categoryId = parseInt(document.getElementById('categoryId').value);
  const supplierId = parseInt(document.getElementById('supplierId').value);
  const warehouseId = parseInt(document.getElementById('warehouseId').value);

  // We let status be determined by backend, but pass a placeholder active status as required by field validation
  const payload = {
    productCode: code,
    productName: name,
    description: desc,
    unitPrice: price,
    quantity: qty,
    minimumStock: minStock,
    unit: unit,
    status: 'ACTIVE', 
    categoryId: categoryId,
    supplierId: supplierId,
    warehouseId: warehouseId
  };

  const submitBtn = document.getElementById('btn-modal-submit');
  submitBtn.disabled = true;

  try {
    if (id) {
      await productService.update(id, payload);
      showToast('Product inventory updated!', 'success');
    } else {
      await productService.create(payload);
      showToast('Product inventory created!', 'success');
    }
    closeModal();
    fetchProducts();
  } catch (error) {
    const errDetails = error.details;
    if (errDetails && errDetails.message && errDetails.message.includes('already exists')) {
      const errSpan = document.getElementById('error-product-code');
      errSpan.innerText = `Product Code '${code}' already exists`;
      errSpan.style.display = 'block';
    } else if (errDetails && errDetails.validationErrors && errDetails.validationErrors.productCode) {
      const errSpan = document.getElementById('error-product-code');
      errSpan.innerText = errDetails.validationErrors.productCode;
      errSpan.style.display = 'block';
    } else {
      showToast(error.message || 'Operation failed.', 'danger');
    }
  } finally {
    submitBtn.disabled = false;
  }
}

// Delete inventory item
async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this product from the inventory database?')) {
    try {
      await productService.delete(id);
      showToast('Product deleted from inventory database.', 'success');
      fetchProducts();
    } catch (error) {
      showToast('Failed to delete product. Contact system administrator.', 'danger');
    }
  }
}

// Bind Page Events
document.addEventListener('DOMContentLoaded', async () => {
  // Load dependencies first
  await loadDirectories();
  // Fetch primary inventory
  await fetchProducts();

  document.getElementById('btn-add-product').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);

  document.getElementById('modal-view-close').addEventListener('click', closeViewModal);
  document.getElementById('btn-modal-view-close').addEventListener('click', closeViewModal);

  // Search & Filter Events
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('filter-category').addEventListener('change', applyFilters);
  document.getElementById('filter-warehouse').addEventListener('change', applyFilters);
  document.getElementById('filter-status').addEventListener('change', applyFilters);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  viewModal.addEventListener('click', (e) => {
    if (e.target === viewModal) closeViewModal();
  });
});
