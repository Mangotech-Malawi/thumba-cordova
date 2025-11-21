import { apiClient, fileApiClient} from "./api-client.js";

export function register(params) {
    return apiClient("/api/v1/account/new", "POST", "json", false, false, params);
}

export function fetchAccounts() {
    let data = apiClient("/api/v1/accounts", "GET", "json", false, false, {});

    if (data != null) {
        populateAccountsTable(data);
    }

    return data;
}

export function addBranch(params){
    return apiClient("/api/v1/branch/new", "POST", "json", false, false, params);
}

export function updateBranch(params){
    return apiClient("/api/v1/branch/edit", "POST", "json", false, false, params);
}

export function fetchBranches(table_type) {
    let data = apiClient("/api/v1/branches", "GET", "json", false, false, {});

    if (data != null) {
        if(table_type == "user_invitation"){
            populateUserInvitationBranchesTable(data);
        } else if  (table_type == "account"){
            populateBranchesTable(data);
        }
    }

    return data;
}



export function uploadLogo(account_id, imageFile) {
    const formData = new FormData();
    formData.append("account[logo]", imageFile); // Rails param for the image
    formData.append("account[account_id]", account_id);

    return fileApiClient(
        `/api/v1/account/upload_logo`,
        "POST",
        null,
        false, // Synchronous
        false,
        formData,
        true // isFile
    );
}

export function changeAccountStatus(params) {
    return apiClient("/api/v1/account/change_status", "POST", "json", false, false, params);
}

export function update(params){
    return apiClient("/api/v1/account/edit", "POST", "json", false, false, params);
}

function populateAccountsTable(dataset) {
    $("#accountsTable").DataTable({
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
            { data: "name" },
            { data: "address" },
            { data: "email" },
            { data: "phone_number" },
            { data: "created_at" },
            { data: null },
            { data: null },
        ],
        columnDefs: [
            {
                render: getSwitchButton,
                data: null,
                targets: [6],
            }
            ,
            {
                render: getDelButton,
                data: null,
                targets: [7],
            },
        ],
    });
}

function getSwitchButton(data, type, row, meta) {
    if (data.deactivated)
        return `<div class="icheck-primary d-inline">
                    <input class="account-status" type="checkbox" id="${data.id}"
                    data-id="${data.id}" data-active = "false" >
                    <label class="text-danger" for="${data.id}">
                        Inactive
                    </label>
                </div>`
    else
        return `<div class="icheck-primary d-inline ">
                    <input class="account-status" type="checkbox" id="${data.id}" 
                    data-id="${data.id}" data-active = "true" checked>
                    <label class="text-success" for="${data.id}">
                     Active
                    </label>
                </div>`

}


function getDelButton(data, type, row, meta) {
    return `<button  type="button"  class="btn btn-danger"
        data-toggle="modal" data-target = "#modal-del-interest"
        data-del-interest-id = "${data.id}">
       <i class="fas fa-trash"></i></button>`;
}


function populateBranchesTable(dataSet) {
    $("#branchesTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet,
        columns: [
            { data: "branch_code" },
            { data: "name" },
            { data: "location" },
            { data: "branch_type" },
            { data: "email_address" },
            { data: "phone_number" },
            { data: null },
            { data: null },
            { data: null },
        ],
        columnDefs: [
            {
                render: getManagerDetails,
                data: null,
                targets: [6],
            },
            {
                render: getEditBranchBtn,
                data: null,
                targets: [7],
            },
            {
                render: getDelBranchBtn,
                data: null,
                targets: [8],
            }
        ],
    });
}

function getManagerDetails(data, type, row, metas){    
    return `${data.firstname} ${data.lastname}`
}

function getEditBranchBtn(data, type, row, metas) {
    let dataFields = `data-branch-id = "${data.id}"
                      data-branch-code = "${data.branch_code}"
                      data-name = "${data.name}"
                      data-location = "${data.location}"
                      data-branch-type = "${data.branch_type}"
                      data-email-address = "${data.email_address}"
                      data-phone-number = "${data.phone_number}"
                      data-username = "${data.username}"
                      data-firstname = "${data.firstname}"
                      data-lastname = "${data.lastname}"
                      data-manager-id = "${data.manager_id}"
                      data-postal-address = "${data.postal_address}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "default edit-branch",
        "fas fa-edit");
}

function getDelBranchBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "danger  delete-branch",
        "fas fa-trash")
}



function populateUserInvitationBranchesTable(dataSet) {
    $("#userInvitationBranchesTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet,
        columns: [
            { data: null },
            { data: "branch_code" },
            { data: "name" },
            { data: null },
        ],
        columnDefs: [
            {
                render: getCheckBox,
                data: null,
                targets: [0],
            },
            {
                render: getRoleSelector,
                data: null,
                targets: [3],
            },
        ],
    });
}

function getCheckBox(data, type, row, metas) {
    return `
        <div class="form-check icheck-primary">
            <input class="form-check-input  branch-checkbox" type="checkbox" 
                   id="branch_${data.id}" data-branch-id="${data.id}">
            <label class="form-check-label" for="branch_${data.id}"></label>
        </div>
    `;
}

function getRoleSelector(data, type, row, metas) {
    return `
        <select id="role-selector${data.id}" class="form-control role-selector mr-4" style="width: 100%;" name="branch_roles_${data.id}" data-branch-id="${data.id}">
        </select>
    `;
}


function getButton(dataFields, modal, color, icon) {
    return `<button type='button' class="btn btn-block btn-${color}" data-toggle="modal" 
            data-target="#modal-${modal}" ${dataFields} ><i class="${icon}" aria-hidden="true"></i></button>`;
}