import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { setRecordText } from "../utils/utils.js";

const dependantForm = "#dependantForm";
let currentDataset = null;
localStorage;


$(function () {

    $(document).on("click", "#btnDependants", function (e) {
        loadDependantsView();
    });

    $(document).on("click", "#dependantFormBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/dependant.html", "dependant_form")).done(
            function () {
                $("#formTitle").text("Add Client Dependant");
            }
        );
    });

    $(document).on("click", "#saveDependantBtn", function (e) {
        if (form.validDependantFormData()) {
            if ($("#formTitle").text().trim() === "Add Client Dependant") {
                notification(
                    client.addDependant(clientDependantParams()).created,
                    "center",
                    "success",
                    "dependant",
                    "Add Client Dependant",
                    "Client Depandant has been updated successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Edit Client Dependant") {
                notification(
                    client.updateDependant(clientDependantParams()).updated,
                    "center",
                    "success",
                    "dependant",
                    "Edit Client Dependant",
                    "Client Depandant has been updated successfully",
                    true,
                    3000
                );
            }
        }

    });

    $(document).on("click", "#delClientDependantBtn", function () {
        let id = $("#delDependantId").val();
        notification(
            client.delDependant(id).deleted,
            "center",
            "success",
            "delete-dependant",
            "Delete Client Dependant",
            "Client dependant has been deleted successfully",
            true,
            3000
        );
    });

    // CLIENT DEPENDANT
    $(document).on("click", ".edit-dependant", function (e) {
        const opener = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/dependant.html", "dependant_form")).done(
            function () {
                $("#formTitle").text("Edit Client Dependant");

                $.each(opener, function (key, value) {
                    $(dependantForm).find(`[id = '${key}']`).val(value);
                });
            }
        );
    });

    $(document).on("sh", "#modal-del-client-dependant", function (e) {
        let opener = e.relatedTarget;
        $.each(opener.dataset, function (key, value) {
            $("#modal-del-client-dependant").find(`[id = '${key}']`).val(value);
        });
    });
});

function clientDependantParams() {
    let id = $("#clientDependantId").val();
    let dependancy = $("#dependancy").val();
    let amount = $("#amount").val();
    let relationship = $("#relationship option:selected").val();
    let frequency = $("#frequency option:selected").val();

    let params = {
        id: id,
        client_id: currentDataset.recordId,
        dependancy: dependancy,
        amount: amount,
        relationship: relationship,
        frequency: frequency
    };

    return params;
}

function loadDependantsView() {
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));
        
        $.when(contentLoader.loadIndividualRecordView("views/clients/dependants.html", "dependants")).done(
            function () {
               
                setRecordText(currentDataset, "recordName", "Dependants");

                client.fetchClientDependants({
                    client_id: currentDataset.recordId,
                });
            }
        );
    }
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
                case "dependant":
                    loadDependantsView();
                    break;
                case "delete-dependant":
                    $.when(
                        client.fetchClientDependants({
                            client_id: currentDataset.recordId,
                        })
                    ).done(function () {
                        $("#modal-del-client-dependant").modal("hide");
                    });
                    break;
            }
        });
}