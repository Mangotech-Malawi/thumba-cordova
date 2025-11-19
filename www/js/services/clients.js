import { apiClient, fileApiClient, getBaseURL } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"

let selectedClients = new Set();

export function fetchClientsData(client_type) {

  if (client_type === "individual") {
    loadIndividualsTable(client_type);
  }
  else if (client_type === "organization") {
    loadOrganizationsTable(client_type);
  } else if (client_type === "group") {
    loadGroupsTable(client_type)
  }
}

export function editClient(params) {
  return apiClient(
    "/api/v1/clients/update",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function addClient(params) {
  return apiClient("/api/v1/clients", "POST", "json", false, false, params);
}

export function uploadImage(clientId, imageFile) {
  const formData = new FormData();
  formData.append("client[profile_picture]", imageFile); // Rails param for the image
  formData.append("client[id]", clientId);

  return fileApiClient(
    `/api/v1/client/upload_profile_picture`,
    "POST",
    null,
    false, // Synchronous
    false,
    formData,
    true // isFile
  );

};

export function delClient(client_id, void_reason) {
  return apiClient("/api/v1/clients/delete", "POST", "json", false, false, {
    client_id: client_id,
    void_reason: void_reason,
  });
}

export function getClientById(client_id) {
  return apiClient("/api/v1/client/find_by_id", "GET", "json", false, false, {
    client_id: client_id
  });
}

export function getClientRecordReport(params) {
  return apiClient("/api/v1/report/client_record", "GET", "json", false,
    false, params);
}

export function addJob(params) {
  return apiClient("/api/v1/client_job", "POST", "json", false, false, params);
}

export function updateJob(params) {
  return apiClient(
    "/api/v1/client_job/update",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function delJob(client_job_id) {
  return apiClient("/api/v1/client_job/delete", "POST", "json", false, false, {
    id: client_job_id,
  });
}

export function fetchClientJobs(params) {
  let data = apiClient(
    "/api/v1/client_job",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadClientJobs(data);
  }
}

export function addBusiness(params) {
  return apiClient("/api/v1/business", "POST", "json", false, false, params);
}

export function updateBusiness(params) {
  return apiClient(
    "/api/v1/business/edit",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function deleteBusiness(params) {
  return apiClient(
    "/api/v1/business/delete",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function fetchClientBusinesses(params) {
  let data = apiClient(
    "/api/v1/business/client",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadBusinessesData(data);
  }
}

export function addDependant(params) {
  return apiClient("/api/v1/dependants", "POST", "json", false, false, params);
}

export function updateDependant(params) {
  return apiClient(
    "/api/v1/dependants/update",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function delDependant(dependant_id) {
  return apiClient("/api/v1/dependants/void", "POST", "json", false, false, {
    id: dependant_id,
  });
}

export function fetchClientDependants(params) {
  let data = apiClient(
    "/api/v1/dependants/client",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadClientDependants(data);
  }
}

export function fetchGroupMembers(params) {
  let data = apiClient(
    "/api/v1/clients/members",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadGroupMembers(data);
  }
}

export function fetchGroups(){
    return apiClient(
      "/api/v1/clients/groups",
      "GET",
      "json",
      false,
      false,
      {}
    );
}

export function addClientToGroup(params){
  return apiClient(
    "/api/v1/clients/add_members",
    "POST",
    "json",
    false,
    false,
    params
  );
}

function loadIndividualsTable(client_type) {
  const url = getBaseURL();
  // Use Set to store unique client IDs

  const table = $("#individualsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    paging: true,
    processing: true,
    serverSide: true,
    columns: [
      {
        data: null,
        orderable: false,
        className: "select-checkbox",
        render: function (data, type, row) {

          const dataFields = getIndividualDatafields(data);
          return `<input type="checkbox" class="client-checkbox" ${dataFields}>`;
        }
      },
      { data: "identifier" },
      { data: "firstname" },
      { data: "lastname" },
      { data: "gender", defaultContent: "" },
      { data: "date_of_birth" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      { targets: 0, orderable: false }, // Ensure no ordering on checkbox column
      { targets: 1, orderable: true },
      { render: getIndividualViewBtn, data: null, targets: [6] },
      { render: getIndividualEditBtn, data: null, targets: [7] },
      { render: getIndividualDelBtn, data: null, targets: [8] },
    ],
    order: [[1, "asc"]], // Default sorting on the second column (identifier)
    ajax: {
      url: `${url}/api/v1/clients`,
      type: "GET",
      dataType: "json",
      data: { client_type: client_type },
      async: true,
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      beforeSend: function () {
        $("body").removeClass("loading");
      },
      dataSrc: function (json) {
        console.log("API Response:", json);
        return json.data;
      }
    },
    initComplete: function () {
      $("#individualsTable thead tr").prepend(`
        <th>
          <input type="checkbox" id="select-all">
        </th>
      `);

      // Handle select-all functionality
      $("#select-all").on("click", function () {
        let isChecked = $(this).prop("checked");
        $(".client-checkbox").each(function () {
          let clientId = $(this).data("record-id");
          $(this).prop("checked", isChecked);
          if (isChecked) {
            selectedClients.add(clientId);
          } else {
            selectedClients.delete(clientId);
          }
        });
      });
    },
    drawCallback: function () {
      // Restore checked states when table redraws (e.g., pagination)
      $(".client-checkbox").each(function () {
        let clientId = $(this).data("record-id");
        if (selectedClients.has(clientId)) {
          $(this).prop("checked", true);
        }
      });
    }
  });

  // Handle individual checkbox selection
  $(document).on("change", ".client-checkbox", function () {
    let clientId = $(this).data("record-id");
    if ($(this).is(":checked")) {
      selectedClients.add(clientId);
    } else {
      selectedClients.delete(clientId);
    }

    if (selectedClients.size > 0) {
      $("#addToGroupFormBtn").removeClass("d-none");
    } else {  
      $("#addToGroupFormBtn").addClass("d-none");
    }
    
    if (selectedClients.size > 1){
      $("#createGroupFormBtn").removeClass("d-none");
    } else {
      $("#createGroupFormBtn").addClass("d-none");
    }
    
  });
}

export function getSelectedClients() {
  return Array.from(selectedClients)
}


function getIndividualViewBtn(data, type, row, meta) {

  let dataFields = getIndividualDatafields(data)

  return `<button type='button' class="btn btn-block btn-primary recordBtn" 
       ${dataFields} > <i class="fas fa-file" aria-hidden="true"></i></button>`;
}

function getIndividualDatafields(data) {
  const URL = getBaseURL();
  const profile_picture = `${URL}${data.profile_picture}`;

  return `data-record-id = "${data.id}"
          data-record-identifier  = "${data.identifier}" 
          data-record-firstname  = "${data.firstname}" 
          data-record-lastname = "${data.lastname}"
          data-record-gender = "${data.gender}"
          data-record-date-of-birth = "${data.date_of_birth}"
          data-record-home-district ="${data.home_district_name}"
          data-record-home-ta ="${data.home_ta_name}"
          data-record-home-village ="${data.home_village_name}"
          data-record-current-district ="${data.current_district_name}"
          data-record-current-ta ="${data.current_ta_name}"
          data-record-current-village ="${data.current_village_name}"
          data-record-nearest-landmark="${data.nearest_landmark}"
          data-record-created-at = "${data.created_at}"
          data-profile-picture = "${profile_picture}"
          data-client-type = "individual"`;
}

function getIndividualEditBtn(data, type, row, meta) {
  let dataFields = `data-id = "${data.id}"
              data-identifier  = "${data.identifier}" 
              data-identifier-type-id = "${data.identifier_type_id}" 
              data-firstname = "${data.firstname}" 
              data-lastname= "${data.lastname}"
              data-gender= "${data.gender}"
              data-date-of-birth= "${data.date_of_birth}"
              data-home-region ="${data.home_region_id}"
              data-home-district ="${data.home_district_id}"
              data-home-ta ="${data.home_ta_id}"
              data-home-village ="${data.home_village_id}"
              data-current-region ="${data.current_region_id}"
              data-current-district ="${data.current_district_id}"
              data-current-ta ="${data.current_ta_id}"
              data-current-village="${data.current_village_id}"
              data-nearest-landmark="${data.nearest_landmark}"
              data-spouse-id = "${data.spouse_id}"
              data-action-type = "edit"
              data-client-type = "individual"`;

  return getButton(dataFields, "", "default edit-client", "fas fa-edit ");
}

function getIndividualDelBtn(data, type, row, meta) {
  return getButton(
    `data-id = "${data.id}" data-client-type = "individual"`,
    "del-client",
    "danger",
    "fa fa-trash"
  );
}

function loadOrganizationsTable(client_type) {
  const url = getBaseURL();
  $("#organizationsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    paging: true,  // Ensure paging is enabled
    processing: true,
    serverSide: true,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "category", defaultContent: "" },
      { data: "email_address", defaultContent: "null" },
      { data: "phone_number" },
      { data: "registered" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getOrgEditBtn,
        data: null,
        targets: [7],
      },
      {
        render: getOrgViewBtn,
        data: null,
        targets: [6],
      },
      {
        render: getOrgDelBtn,
        data: null,
        targets: [8],
      },
    ],
    ajax: {
      url: `${url}/api/v1/clients`,
      type: "GET",
      dataType: "json",
      data: { client_type: client_type },
      async: true,
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      beforeSend: function () {
        $("body").removeClass("loading");
      },
      dataSrc: function (json) {
        console.log("API Response:", json); // Verify API response
        return json.data;
      }
    },
  });
}

function getOrgViewBtn(data, type, row, meta) {
  let dataFields = `data-record-id ="${data.id}"
                    data-org-name ="${data.name}" 
                    data-category="${data.category}"
                    data-purpose="${data.purpose}"
                    data-bus-start-date="${data.start_date}"
                    data-email-address="${data.email_address}"
                    data-phone-number="${data.phone_number}"
                    data-office-location="${data.office_location}"
                    data-postal-address="${data.postal_address}"
                    data-registered="${data.registered}"
                    data-client-type = "organization"`;


  return `<button type='button' class="btn btn-block btn-primary recordBtn" 
          ${dataFields} > <i class="fas fa-file" aria-hidden="true"></i></button>`;
}

function getOrgEditBtn(data, type, row, meta) {
  let dataFields = `data-id ="${data.id}"
                    data-name ="${data.name}" 
                    data-category="${data.category}"
                    data-purpose="${data.purpose}"
                    data-bus-start-date="${data.start_date}"
                    data-email-address="${data.email_address}"
                    data-phone-number="${data.phone_number}"
                    data-office-location="${data.office_location}"
                    data-postal-address="${data.postal_address}"
                    data-registered="${data.registered}"
                    data-action-type = "edit"
                    data-client-type = "organization"`;

  return getButton(dataFields, "", "default edit-client", "fas fa-edit");
}

function getOrgDelBtn(data, type, row, metas) {
  return getButton(
    `data-id = "${data.id}" data-client-type = "organization"`,
    "del-client",
    "danger",
    "fa fa-trash"
  );
}

function loadGroupsTable(client_type) {
  const url = getBaseURL();
  $("#groupsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    paging: true,  // Ensure paging is enabled
    processing: true,
    serverSide: true,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "category", defaultContent: "" },
      { data: "total_members", defaultContent: "null" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getGroupViewBtn,
        data: null,
        targets: [4],
      },
      {
        render: getGroupEditBtn,
        data: null,
        targets: [5],
      },
      {
        render: getGroupDelBtn,
        data: null,
        targets: [6],
      },
    ],
    ajax: {
      url: `${url}/api/v1/clients`,
      type: "GET",
      dataType: "json",
      data: { client_type: client_type },
      async: true,
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      beforeSend: function () {
        $("body").removeClass("loading");
      },
      dataSrc: function (json) {
        console.log("API Response:", json); // Verify API response
        return json.data;
      }
    },
  });
}

function getGroupViewBtn(data, type, row, meta) {
  let dataFields = `data-record-id ="${data.id}"
                    data-group-id ="${data.group_id}"
                    data-group-name="${data.name}" 
                    data-category="${data.category}"
                    data-total-members="${data.total_members}"
                    data-client-type = "group"`;

  return `<button type='button' class="btn btn-block btn-primary recordBtn" 
${dataFields} > <i class="fas fa-file" aria-hidden="true"></i></button>`;
}

function getGroupEditBtn(data, type, row, meta) {

  let dataFields = `data-record-id ="${data.id}"
                    data-group-id ="${data.group_id}"
                    data-group-name="${data.name}" 
                    data-category="${data.category}"
                    data-total-members="${data.category}"
                    data-action-type = "edit"
                    data-client-type = "group"`;

  return getButton(dataFields, "group-client", "default edit-client", "fas fa-edit");

}

function getGroupDelBtn(data, type, row, meta) {
  return getButton(
    `data-id = "${data.id}" data-client-type = "organization"`,
    "del-client",
    "danger",
    "fa fa-trash"
  );
}



function loadGroupMembers(dataset) {
  $("#membersTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "identifier" },
      { data: "firstname" },
      { data: "lastname" },
      { data: "gender" },
      { data: "date_of_birth" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      { render: getIndividualViewBtn, data: null, targets: [5] },
      { render: getIndividualEditBtn, data: null, targets: [6] },
      { render: getRemoveDelBtn, data: null, targets: [7] },
    ],
  });
}

function getRemoveDelBtn(data, type, row, meta) {
  return getButton(
    `data-id = "${data.id}" data-client-type = "individual"`,
    "del-member",
    "danger",
    "fa fa-times"
  );
}


//Clients Jobs Code
function loadClientJobs(dataset) {
  $("#jobsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "client_job_id" },
      { data: "title" },
      { data: "department" },
      { data: "employer_type" },
      { data: "employer_name" },
      { data: "employment_type" },
      { data: "date_started" },
      { data: "contract_due" },
      { data: "net_salary" },
      { data: "gross_salary" },
      { data: "pay_date" },
      { data: "postal_address" },
      { data: "email_address" },
      { data: "phone_number" },
      { data: "district" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getJobEditBtn,
        data: null,
        targets: [15],
      },
      {
        render: getJobDelBtn,
        data: null,
        targets: [16],
      },
      {
        targets: [8, 9], // Targeting the 'Amount' column
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

function getJobEditBtn(data, type, row, metas) {
  let dataFields = `data-client-job-id = "${data.client_job_id}"
    data-title = "${data.title}" 
    data-department  = "${data.department}" 
    data-employer-type = "${data.employer_type}"
    data-employer-name = "${data.employer_name}"
    data-employment-type = "${data.employment_type}"
    data-date-started = "${data.date_started}"
    data-contract-due ="${data.contract_due}"
    data-net-salary ="${data.net_salary}"
    data-gross-salary ="${data.gross_salary}"
    data-pay-date ="${data.pay_date}"
    data-postal-address ="${data.postal_address}"
    data-email-address ="${data.email_address}"
    data-phone-number="${data.phone_number}"
    data-spouse-id = "${data.district}"
    data-action-type = "edit"`;

  return getButton(dataFields, "", "default edit-client-job", "fas fa-edit");
}

function getJobDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-client-job-id = "${data.client_job_id}" `,
    "del-client-job",
    "danger",
    "fa fa-trash"
  );
}

function loadClientDependants(dataset) {
  $("#dependantsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "dependancy" },
      { data: "relationship" },
      { data: "amount" },
      { data: "frequency" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getDependantEditBtn,
        data: null,
        targets: [5],
      },
      {
        render: getDependantDelBtn,
        data: null,
        targets: [6],
      },
      {
        targets: [3], // Targeting the 'Amount' column
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

function getDependantEditBtn(data, type, row, metas) {
  let dataFields = `data-client-dependant-id = "${data.id}"
    data-dependancy = "${data.dependancy}" 
    data-relationship  = "${data.relationship}" 
    data-amount = "${data.amount}"
    data-frequency = "${data.frequency}"
    data-action-type = "edit"`;

  return getButton(dataFields, "", "default edit-dependant", "fas fa-edit");
}

function getDependantDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-dependant-id = "${data.id}" `,
    "del-client-dependant",
    "danger",
    "fa fa-trash"
  );
}

function loadBusinessesData(dataset) {
  $("#businessTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "industry" },
      { data: "short_description" },
      { data: "name" },
      { data: "location" },
      { data: "start_date" },
      { data: "description" },
      { data: "registered" },
      { data: null },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getBusinessViewBtn,
        data: null,
        targets: [8],
      },
      {
        render: getBusinessEditBtn,
        data: null,
        targets: [9],
      },
      {
        render: getBusinessDelBtn,
        data: null,
        targets: [10],
      },
      {
        visible: false,
        targets: [2, 6],
      },
    ],
  });
}

function getBusinessEditBtn(data, type, row, metas) {
  let dataFields = `data-client-bus-id = "${data.id}"
    data-bus-name = "${data.name}" 
    data-bus-industry = "${data.industry}" 
    data-bus-start-date = "${data.start_date}"
    data-bus-location = "${data.location}"
    data-bus-short-desc = "${data.short_description}"
    data-bus-description = "${data.description}"
    data-bus-registered = "${data.registered}"
    data-action-type = "edit"`;

  return getButton(dataFields, "", "default edit-business", "fas fa-edit");
}

function getBusinessDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-client-bus-id = "${data.id}" `,
    "del-client-business",
    "danger",
    "fa fa-trash"
  );
}

function getBusinessViewBtn(data, type, row, metas) {
  let dataFields = `data-client-business-id = "${data.id}"
    data-bus-name = "${data.name}" 
    data-bus-industry  = "${data.industry}" 
    data-bus-start-date = "${data.start_date}"
    data-bus-location = "${data.location}"
    data-bus-short-desc = "${data.short_description}"
    data-bus-des = "${data.description}"
    data-bus-registered = "${data.registered}"
    data-action-type = "edit"`;

  return getButton(dataFields, "client-business", "primary", "fas fa-eye");
}

function getButton(dataFields, modal, color, icon) {
  return `<button type='button' class="btn btn-block btn-${color}" data-toggle="modal" 
          data-target="#modal-${modal}" ${dataFields} ><i class="${icon}" aria-hidden="true"></i></button>`;
}

export function addAsset(params) {
  return apiClient("/api/v1/assets", "POST", "json", false, false, params);
}

export function updateAsset(params) {
  return apiClient("/api/v1/assets/edit", "POST", "json", false, false, params);
}

export function delAsset(assetId) {
  return apiClient("/api/v1/assets/delete", "POST", "json", false, false, {
    id: assetId,
  });
}

export function fetchClientAssets(params) {
  let data = apiClient(
    "/api/v1/assets/client",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadAssetsData(data);
  }

  return data;
}

function loadAssetsData(dataset) {
  $("#assetsTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "identifier" },
      { data: "identifier_type" },
      { data: "name" },
      { data: "purchase_date" },
      { data: "purchase_price" },
      { data: "market_value" },
      { data: "description" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getAssetEditBtn,
        data: null,
        targets: [8],
      },
      {
        render: getAssetDelBtn,
        data: null,
        targets: [9],
      },
      {
        targets: [5, 6], // Targeting the 'Amount' column
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

function getAssetEditBtn(data, type, row, metas) {
  let dataFields = `data-client-asset-id = "${data.id}"
  data-identifier = "${data.identifier}" 
  data-identifier-type = "${data.identifier_type}" 
  data-asset-name = "${data.name}"
  data-purchase-date = "${data.purchase_date}"
  data-purchase-price = "${data.purchase_price}"
  data-market-value = "${data.market_value}"
  data-asset-description = "${data.description}"
  data-action-type = "edit"`;

  return getButton(dataFields, "", "default edit-asset", "fas fa-edit");
}

function getAssetDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-asset-id = "${data.id}" `,
    "del-client-asset",
    "danger",
    "fa fa-trash"
  );
}

export function addOtherLoan(params) {
  return apiClient("/api/v1/otherloans", "POST", "json", false, false, params);
}

export function updateOtherLoan(params) {
  return apiClient(
    "/api/v1/otherloans/edit",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function delOtherLoan(assetId) {
  return apiClient("/api/v1/otherloans/delete", "POST", "json", false, false, {
    id: assetId,
  });
}

export function fetchClientOtherLoans(params) {
  let data = apiClient(
    "/api/v1/otherloans/client",
    "GET",
    "json",
    false,
    false,
    params
  );

  if (data != null) {
    loadOtherLoansData(data);
  }
}

function loadOtherLoansData(dataset) {
  $("#otherLoansTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "institution" },
      { data: "phone_number" },
      { data: "amount" },
      { data: "period" },
      { data: "period_type" },
      { data: "rate" },
      { data: "purpose" },
      { data: "loaned_date" },
      { data: "amount_paid" },
      { data: "closed" },
      { data: "stopped" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getOtherLoanEditBtn,
        data: null,
        targets: [12],
      },
      {
        render: getOtherLoanDelBtn,
        data: null,
        targets: [13],
      },
      {
        targets: [3, 9], // Targeting the 'Amount' column
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

function getOtherLoanEditBtn(data, type, row, metas) {
  let dataFields = `data-client-other-loan-id = "${data.id}"
                    data-institution = "${data.institution}" 
                    data-phone-number = "${data.phone_number}" 
                    data-amount-loaned = "${data.amount}"
                    data-loan-period = "${data.period}"
                    data-period-type = "${data.period_type}"
                    data-loan-rate = "${data.rate}"
                    data-loaned-date = "${data.loaned_date}"
                    data-amount-paid = "${data.amount_paid}"
                    data-other-loan-purpose = "${data.purpose}"
                    data-closed = "${data.closed}"
                    data-stopped = "${data.stopped}"
                    data-reason-for-stopping = "${data.reason_for_stopping}"
                    data-action-type = "edit"`;

  return getButton(dataFields, "", "default edit-otherloan", "fas fa-edit");
}

function getOtherLoanDelBtn(data, type, row, metas) {
  return getButton(
    `data-del-other-loan-id = "${data.id}" `,
    "del-client-otherloan",
    "danger",
    "fa fa-trash"
  );
}
