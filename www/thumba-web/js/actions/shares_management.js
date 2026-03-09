import * as share_management from "../services/share_management.js";
import * as form from "../utils/forms.js";
import * as loadContent from "../actions/contentLoader.js";
import { loadIdentifierTypes } from "../services/users.js";

const capitalContributionModal = "#modal-capital-contribution";
let capitalContributionModalTitle = "#capitalContributionModalTitle";
const capitalContributionStatusModal = "#modal-capital-contibuton-status";
const shareClassModal = "#modal-share-class";

$(function () {

    $(document).on("show.bs.modal", shareClassModal, function (e) {
        const opener = e.relatedTarget;
        clearFields("#shareClassForm");

        if ($(opener).attr("data-action-type") === "edit") {

            $("#shareClassModalTitle").text("Edit Share Class");

            $.each(opener.dataset, function (key, value) {
                $(shareClassModal).find(`[id = '${key}']`).val(value);
            });
        } else {
            $("#shareClassModalTitle").text("Create Share Class");
        }
    });

    $(document).on("click", "#saveShareClassBtn", function (e) {
        if (form.validShareClassFormData()) {
            if ($("#shareClassModalTitle").text().trim() === "Create Share Class") {
                notification(
                    share_management.addShareClass(shareClassParams()).created,
                    "center",
                    "success",
                    "share_class",
                    "Add Share Class",
                    "Share Class has been added successfully",
                    true,
                    3000
                );
            } else if ($("#shareClassModalTitle").text().trim() === "Edit Share Class") {
                notification(
                    share_management.editShareClass(shareClassParams()).updated,
                    "center",
                    "success",
                    "share_class",
                    "Edit Share Class",
                    "Share Class has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on("click", "#btnShareholderBtn", function () {
        $.when(loadContent.loadIndividualRecordView("views/forms/shareholder.html", "shareholder_form")).done(
            function () {
                loadIdentifierTypes();

                $("#cardTitle").text("Add Shareholder");
            }
        );
    });

    $(document).on("click", ".edit-shareholder", function (e) {
        const data = $(this).data();

        $.when(loadContent.loadIndividualRecordView("views/forms/shareholder.html", "shareholder_form")).done(
            function () {
                loadIdentifierTypes();

                $("#cardTitle").text("Edit Shareholder");

                $.each(data, function (key, value) {
                    $("#shareholderForm").find(`[id = '${key}']`).val(value).change();
                });
            }
        );

    });

    $(document).on("click", "#saveShareholderBtn", function () {
        if (form.validShareholderFormData()) {
            if ($("#cardTitle").text().trim() === "Add Shareholder") {
                notification(
                    share_management.addShareholder(shareholderParams()).created,
                    "center",
                    "success",
                    "registration",
                    "Add Shareholder",
                    "Shareholder has been added successfully",
                    true,
                    3000
                );
            } else if ($("#cardTitle").text().trim() === "Edit Shareholder") {
                notification(
                    share_management.updateShareholder(shareholderParams()).updated,
                    "center",
                    "success",
                    "registration",
                    "Edit Shareholder",
                    "Shareholder has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on("show.bs.modal", capitalContributionModal, function (e) {
        const opener = e.relatedTarget;

        $(capitalContributionModal).find(`[id= 'shareholderId']`)
            .val($(opener).attr("data-shareholder-id"));

        if ($(opener).attr("data-action-type") === "edit") {

            $.each(opener.dataset, function (key, value) {
                $(capitalContributionModal).find(`[id = '${key}']`).val(value).change();
            });
        } else {
            $(capitalContributionModalTitle).text("Add Capital Contribution");
        }

        populateShareClasses(share_management.fetchShareClasses());
    });

    $(document).on("click", ".edit-capital-contribution", function () {
        const data = $(this).data();

        if (data.status === "pending") {
            $.when($(capitalContributionModal).modal("show")).done(function () {
                $(capitalContributionModalTitle).text("Edit Capital Contribution");

                $.each(data, function (key, value) {
                    $(capitalContributionModal).find(`[id = '${key}']`).val(value).change();
                });
            });
        } else if (data.status === "approved" || data.status == "rejected") {
            notification(
                true,
                "center",
                "warning",
                "capital_contribution_warning",
                "Sorry",
                "Cannot edit an already approved or rejected capital contribution",
                true,
                5000

            );
        }
    });

    $(document).on("click", "#saveCapitalContributionBtn", function () {
        if (form.validCapitalContributionFormData()) {
            if ($(capitalContributionModalTitle).text().trim() === "Add Capital Contribution") {
                notification(
                    share_management.addCapitalContribution(capitalContributionParams()).created,
                    "center",
                    "success",
                    "capital_contribution",
                    "Add Capital Contribution",
                    "Capital Contribution has been added successfully",
                    true,
                    3000
                );
            } else if ($(capitalContributionModalTitle).text().trim() === "Edit Capital Contribution") {
                notification(
                    share_management.editCapitalContribution(capitalContributionParams()).updated,
                    "center",
                    "success",
                    "capital_contribution",
                    "Edit Capital Contribution",
                    "Capital Contribution has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    // Place this in your main JS file or after DataTable initialization

    $(document).on('change', '.capital-status-selector', function () {
        const id = $(this).data('id');
        const newStatus = $(this).val();
        const $select = $(this);

        $.when($(capitalContributionStatusModal).modal("show")).done(function () {
            $("#confirmationMessage").text(`Are you sure you want to update
                                         capital contribution to ${newStatus}`);

            $(capitalContributionStatusModal).find(`[id= 'contributionId']`).val(id);
            $(capitalContributionStatusModal).find(`[id= 'contributionStatus']`).val(newStatus);
        });

    });

    $(document).on('click', '#updateCapitalContributionStatusBtn', function () {
        const id = $(capitalContributionStatusModal).find(`[id= 'contributionId']`).val();
        const newStatus = $("#contributionStatus").val();

        notification(
            share_management.updateCapitalContributionStatus({ id: id, status: newStatus }).updated,
            "center",
            "success",
            "capital_contribution_status",
            "Capital Contribution Status Update",
            `Capital Contribution has been ${newStatus} successfully`,
            true,
            3000
        );
    });
})

// Shareclass Params
function shareClassParams() {
    const shareClassId = $("#shareClassId").val();
    const name = $("#name").val();
    const code = $("#code").val();
    const pricePerShare = $("#pricePerShare").val();
    const description = $("#description").val();

    const params = {
        share_class_id: shareClassId,
        name: name,
        code: code,
        price_per_share: pricePerShare,
        description: description
    }

    return params;
}

// Shareholder params
function shareholderParams() {
    let shareholder_id = $("#shareholderId").val();
    let identifier = $("#identifier").val();
    let identifierTypeId = $("#identifierType").val();
    let firstname = $("#firstname").val();
    let lastname = $("#lastname").val();
    const email_address = $("#emailAddress").val();
    const phone_number = $("#phoneNumber").val();
    let gender = $("#gender option:selected").val();
    let date_of_birth = $("#dateOfBirth").val();


    let params = {
        shareholder_id: shareholder_id,
        identifier: identifier,
        identifier_type_id: identifierTypeId,
        firstname: firstname,
        lastname: lastname,
        email_address: email_address,
        phone_number: phone_number,
        gender: gender,
        date_of_birth: date_of_birth
    };

    return params;
}

// Capital contribution params
function capitalContributionParams() {
    const contribution_id = $("#capitalContributionId").val();
    const shareholder_id = $("#shareholderId").val()
    const share_class_id = $("#shareClassSelector").val();
    const amount = $("#amount").val();
    const contributed_date = $("#contributedDate").val();

    const params = {
        id: contribution_id,
        shareholder_id: shareholder_id,
        share_class_id: share_class_id,
        amount: amount,
        contributed_date: contributed_date
    }

    return params;
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
                case "share_class":
                    $(shareClassModal).modal("hide");
                    share_management.fetchShareClasses();
                    break;
                case "registration":
                    $.when(loadContent.loadRecord("views/share_management/shareholders.html", "shareholders")).done(function () {
                        share_management.fetchShareholders();
                    });
                    break;
                case "capital_contribution":
                    $.when(loadContent.loadRecord("views/share_management/capital_contributions.html", "capital_contribution")).done(function () {
                        share_management.fetchCapitalContributions();
                        $(capitalContributionModal).modal("hide");
                    });
                    break;
                case "capital_contribution_status":
                    share_management.fetchCapitalContributions();
                    $(capitalContributionStatusModal).modal("hide");
                    break;

            }
        });
}


function populateShareClasses(shareClasses) {

    let shareClassArray = [];

    shareClasses.forEach(function (share_class, index) {
        shareClassArray.push(
            '<option value ="',
            share_class.id,
            '">',
            `${share_class.code} | ${share_class.name}`,
            "</option>"
        );
    });

    $("#shareClassSelector").html(shareClassArray.join(""));
}

function clearFields(formId) {
    $(":input", formId)
        .not(":button, :submit, :reset")
        .val("")
        .prop("checked", false)
        .prop("selected", false);
}