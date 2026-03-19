import { apiClient, fileApiClient } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"

export function fetchInstallmentArrears() {
  // Use async call to handle the response properly
  apiClient("/api/v1/installment_arrears", "GET", "json", true, false, {})
    .then(arrears => {
      populateInstallmentArrearsTable(arrears);
    });
}

function populateInstallmentArrearsTable(arrears) {
  const table = $("#installmentArrearsTable");

  if ($.fn.DataTable.isDataTable(table)) {
    table.DataTable().clear().destroy();
  }

  table.DataTable({
    data: arrears,
    columns: [
      {
        data: null,
        render: function (data, type, row) {
          return `<input type="checkbox" class="arrear-checkbox" value="${row.id}">`;
        }
      },
      { data: "id" },
      { data: "client.name" },
      { data: "client.identifier" },
      { data: "installment.number" },
      {
        data: "total_arrears",
        render: function (data) {
          return `<strong>${formatCurrency(data)}</strong>`;
        }
      },
      {
        data: "days_overdue",
        render: function (data) {
          return `<span class="badge badge-danger">${data}</span>`;
        }
      },
      {
        data: "category",
        render: function (data) {
          const badgeClass = {
            'early': 'badge-warning',
            'moderate': 'badge-danger',
            'write_off': 'badge-dark'
          }[data] || 'badge-secondary';
          return `<span class="badge ${badgeClass}">${data.toUpperCase().replace('_', ' ')}</span>`;
        }
      },
      {
        data: "status",
        render: function (data) {
          const badgeClass = data === 'pending' ? 'badge-info' : 'badge-success';
          return `<span class="badge ${badgeClass}">${data.toUpperCase()}</span>`;
        }
      },
      {
        data: null,
        render: function (data, type, row) {
          return `
                <button class="btn btn-sm btn-info assign-collector" 
                        data-loan-id="${row.loan_id}"
                        data-branch-id="${row.branch_id}
                        data-client-name="${row.client.name}"
                        data-client-identifier="${row.client.identifier}"
                        data-installment-number="${row.installment.number}"
                        data-installment-amount="${row.installment.amount}"
                        data-days-overdue="${row.days_overdue}"
                        data-total-arrears="${row.total_arrears}"
                        data-category="${row.category}"
                        data-status="${row.status}"
                        data-arrear-id="${row.id}"
                        title="Assign Collector">
                  <i class="fas fa-user-plus"></i>
                </button>
              `;
        }
      }
    ],
    responsive: true,
    order: [[6, 'desc']], // Sort by days overdue descending
    columnDefs: [{
      targets: 'no-sort',
      orderable: false,
    }],
    dom: 'Bfrtip',
    buttons: [
      'copy', 'csv', 'excel', 'pdf', 'print'
    ],
    pageLength: 25,
    initComplete: function () {
      // Initialize Select2 for the bulk collector dropdown
      $('#bulkCollectorSelect').select2({
        placeholder: "-- Select Collector --",
        allowClear: true
      });
    }
  });
}



