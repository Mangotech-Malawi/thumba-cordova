import { apiClient } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"

export function add(params) {
  return apiClient("/api/v1/expense/new", "POST", "json", false, false, params);
}


export function deleteExpense(params){
    return apiClient("/api/v1/expense/delete", "POST", "json", 
                    false, false, params);
}

export function edit(params) {
  console.log(params);
  return apiClient("/api/v1/expense/edit", "POST",
                  "json", false, false, params);
}

export function fetchExpensesData() {
  let data = apiClient("/api/v1/expenses", "GET", "json",
                       false, false, {});

  populateExpensesTable(data);
}

function populateExpensesTable(dataSet) {
  $("#expensesTable").DataTable({
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
      { data: "description" },
      { data: "created_at" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getEditBtn,
        data: null,
        targets: [5],
      },
      {
        render: getDelBtn,
        data: null,
        targets: [6],
      },
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
    ],
  });
}

function getEditBtn(data, type, row, meta) {
  let dataFields = `data-expense-id ="${data.id}"
                    data-category="${data.category}"
                    data-amount="${data.amount}"
                    data-description="${data.description}"
                    data-button-type="edit"`;

  return getButton(dataFields, "expense", "secondary", "fas fa-edit");
}

function getDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-expense-id = "${data.id}"`,
    "",
    "danger del-expense",
    "fa fa-trash"
  );
}

function getButton(dataFields, modal, color, icon) {
  return `<button type='button' class="btn btn-block btn-${color}"
             data-toggle="modal" 
            data-target="#modal-${modal}" ${dataFields} > 
            <i class="${icon}" aria-hidden="true"></i></button>`;
}
