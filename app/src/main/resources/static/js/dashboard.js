import { dashboardService, productService } from './api.js';

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

  // Trigger reflow for transition
  setTimeout(() => toast.classList.add('show'), 10);

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }
  }, 4000);
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
}

async function loadDashboardData() {
  const productsLoading = document.getElementById('products-loading');
  productsLoading.classList.add('active');

  try {
    // 1. Fetch dashboard statistics
    const stats = await dashboardService.getStats();
    
    document.getElementById('stat-products').innerText = stats.totalProducts;
    document.getElementById('stat-low-stock').innerText = stats.lowStockCount;
    document.getElementById('stat-out-of-stock').innerText = stats.outOfStockCount;
    document.getElementById('stat-warehouses').innerText = stats.totalWarehouses;
    document.getElementById('stat-categories').innerText = stats.totalCategories;
    document.getElementById('stat-suppliers').innerText = stats.totalSuppliers;

    // 2. Fetch inventory items for table (combining low stock & out of stock)
    const lowStock = await productService.getLowStock();
    const outOfStock = await productService.getOutOfStock();
    
    // Combine and sort
    const criticalItems = [...outOfStock, ...lowStock];

    const tableBody = document.getElementById('low-stock-table-body');
    tableBody.innerHTML = '';

    if (criticalItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-state-icon">🎉</div>
            <div class="empty-state-title">All stock levels are optimal!</div>
            <p style="color: var(--text-muted); font-size: 0.85rem;">No products are out of stock or running low.</p>
          </td>
        </tr>
      `;
    } else {
      criticalItems.forEach(item => {
        const statusClass = item.status === 'OUT_OF_STOCK' ? 'badge-out-of-stock' : 'badge-low-stock';
        const statusText = item.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock';
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${item.productCode}</strong></td>
          <td>${item.productName}</td>
          <td>${item.warehouseName || 'Unassigned'}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
        `;
        tableBody.appendChild(row);
      });
    }

    // 3. Render critical alerts list
    const alertsContainer = document.getElementById('dashboard-alerts');
    alertsContainer.innerHTML = '';

    let alertCount = 0;

    if (stats.outOfStockCount > 0) {
      alertCount++;
      const outOfStockAlert = document.createElement('div');
      outOfStockAlert.className = 'alert-item';
      outOfStockAlert.innerHTML = `
        <span><strong>CRITICAL:</strong> ${stats.outOfStockCount} item(s) are completely out of stock!</span>
        <span class="badge-pill-danger">Urgent</span>
      `;
      alertsContainer.appendChild(outOfStockAlert);
    }

    if (stats.lowStockCount > 0) {
      alertCount++;
      const lowStockAlert = document.createElement('div');
      lowStockAlert.className = 'alert-item low-stock';
      lowStockAlert.innerHTML = `
        <span><strong>WARNING:</strong> ${stats.lowStockCount} item(s) have fallen below minimum thresholds.</span>
        <span class="badge-pill-warning">Reorder</span>
      `;
      alertsContainer.appendChild(lowStockAlert);
    }

    if (alertCount === 0) {
      alertsContainer.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 0;">
          <div class="empty-state-icon">✔️</div>
          <div class="empty-state-title">System Healthy</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">No critical inventory flags raised.</p>
        </div>
      `;
    }

  } catch (error) {
    showToast('Failed to retrieve dashboard details. Make sure the backend is active.', 'danger');
    console.error(error);
  } finally {
    productsLoading.classList.remove('active');
  }
}

// Format current date
function initDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  document.getElementById('current-date').innerText = today.toLocaleDateString('en-US', options);
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  loadDashboardData();
});
