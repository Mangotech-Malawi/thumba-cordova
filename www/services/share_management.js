import { apiClient } from "./api-client.js";

// Share Classes 
export function addShareClass(params) {
    return apiClient("/api/v1/share_class", "POST", "json", false, false, params);
}

export function editShareClass(params){
    return apiClient("/api/v1/share_class", "PUT", "json", false, false, params);
}

export function fetchShareClasses(params) {
    const data = apiClient("/api/v1/share_classes",
        "GET",
        "json",
        false,
        false,
        params)

    loadShareClasses(data)

    return data;
}

export function loadShareClasses(dataset) {
    $("#shareClassesTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataset,
        columns: [
            { data: "name" },
            { data: "code" },
            { data: "price_per_share" },
            { data: "description" },
            { data: null },
            { data: null }
        ],

        columnDefs: [
            {

                render: getEditShareClassBtn,
                data: null,
                targets: [4],
            },
            {
                render: getDeleteShareClassBtn,
                data: null,
                targets: [5],
            }
        ],
    });
}


function getEditShareClassBtn(data, type, row, metas) {
    let dataFields = `data-share-class-id = "${data.id}"
                      data-name = "${data.name}"
                      data-code = "${data.code}"
                      data-price-per-share = "${data.price_per_share}"
                      data-description = "${data.description}"
                      data-action-type = "edit"
                      data-share-class-modal-title = "Edit Share Class"`;

    return getButton(dataFields, "share-class", "default edit-share-class",
        "fas fa-edit");
}

function getDeleteShareClassBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                    data-action-type = "edit"`;

    return getButton(dataFields, "", "danger del-share-class", "fas fa-trash");
}


// Shareholders
export function addShareholder(params) {
    return apiClient("/api/v1/shareholder", "POST", "json", false, false, params);
}

export function updateShareholder(params) {
    return apiClient("/api/v1/shareholder", "PUT", "json", false, false, params);
}

export function fetchShareholders(params) {
    const data = apiClient("/api/v1/shareholders",
        "GET",
        "json",
        false,
        false,
        params)

    loadShareholders(data)
}

export function loadShareholders(dataset) {

    $("#shareholdersTable").DataTable({
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
            { data: null },
            { data: null }
        ],

        columnDefs: [
            {
                render: getContributionBtn,
                data: null,
                targets: [4],
            },
            {

                render: getEditShareholderBtn,
                data: null,
                targets: [5],
            },
            {
                render: getDeleteShareholderBtn,
                data: null,
                targets: [6],
            }
        ],
    });
}

function getContributionBtn(data, type, row, metas) {
    let dataFields = `data-shareholder-id = "${data.shareholder_id}"
                      data-share-class-modal-title = "Edit Share Class"`;

    return getButton(dataFields, "capital-contribution", "default",
        "fas fa-money-bill-alt")
}

function getEditShareholderBtn(data, type, row, metas) {
    let dataFields = `data-shareholder-id = "${data.shareholder_id}"
                      data-identifier = "${data.identifier}"
                      data-identifier-type-id = "${data.identifier_type_id}"
                      data-firstname = "${data.firstname}"
                      data-lastname = "${data.lastname}"
                      data-gender = "${data.gender}"
                      data-email-address = "${data.email_address}"
                      data-phone-number = "${data.phone_number}"
                      data-date-of-birth = "${data.date_of_birth}"
                      data-share-class-modal-title = "Edit Share Class"`;

    return getButton(dataFields, "", "default edit-shareholder",
        "fas fa-edit");
}

function getDeleteShareholderBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.shareholder_id}"
                    data-action-type = "edit"`;

    return getButton(dataFields, "", "danger del-shareholder", "fas fa-trash");
}


// Capital Contributions

export function addCapitalContribution(params) {
    return apiClient("/api/v1/capital_contribution", "POST", "json", false, false, params);
}

export function editCapitalContribution(params){
    return apiClient("/api/v1/capital_contribution", "PUT", "json",false, false , params);
}

export function fetchCapitalContributions(params) {
    const data = apiClient("/api/v1/capital_contributions",
        "GET",
        "json",
        false,
        false,
        params)

    $.when(loadCapitalContributions(data)).done(function () {
        $(".capital-status-selector").select2();

        // Re-initialize select2 after every table draw (including responsive collapse/expand)
        $('#capitalContributionsTable').on('draw.dt responsive-display.dt', function () {
            $(".capital-status-selector").select2();
        });
    });
}

export function updateCapitalContributionStatus(params) {
    return apiClient("/api/v1/capital_contribution/status", "POST", "json", false, false, params);
}

export function loadCapitalContributions(dataset) {

    $("#capitalContributionsTable").DataTable({
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
            { data: "name" },
            { data: "code" },
            { data: "price_per_share" },
            { data: "amount" },
            { data: "status", render: getStatusBadge },
            { data: null },
            { data: null }
        ],

        columnDefs: [
            {
                render: getEditCapitalContributionBtn,
                data: null,
                targets: [9],
            },
            {
                render: getDeleteCapitalContributionBtn,
                data: null,
                targets: [10],
            }
        ],
    });
}

function getStatusBadge(data, type, row, metas) {
    let badgeClass = "badge-secondary";
    if (data === "approved") badgeClass = "badge-success";
    else if (data === "pending") badgeClass = "badge-warning";
    else if (data === "rejected") badgeClass = "badge-danger";

    if (data === "pending") {
        return `
            <select class="form-control form-control-sm d-inline capital-status-selector"
                    data-id="${row.id}" style="width:auto; min-width:110px;">
                <option value="pending" selected>Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
            </select>
        `;
    } else {
        return `<span class="badge ${badgeClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
    }
}

function getEditCapitalContributionBtn(data, type, row, metas) {
    let dataFields = `data-capital-contribution-id = "${data.id}"
                      data-shareholder-id = "${data.shareholder_id}"
                      data-share-class-selector = "${data.share_class_id}"
                      data-amount = "${data.amount}"
                      data-status = "${data.status}"
                      data-contributed-date = "${data.contributed_date}"
                      data-action-type = "edit"
                      data-share-class-modal-title = "Edit Capital Contribution"`;

    return getButton(dataFields, "", "default edit-capital-contribution",
        "fas fa-edit");
}

function getDeleteCapitalContributionBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                    data-action-type = "edit"`;

    return getButton(dataFields, "", "danger del-shareholder", "fas fa-trash");
}

// Shares s

export function fetchShares(params) {
    const data = apiClient("/api/v1/shares",
        "GET",
        "json",
        false,
        false,
        params)

    loadShares(data)
}

export function loadShares(dataset) {
    $("#sharesTable").DataTable({
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
            { data: "name" },
            { data: "total_quantity" }
        ]
    });
}

// Reusable button 

function getButton(dataFields, modal, color, icon) {
    return `<button type='button' class="btn btn-block btn-${color}" data-toggle="modal" 
            data-target="#modal-${modal}" ${dataFields} ><i class="${icon}" aria-hidden="true"></i></button>`;
}