import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as interest from "../services/interests.js";
import * as loans from "../services/loans.js";
import { notify } from "../services/utils.js";
import { setRecordText } from "../utils/utils.js";

const loanApplicationForm = "#loanApplicationForm";
let currentDataset = null;
localStorage;

$(function () {

    $(document).on("click", "#btnClientApplications", function (e) {
        loadClientApplicationsView();
    });

    $(document).on("click", "#clientLoanApplication", function (e) {
        loadLoanApplicationForm();
    });

    $(document).on("click", "#backBtn", function (e) {
        loadClientApplicationsView();
    });

    //Client Assets
    $(document).on("click", "#saveApplicationBtn", function (e) {
        if (form.validateLoanApplicationFormData()) {

            if ($("#loanApplicationTitle").text().trim() === "Add Loan Application") {
                if (loans.addApplication(loanApplicationParams()).created) {
                    notification(
                        true,
                        "center",
                        "success",
                        "application",
                        "Add Client Loan Application",
                        "Client application loan has been added successfully",
                        true,
                        3000
                    );
                } else if (loans.addApplication(loanApplicationParams()).has_active_application) {
                    notification(
                        true,
                        "center",
                        "error",
                        "application",
                        "Application arleady exist",
                        "Client cannot have more than one application in waiting or new status",
                        true,
                        7000
                    );
                }
            } else if ($("#loanApplicationTitle").text() === "Edit Loan Application") {
                notification(
                    loans.updateApplication(loanApplicationParams()).updated,
                    "center",
                    "success",
                    "application",
                    "Edit Client Loan Application",
                    "Client loan has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on("click", ".edit-loan-application", function (e) {
        const opener = $(this).data();
        loadLoanApplicationForm()

        $("#loanApplicationTitle").text("Edit Loan Application");

        let collaterals = opener.collaterals;
        let collateralIds = new Array();

        if (opener.interestId) {
            $("#interestsRates").val(opener.interestId).trigger("change");
        }

        collaterals.forEach(function (collateral, index) {
            collateralIds.push(collateral.asset_id);
        });

        $("#corraterals").val(collateralIds);
        $('#corraterals').trigger('change');

        $.each(opener, function (key, value) {
            $(loanApplicationForm).find(`[id = '${key}']`).val(value);
        });

    });

    $(document).on("click", ".delete-loan-application", function (e) {
        const opener = $(this).data();

        if (opener.statusName !== "NEW") {
            notify(
                "center",
                "error",
                "Application already in process",
                "Loan application cannot be deleted as it is already being processed",
                true,
                4000)
        } else {
            const id = $(this).data().loanApplicationId;
            notification(
                loans.deleteApplication({
                    id: id,
                }).deleted,
                "center",
                "success",
                "application",
                "Delete Loan Application",
                "Loan application has been deleted successfully",
                true,
                3000
            );
        }
    });


});


function loadClientApplicationsView() {
    if (localStorage.getItem("clientDataSet") != null) {

        setCurrentDataSet();

        $.when(contentLoader.loadIndividualRecordView("views/clients/applications.html", "client_applications")).done(
            function () {
                setRecordText(currentDataset, "recordName", "Loan Applications");

                loans.fetchClientLoanApplications({
                    client_id: currentDataset.recordId,
                });

            }
        );
    }
}

function loadLoanApplicationForm() {
    $.when(contentLoader.loadIndividualRecordView("views/forms/loan_application.html", "loan_application_form")).done(
        function () {
            // Load loan products
            fetchInterests();
            loadClientCorraterals(currentDataset.recordId);
        }
    );
}



function notification(
    isDone,
    position,
    icon,
    recordType,
    title,
    text,
    showConfirmButton,
    timer
) {
    if (isDone)
        $.when(
            Swal.fire({
                position: position,
                icon: icon,
                title: title,
                text: text,
                showConfirmButton: showConfirmButton,
                timer: timer,
            })
        ).done(function () {
            switch (recordType) {
                case "asset":
                    loadAssetView();
                    break;
            }
        });
}

function fetchInterests() {
    let interests = interest.fetchInterests();
    let interestsArray = [];

    interests.forEach(function (interest, index) {
        interestsArray.push(
            '<option value ="',
            interest.id,
            '">',
            `${interest.name} | ${interest.rate}%`,
            "</option>"
        );
    });

    $("#interestsRates").html(interestsArray.join(""));
}

function setCurrentDataSet() {
    currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));
}

function loadClientCorraterals(client_id) {
    $.when(client.fetchClientAssets({ client_id: client_id })).done(function (assets) {
        populateCollaterals(assets);
    });
}


function populateCollaterals(collaterals) {

    let collateralArray = [];
    collaterals.forEach(function (collateral, index) {
        collateralArray.push(
            '<option value ="',
            collateral.id,
            '">',
            `${collateral.name} | Market Value: MK${collateral.market_value}`,
            "</option>"
        );
    });

    $("#corraterals").html("");
    $("#corraterals").html(collateralArray.join(""));
}

function loanApplicationParams() {
    let id = $("#id").val();
    let client_id = currentDataset.recordId
    let amount = $("#amount").val();
    let interestId = $("#interestsRates option:selected").val();
    let purpose = $("#purpose").val();
    let collaterals = $("#corraterals").val();
    let collateralsArray = new Array();

    collaterals.forEach(function (collateral, index) {
        collateralsArray.push(collateral);
    });

    let params = {
        loan_application_id: id,
        client_id: client_id,
        amount: amount,
        interest_id: interestId,
        purpose: purpose,
        collaterals: collateralsArray,
    };

    return params;
}
