import { apiClient, fileApiClient} from "./api-client.js";
import { formatCurrency }  from "../utils/formaters.js"

export function fetchInstallmentArrears() {


   let arrears = apiClient("/api/v1/installment_arrears", "GET", "json",
                          false, false, {});
   
   populateInstallmentArrearsTable(arrears);
}

 function populateInstallmentArrearsTable(arrears){
     const table = $("#installmentArrearsTable");
      
      if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
      }
    
      table.DataTable({
        data: arrears,
        columns: [
          { 
            data: "id",
            title: "ID"
          },
          { 
            data: "client.name",
            title: "Client Name"
          },
          { 
            data: "client.identifier",
            title: "Identifier"
          },
          { 
            data: "installment.number",
            title: "Installment #"
          },
          { 
            data: "installment.amount",
            title: "Amount (MWK)",
            render: function(data) {
              return formatCurrency(data);
            }
          },
          { 
            data: "installment.due_date",
            title: "Due Date"
          },
          { 
            data: "days_overdue",
            title: "Days Overdue",
            render: function(data) {
              return `<span class="badge badge-danger">${data}</span>`;
            }
          },
          { 
            data: "penalty",
            title: "Penalty (MWK)",
            render: function(data) {
              return formatCurrency(data);
            }
          },
          { 
            data: "total_arrears",
            title: "Total Arrears (MWK)",
            render: function(data) {
              return `<strong>${formatCurrency(data)}</strong>`;
            }
          },
          { 
            data: "category",
            title: "Category",
            render: function(data) {
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
            title: "Status",
            render: function(data) {
              const badgeClass = data === 'pending' ? 'badge-warning' : 'badge-success';
              return `<span class="badge ${badgeClass}">${data.toUpperCase()}</span>`;
            }
          },
          {
            data: null,
            title: "Actions",
            orderable: false,
            render: function(data, type, row) {
              return `
                <button class="btn btn-sm btn-info view-arrear-details" 
                        data-loan-id="${row.loan_id}"
                        data-client-name="${row.client.name}"
                        data-arrear-id="${row.id}">
                  <i class="fas fa-eye"></i> View
                </button>
              `;
            }
          }
        ],
        responsive: true,
        order: [[6, 'desc']], // Sort by days overdue descending
        dom: 'Bfrtip',
        buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        pageLength: 25
      });
    
 }


