import { apiClient, isApiHealthy } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"
import { getDB, openDatabase } from "../offline/db.js";
import * as recoveryAttempts from "../offline/recovery-attempts.js";

export function addRecoveryCase(params) {
    return apiClient(
        "/api/v1/recovery_case",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export async function recoveryCases() {
    // Check if API is healthy
    if (isApiHealthy()) {
        // Online mode - fetch from API
        const data = apiClient(
            "/api/v1/recovery_cases",
            "GET",
            "json",
            false,
            false,
            {}
        )

        if (data && data.recovery_cases) {
            const flattenedData = flattenRecoveryCases(data.recovery_cases);
            populateRecoveryCasesTable(flattenedData);
        }

        return data;
    } else {
        // Offline mode - fetch from IndexedDB
        const offlineData = await getOfflineRecoveryCases();
        if (offlineData && offlineData.length > 0) {
            const flattenedData = flattenRecoveryCases(offlineData);
            populateRecoveryCasesTable(flattenedData);
            return { recovery_cases: flattenedData, offline: true };
        } else {
            console.warn("No recovery cases found offline");
            return { recovery_cases: [], offline: true };
        }
    }
}

// ✅ NEW FUNCTION: Flatten nested recovery case data for DataTable
function flattenRecoveryCases(cases) {
    return cases.map(caseData => ({
        id: caseData.id,
        branch_id: caseData.branch_id,
        installment_arrear_id: caseData.installment_arrear_id,
        loan_id: caseData.loan_id,
        assigned_to_user_id: caseData.assigned_to_user_id,
        assigned_by_user_id: caseData.assigned_by_user_id,
        status: caseData.status,
        opened_at: caseData.opened_at,
        closed_at: caseData.closed_at,
        // Client fields
        client_id: caseData.client?.id,
        client_name: caseData.client?.name,
        client_identifier: caseData.client?.identifier,
        client_type: caseData.client?.type,
        client_phone: caseData.client?.phone_number,
        client_gender: caseData.client?.gender,
        client_current_region: caseData.client?.current_region,
        client_current_district: caseData.client?.current_district,
        client_current_ta: caseData.client?.current_ta,
        client_current_village: caseData.client?.current_village,
        // Installment arrear fields
        arrear_amount: caseData.installment_arrear?.amount,
        arrear_days_overdue: caseData.installment_arrear?.days_overdue,
        arrear_due_date: caseData.installment_arrear?.due_date,
        arrear_principal: caseData.installment_arrear?.principal,
        arrear_interest: caseData.installment_arrear?.interest,
        // Loan fields
        loan_amount: caseData.loan?.amount,
        loan_purpose: caseData.loan?.purpose,
        loan_interest_rate: caseData.loan?.interest_rate,
        loan_portfolio_name: caseData.loan?.portifolio_name,
        // Original nested objects for reference
        client: caseData.client,
        installment_arrear: caseData.installment_arrear,
        loan: caseData.loan
    }));
}

// NEW FUNCTION: Fetch recovery cases from IndexedDB for the current user
export async function getOfflineRecoveryCases() {
    try {
        const userId = sessionStorage.getItem("user_id");

        if (!userId) {
            console.error("No user_id found in session");
            return [];
        }

        const database = getDB() || (await openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["recovery_cases"], "readonly");
            const store = transaction.objectStore("recovery_cases");
            const index = store.index("assigned_to_user_id");

            // Query only cases assigned to the current user
            const request = index.getAll(parseInt(userId));

            request.onsuccess = (event) => {
                const cases = event.target.result;
                console.log(`✅ Retrieved ${cases.length} offline recovery cases for user ${userId}`);
                resolve(cases);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline recovery cases:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineRecoveryCases:", error);
        return [];
    }
}

function populateRecoveryCasesTable(dataset) {
    const table = $("#recoveryCasesTable");

    if ($.fn.DataTable.isDataTable(table)) {
        table.DataTable().clear().destroy();
    }

    table.DataTable({
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
            { data: "client_name" },
            { data: "client_identifier" },
            { data: "assigned_by_user_id" },
            { data: "arrear_amount" },
            { data: "arrear_days_overdue" },
            { data: "status" },
            { data: "opened_at" },
            { data: "id" },
            { data: null }
        ],
        columnDefs: [
            {
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        return formatCurrency(data);
                    }
                    return data;
                },
                targets: [4] // Arrear Amount column
            },
            {
                render: function (data, type, row) {
                    const badgeClass = {
                        'open': 'badge-danger',
                        'closed': 'badge-success',
                        'pending': 'badge-warning'
                    }[data] || 'badge-secondary';

                    return `<span class="badge ${badgeClass}">${data.toUpperCase()}</span>`;
                },
                targets: [6] // Status column
            },
            {
                render: function (data, type, row) {
                    return new Date(data).toLocaleDateString();
                },
                targets: [7] // Opened Date column
            },
            {
                render: function (data, type, row) {
                    return getAttemptsButton(data, type, row);
                },
                targets: [8] // Total Attempts column
            },
            {
                render: function (data, type, row) {
                    return getRecoveryCaseActions(data, type, row);
                },
                targets: [9] // Actions column
            }
        ]
    });
}

async function loadAttemptsCount(caseId) {
    try {
        const db = getDB() || (await openDatabase());

        return new Promise((resolve) => {
            const transaction = db.transaction(["recovery_attempts"], "readonly");
            const store = transaction.objectStore("recovery_attempts");
            const index = store.index("recovery_case_id");
            const request = index.getAll(caseId);

            request.onsuccess = (event) => {
                const attempts = event.target.result;
                const button = $(`.view-attempts[data-case-id="${caseId}"]`);
                button.find(".attempt-count").text(attempts.length);
                resolve(attempts.length);
            };

            request.onerror = (event) => {
                console.error("Error loading attempts count:", event.target.error);
                resolve(0);
            };
        });
    } catch (error) {
        console.error("Error in loadAttemptsCount:", error);
    }
}

function getAttemptsButton(caseId, type, row) {
    return `
        <button type="button" class="btn btn-sm btn-outline-primary view-attempts" 
            data-case-id="${caseId}" title="View recovery attempts">
            <i class="fas fa-history"></i> <span class="attempt-count">0</span>
        </button>
    `;
}

function getRecoveryCaseActions(data, type, row) {
    let dataFields = `data-case-id="${data.id}"
                      data-client-id="${data.client_id}"    
                      data-client-name="${data.client_name}"
                      data-client-identifier="${data.client_identifier}"
                      data-arrear-amount="${data.arrear_amount}"
                      data-days-overdue="${data.arrear_days_overdue}"
                      data-status="${data.status}"
                      data-loan-purpose="${data.loan_purpose}"`;

    return `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-info follow-up" ${dataFields} title="View Details">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

export function updateRecoveryCase(params) {
    return apiClient(
        "/api/v1/recovery_case/update",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export function deleteRecoveryCase(params) {
    return apiClient(
        "/api/v1/recovery_case/delete",
        "POST",
        "json",
        false,
        false,
        params
    )
}

// NEW FUNCTION: Get attempts count and data for a recovery case
export async function getRecoveryAttemptsByCase(caseId) {
    const database = getDB() || (await openDatabase());

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(["recovery_attempts"], "readonly");
        const store = transaction.objectStore("recovery_attempts");
        const index = store.index("recovery_case_id");

        const request = index.getAll(caseId);

        request.onsuccess = (event) => {
            const attempts = event.target.result;
            console.log(`✅ Retrieved ${attempts.length} recovery attempts for case ${caseId}`);
            resolve(attempts);
        };

        request.onerror = (event) => {
            console.error("Error fetching recovery attempts:", event.target.error);
            reject(event.target.error);
        };
    });
}

export async function populateRecoveryAttempts(caseId) {

    try {
        const attempts = await recoveryAttempts.getRecoveryAttemptsByCaseId(caseId);

        const table = $("#recoveryCasesTable");

        if ($.fn.DataTable.isDataTable(table)) {
            table.DataTable().clear().destroy();
        }

        table.DataTable({
            destroy: true,
            responsive: true,
            searching: true,
            ordering: true,
            lengthChange: true,
            autoWidth: false,
            info: true,
            data: attempts,
            columns: [
                { data: "created_at" },
                { data: "client_reached" },
                { data: "willing_to_pay" },
                { data: "payment_made" },
                { data: "synced" },
                { data: null }
            ],
            columnDefs: [
                {
                    render: function (data, type, row) {
                        return new Date(data).toLocaleDateString() + " " + new Date(data).toLocaleTimeString();
                    },
                    targets: [0] // Date column
                },
                {
                    render: function (data, type, row) {
                        const badgeClass = data === 'yes' ? 'badge-success' : 'badge-danger';
                        const label = data === 'yes' ? 'Yes' : 'No';
                        return `<span class="badge ${badgeClass}">${label}</span>`;
                    },
                    targets: [1] // Client Reached column
                },
                {
                    render: function (data, type, row) {
                        const badgeClass = data === 'yes' ? 'badge-success' : (data === 'no' ? 'badge-danger' : 'badge-warning');
                        const label = data === 'yes' ? 'Yes' : (data === 'no' ? 'No' : 'Not Sure');
                        return `<span class="badge ${badgeClass}">${label}</span>`;
                    },
                    targets: [2] // Willing to Pay column
                },
                {
                    render: function (data, type, row) {
                        const badgeClass = data === 'yes' ? 'badge-success' : 'badge-secondary';
                        const label = data === 'yes' ? 'Yes' : 'No';
                        return `<span class="badge ${badgeClass}">${label}</span>`;
                    },
                    targets: [3] // Payment Made column
                },
                {
                    render: function (data, type, row) {
                        const badgeClass = data ? 'badge-success' : 'badge-warning';
                        const label = data ? 'Yes' : 'Pending';
                        return `<span class="badge ${badgeClass}"><i class="fas fa-${data ? 'check-circle' : 'clock'}"></i> ${label}</span>`;
                    },
                    targets: [4] // Synced column
                },
                {
                    render: function (data, type, row) {
                        return getViewMoreButton(data, type, row);
                    },
                    targets: [5] // View More column
                },
            ]
        });
    } catch (error) {
        console.error("Error loading recovery attempts:", error);
        notify("Failed to load recovery attempts", "danger");
    }

}

function getViewMoreButton(data, type, row) {
    const attemptJson = JSON.stringify(row).replace(/"/g, '&quot;');
    return `
        <button type="button" class="btn btn-sm btn-outline-info view-more-attempt" 
            data-attempt='${attemptJson}' title="View full details">
            <i class="fas fa-eye"></i> View
        </button>
    `;
}


