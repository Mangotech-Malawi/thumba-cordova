import { apiClient } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"

export function add(params) {
  return apiClient("/api/v1/income/new", "POST", "json", false, false, params);
}


export function deleteIncome(id, void_reason){
    return apiClient("/api/v1/income/delete", "POST", "json", 
                    false, false, {id: id, void_reason: void_reason});
}

export function edit(params) {
  return apiClient("/api/v1/income/edit", "POST", "json", false, false, params);
}

export function fetchIncomeData() {
  let data = apiClient("/api/v1/income", "GET", "json", false, false, {});

  if (data != null) {
    populateIncomeTable(data);
  }

  return data;
}

function populateIncomeTable(dataSet) {
  $("#incomeTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataSet,
    columns: [
      { data: "id" },
      { data: "amount" },
      { data: "category" },
      { data: "created_at" },
    ],
    columnDefs: [
      {
        targets: [1], // Targeting the 'Amount' column
        render: function (data, type, row) {
            if (type === 'display' || type === 'filter') {
                // Use the utility function to format the number
                return formatCurrency(data);
            }
            return data;
        }
      }
    ]
  });
}

function getViewBtn(data, type, row, meta) {
  let dataFields = `data-income-id ="${data.id}"
                      data-investor-id ="${data.user_id}" 
                      data-category="${data.category}"
                      data-amount="${data.amount}"
                      data-category="${data.category}"
                      data-created-at="${data.created_at}"
                      data-description="${data.description}"`;

  return getButton(dataFields, "view-income", "primary", "fas fa-eye");
}

function getEditBtn(data, type, row, meta) {
  let dataFields = `data-income-id ="${data.id}"
                      data-investor-id ="${data.user_id}" 
                      data-category="${data.category}"
                      data-amount="${data.amount}"
                      data-category="${data.category}"
                      data-description="${data.description}"
                      data-button-type="edit"`;

  return getButton(dataFields, "income", "secondary", "fas fa-edit");
}

function getDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-income-id = "${data.id}"`,
    "del-income",
    "danger",
    "fa fa-trash"
  );
}

function getButton(dataFields, modal, color, icon) {
  return `<button type='button' class="btn btn-block btn-${color}"
             data-toggle="modal" 
            data-target="#modal-${modal}" ${dataFields} > 
            <i class="${icon}" aria-hidden="true"></i></button>`;
}
