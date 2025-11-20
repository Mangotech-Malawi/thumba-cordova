import { apiClient } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"

export function fetchInvestimentPackages(...args) {
    let data = apiClient(
        "/api/v1/investiment_packages",
        "GET",
        "json",
        false,
        false,
        {}
    )

    if (args[0] === "load-none")
        return data
    else
        populateInvestmentPackagesTable(data);
}

export function addInvestmentPackage(params) {
    return apiClient(
        "/api/v1/investiment_package/add",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export function editInvestmentPackage(params) {
    return apiClient(
        "/api/v1/investiment_package/edit",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export function getPackageFile(params) {
    return apiClient(
        "/api/v1/investiment_package/download",
        "GET",
        "json",
        false,
        false,
        params
    )
}

export function getPackagesFile(params) {
    return apiClient(
        "/api/v1/investiment_packages/download",
        "GET",
        "json",
        false,
        false,
        params
    )
}


export function deleteInvestmentPackage(params) {
    return apiClient(
        "/api/v1/investiment_package/delete",
        "POST",
        "json",
        false,
        false,
        params
    )
}

function populateInvestmentPackagesTable(dataSet) {
    $("#investmentPackagesTable").DataTable({
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
            { data: "package_name" },
            { data: "package_type" },
            { data: "min_amount" },
            { data: "max_amount" },
            { data: "interest_rate" },
            { data: "interest_frequency" },
            { data: "duration" },
            { data: "currency" },
            { data: "risk_level" },
            { data: null },
            { data: null },
            { data: null }
        ],
        columnDefs: [
            {
                render: getDownloadBtn,
                data: null,
                targets: [10],
            },
            {
                render: getEditInvestmentPackageBtn,
                data: null,
                targets: [11],
            },
            {
                render: getDelInvestmentPackageBtn,
                data: null,
                targets: [12],
            },
            {
                targets: [3, 4], // Targeting the 'Amount' column
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


function getDownloadBtn(data, type, row, metas) {
    let dataFields = `data-investment-package-id = "${data.id}"`;

    return getButton(dataFields, "", "secondary  download-investment-package",
        "fas fa-download");
}

function getViewBtn(data, type, row, metas) {
    let dataFields = `data-investment-package-id = "${data.id}"
    data-package-name = "${data.package_name}"
    data-min-amount = "${data.min_amount}"
    data-max-amount = "${data.max_amount}"
    data-interest-rate = "${data.interest_rate}"
    data-interest-frequency = "${data.market_value}"
    data-duration = "${data.duration}"
    data-currency = "${data.currency}"
    data-risk-level = "${data.risk_level}"
    data-requirements = "${data.requirements}"
    data-terms-and-conditions = "${data.term_and_conditions}"
    data-payout-schedule = "${data.payout_schedule}"
    data-inves = "Edit Collateral Sale"`;

    return getButton(dataFields, "view more", "secondary ",
        "fas fa-download");
}


function getEditInvestmentPackageBtn(data, type, row, metas) {
    let dataFields = `data-investment-package-id = "${data.id}"
                      data-package-name = "${data.package_name}"
                      data-package-type = "${data.package_type}"
                      data-min-amount = "${data.min_amount}"
                      data-max-amount = "${data.max_amount}"
                      data-interest-rate = "${data.interest_rate}"
                      data-interest-frequency = "${data.market_value}"
                      data-compounding-frequency = "${data.compounding_frequency}"
                      data-duration = "${data.duration}"
                      data-currency = "${data.currency}"
                      data-risk-level = "${data.risk_level}"
                      data-requirements = "${data.requirements}"
                      data-terms-and-conditions = "${data.term_and_conditions}"
                      data-payout-schedule = "${data.payout_schedule}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "primary edit-investment-product", "fas fa-edit");
}


function getDelInvestmentPackageBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "danger delete-investment-package", "fas fa-trash");
}

export function fetchClientSubscriptions(params) {
    const data = apiClient(
        "/api/v1/investment_subscriptions",
        "GET",
        "json",
        false,
        false,
        params)


    populateInvestmentSubscriptionsTable(data);
}

function populateInvestmentSubscriptionsTable(dataSet) {
    $("#investmentSubscriptionTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet,
        columns: [
            { data: "subscription_id" },
            { data: "package_name" },
            { data: "start_date" },
            { data: "end_date" },
            { data: null },
            { data: null },
            { data: null }
        ],
        columnDefs: [

            {
                render: getInvestmentBtn,
                data: null,
                targets: [4],
            },
            {
                render: getEditInvestmentSubBtn,
                data: null,
                targets: [5],
            },
            {
                render: getDelInvestmentSubBtn,
                data: null,
                targets: [6],
            }
        ],
    });
}

function getInvestmentBtn(data, type, row, metas) {
    let dataFields = `data-subscription-id = "${data.subscription_id}"
                      data-package-id = "${data.package_id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "primary client-investments",
        "fas fa-piggy-bank ");
}

function getEditInvestmentSubBtn(data, type, row, metas) {
    let dataFields = `data-investment-id = "${data.id}"
                      data-investment-package-id = "${data.package_id}"
                      data-amount = "${data.amount}"
                      data-description = "${data.description}"
                      data-investment-date = "${data.investment_date}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "default .edit-investment-subscription",
        "fas fa-edit");
}

function getDelInvestmentSubBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "danger  delete-investment ",
        "fas fa-trash")
}


export function fetchInvestments() {
    let data = apiClient(
        "/api/v1/investiments",
        "GET",
        "json",
        false,
        false,
        {}
    )

    populateInvestmentsTable(data);
}

export function addInvestment(params) {
    return apiClient(
        "/api/v1/investiment/new",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export function editInvestment(params) {
    return apiClient(
        "/api/v1/investiment/edit",
        "POST",
        "json",
        false,
        false,
        params
    )
}


export function deleteInvestment(params) {
    return apiClient(
        "/api/v1/investiment/delete",
        "POST",
        "json",
        false,
        false,
        params
    )
}

function populateInvestmentsTable(dataSet) {
    $("#investmentsTable").DataTable({
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
            { data: "identifier" },
            { data: "client_name" },
            { data: "client_type_name" },
            { data: "product_name" },
            { data: "product_type" },
            { data: "investment_amount" },
            { data: "investment_date" }
        ]
    });
}

function getEditInvestmentBtn(data, type, row, metas) {
    let dataFields = `data-investment-id = "${data.id}"
                      data-investor-id = "${data.user_id}"
                      data-investment-package-id = "${data.investiment_package_id}"
                      data-amount = "${data.amount}"
                      data-description = "${data.description}"
                      data-investment-date = "${data.investment_date}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "investment", "primary ",
        "fas fa-edit");
}

function getDelInvestmentBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "danger  delete-investment ",
        "fas fa-trash")
}

export function fetchReturnsOnInvestments(params) {

    let data = apiClient(
        "/api/v1/investors/returns",
        "GET",
        "json",
        false,
        false,
        params
    )

    populateReturnsOnInvestmentsTable(data);
}

function populateReturnsOnInvestmentsTable(dataSet) {
    $("#returnOnInvestmentsTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet,
        columns: [
            { data: "firstname" },
            { data: "lastname" },
            { data: "package_name" },
            { data: "interest_rate" },
            { data: "amount" },
            { data: "roi" }

        ],
        columnDefs: [
            {
                targets: [4, 5], // Targeting the 'Amount' column
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


export function fetchClientInvestments(params) {

    let data = apiClient(
        "/api/v1/investor_returns",
        "GET",
        "json",
        false,
        false,
        params
    );

    populateSubOverviewTable(data);
    populateClientInvestmentsTable(data)
}

function populateSubOverviewTable(dataSet) {

    $("#subOverviewTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: false,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet.subscription_overview,
        columns: [
            { data: "month" },
            { data: "year" },
            { data: "amount" },
            { data: "total_investment" },
            { data: "compounded_amount" },
            { data: "roi" },
            { data: "roi_rate" }
        ],
        columnDefs: [
            {
                targets: [ 2, 3, 4], // Targeting the 'Amount' column
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

function populateClientInvestmentsTable(dataSet) {
    $("#clientInvestmensTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet.investiments,
        columns: [
            { data: "id" },
            { data: "investment_date" },
            { data: "amount" },
            { data: null },
            { data: null },
        ],
        columnDefs: [
            {
                render: getEditClientInvestmentBtn,
                data: null,
                targets: [3],
            },
            {
                render: getDelClientInvestmentBtn,
                data: null,
                targets: [4],
            },
            {
                targets: [ 2], // Targeting the 'Amount' column
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

function getEditClientInvestmentBtn(data, type, row, metas) {
    let dataFields = `data-investment-id = "${data.id}"
                      data-investor-id = "${data.user_id}"
                      data-investment-package-id = "${data.package_id}"
                      data-amount = "${data.amount}"
                      data-description = "${data.description}"
                      data-investment-date = "${data.investment_date}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "default edit-investment",
        "fas fa-edit");
}

function getDelClientInvestmentBtn(data, type, row, metas) {
    let dataFields = `data-id = "${data.id}"
                      data-action-type = "edit"`;

    return getButton(dataFields, "", "danger  delete-investment ",
        "fas fa-trash")
}


export function fetchMyReturnOnInvestments(params) {
    let data = apiClient(
        "/api/v1/investor_returns",
        "GET",
        "json",
        false,
        false,
        params
    )

    populateReturnOnInvestmentsTable(data);
}


function populateReturnOnInvestmentsTable(dataSet) {
    $("#myReturnOnInvestmentsTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: dataSet,
        columns: [
            { data: "package_name" },
            { data: "interest_rate" },
            { data: "amount" },
            { data: "roi" }
        ],
        columnDefs: [
        ],
    });
}

function getButton(dataFields, modal, color, icon) {
    return `<button type='button' class="btn btn-block btn-${color}" data-toggle="modal" 
              data-target="#modal-${modal}" ${dataFields} ><i class="${icon}" aria-hidden="true"></i></button>`;
}
