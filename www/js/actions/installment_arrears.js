import * as installmentArrears from "../services/installment_arrears.js";
import { formatCurrency } from "../utils/formaters.js"
import * as contentLoader from "../actions/contentLoader.js";
import { fetchRoleUsers } from "../services/users.js"
import { addRecoveryCase } from "../services/collections.js"

$(function () {

    // Populate the bulk collector dropdown on initial load
    populateCollectors("#bulkCollectorSelect");

    // --- SINGLE ASSIGNMENT LOGIC ---
    $(document).on("click", ".assign-collector", function () {
        const data = this.dataset;
        $.when(contentLoader.loadIndividualRecordView("views/forms/assign_arrear_collector.html", "dependant_form")).done(
            function () {
                // Populate the collector dropdown inside the modal
                populateCollectors("#collectorId");

                // Populate form fields with data from the clicked button
                $("#arrearId").val(data.arrearId);
                $("#loanId").val(data.loanId);
                $("#clientName").text(data.clientName);
                $("#clientIdentifier").text(data.clientIdentifier);
                $("#installmentNumber").text(data.installmentNumber);
                $("#installmentAmount").text(`MWK ${formatCurrency(data.installmentAmount)}`);
                $("#daysOverdue").text(`${data.daysOverdue} days`);
                $("#totalArrears").text(`MWK ${formatCurrency(data.totalArrears)}`);

                const categoryBadgeClass = { 'early': 'badge-warning', 'moderate': 'badge-danger', 'write_off': 'badge-dark' }[data.category] || 'badge-secondary';
                $("#categoryBadge").removeClass().addClass(`badge ${categoryBadgeClass}`).text(data.category.toUpperCase().replace('_', ' '));

                const statusBadgeClass = data.status === 'pending' ? 'badge-info' : 'badge-success';
                $("#statusBadge").removeClass().addClass(`badge ${statusBadgeClass}`).text(data.status.toUpperCase());
            }
        );
    });


    // Toggle "Select All" checkbox
    $(document).on('click', '#selectAllArrears', function () {
        $('.arrear-checkbox').prop('checked', this.checked);
        updateBulkAssignButton();
    });

    // Handle individual checkbox clicks
    $(document).on('click', '.arrear-checkbox', function () {
        if (!this.checked) {
            $('#selectAllArrears').prop('checked', false);
        }
        updateBulkAssignButton();
    });

    // Handle Bulk Assign button click
    $(document).on('click', '#bulkAssignBtn', function () {
        addRecoveryCase(bulkAssignParams());
    });
});

function bulkAssignParams() {
    const collectorId = $('#bulkCollectorSelect').val();
    const selectedArrearIds = $('.arrear-checkbox:checked').map(function () {
        return $(this).val();
    }).get();

    // Get the loan_ids by querying the checked rows in the DataTable
    const table = $("#installmentArrearsTable").DataTable();
    const installmentArrears = [];

    selectedArrearIds.forEach(arrearId => {
        const row = table.rows().nodes().to$().has(`input[value="${arrearId}"]`).closest('tr');
        const rowData = table.row(row).data();
        if (rowData && rowData.loan_id) {
           installmentArrears.push({
            arrear_id: parseInt(arrearId),
            loan_id: rowData.loan_id, 
            branch_id: rowData.client.branch_id,
            client_id: rowData.client.id
           });
        }
    });

    const params = {
        collector_id: collectorId,
        installment_arrears: installmentArrears
    };

    return params;
}


// --- BULK ASSIGNMENT LOGIC ---
function updateBulkAssignButton() {
    const selectedCount = $('.arrear-checkbox:checked').length;
    $('#bulkAssignBtn').prop('disabled', selectedCount === 0);
}


// Helper function to populate collector dropdowns
export function populateCollectors(selector = "#bulkCollectorSelect") {
    try {
        // Assign the result directly from the synchronous function call
        $.when(fetchRoleUsers({ role_name: "debt-collector" })).done(function (collectors) {


            const collectorSelect = $(selector);

            collectorSelect.find('option:not(:first)').remove();

            if (collectors && Array.isArray(collectors)) {
                collectors.forEach(user => {
                    const option = new Option(`${user.firstname} ${user.lastname}`, user.id);
                    collectorSelect.append(option);
                });
            }

            collectorSelect.trigger('change.select2');
        });

    } catch (error) {
        console.error("Failed to fetch or populate debt collectors:", error);
    }
}



