import * as loans from "../services/loans.js";
import * as contentLoader from "../actions/contentLoader.js";
import { notify } from "../services/utils.js";
import * as form from "../utils/forms.js";

let currentDisbursementDataset;
let loan_id;
localStorage;
let disbursementFormTitle;
let currentDataset = null;
const disbursementModal = "#modal-disbursement";

$(function () {


    if (localStorage.getItem("loanDisbursementDataset") != null && typeof localStorage != undefined) {
        currentDisbursementDataset = JSON.parse(localStorage.getItem("loanDisbursementDataset"));
        loan_id = currentDisbursementDataset.loanId;
     
        $("#disbursementTitle").text(`Loan # ${loan_id} Disbursement for ${currentDisbursementDataset.applicant}`);
         
         $.when(loans.fetchLoanDisbursements({ loan_id: loan_id })).done(function () { });
    }

    $(document).on("click", ".loan-disbursement", function (e) {
        currentDisbursementDataset = this.dataset;
        localStorage.setItem("loanDisbursementDataset",
            JSON.stringify(currentDisbursementDataset));

        loan_id = $(this).data().loanId;
        let headerText = `Loan # ${loan_id} Disbursement for ${$(this).data().applicant}`;

        $.when(contentLoader.loadIndividualRecordView("views/loans/loan_disbursement.html", "loan_disbursement")).done(
            function () {
                $("#disbursementLoanId").val(loan_id);
                $("#disbursementTitle").text(headerText);

                $.when(loans.fetchLoanDisbursements({ loan_id: loan_id })).done(function () { });
            });

    });

    $(document).on("show.bs.modal", disbursementModal, function (e) {
        const opener = e.relatedTarget;

        if (opener.dataset.actionType === "add") {
            $("#disbursementModalTitle").text("Add Disbursement");
        } else if (opener.dataset.actionType === "edit") {
            // Populate modal fields with disbursement data for editing
            $("#disbursementId").val(opener.dataset.disbursementId);
            $("#disbursedAmount").val(opener.dataset.disbursedAmount);
            $("#disbursedDate").val(opener.dataset.disbursedDate);
            $("#notes").val(opener.dataset.notes || "");
            $("#disbursementModalTitle").text("Edit Disbursement");
        }

    });

    $(document).on("click", "#saveDisbursementBtn", function (e) {

        if (form.validateLoanDisbursementForm()) {
            if ($("#disbursementModalTitle").text().trim() === "Add Disbursement") {
                const resp = loans.addDisbursement(getDisbursementParams());

                if (resp.created) {
                    reloadDisbursements("Add Disbursement", "Disbursement added successfully");
                } else {
                    notify("center", "error", "Add Disbursement", resp.error, false, 3000);
                }
            } else if ($("#disbursementModalTitle").text().trim() === "Edit Disbursement") {
                const resp = loans.editDisbursement(getDisbursementParams());

                if (resp.updated) {
                    reloadDisbursements("Edit Disbursement", "Disbursement updated successfully");
                } else {
                    notify("center", "error", "Update Disbursement", resp.error, false, 3000);
                }
            }
        }

    });

    // Delete Disbursement
    $(document).on("click", ".delete-disbursement", function (e) {
        const disbursementId = $(this).data("disbursementId");
        if (confirm("Are you sure you want to delete this disbursement?")) {
            $.when(loans.deleteDisbursement({ disbursement_id: disbursementId })).done(function (resp) {
                if (resp && resp.deleted) {
                    reloadDisbursements("Delete Disbursement", "Disbursement deleted successfully");
                } else {
                    notify("center", "error", "Delete Failed", "Could not delete disbursement", false, 3000);
                }
            });
        }
    });


});

function reloadDisbursements(title, description) {
    $.when(
        notify(
            "center",
            "success",
            title,
            description,
            false,
            3000
        )
    ).done(function () {
        $.when(loans.fetchLoanDisbursements({ loan_id: loan_id })).done(function () {
            $(disbursementModal).modal("hide");
        });
    });
}

function getDisbursementParams() {
    const disbursementId = $("#disbursementId").val();
    const amount = $("#disbursedAmount").val();
    const disbursedOn = $("#disbursedDate").val();
    const notes = $("#notes").val();

    return {
        loan_id: loan_id,
        disbursement_id: disbursementId,
        disbursed_amount: amount,
        disbursed_on: disbursedOn,
        notes: notes
    }

}

