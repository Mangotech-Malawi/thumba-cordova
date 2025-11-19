import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { setRecordText } from "../utils/utils.js";

const businessForm = "#businessForm";
let currentDataset = null;
localStorage;

$(function () {

    $(document).on("click", "#btnBusinesses", function (e) {
        loadBusinessesView();
    });

    $(document).on("click", "#businessFormBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/business.html", "business_form")).done(
            function () {

            }
        );
    });

    $(document).on("click", "#saveBusinessBtn", function (e) {
        if (form.validBusinessFormData()) {
            if ($("#formTitle").text().trim() === "Add Client Business") {
                notification(
                    client.addBusiness(clientBusinessParams()).created,
                    "center",
                    "success",
                    "business",
                    "Add Client Business",
                    "Client Business has been added successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Edit Client Business") {
                notification(
                    client.updateBusiness(clientBusinessParams()).updated,
                    "center",
                    "success",
                    "business",
                    "Edit Client Business",
                    "Client Business has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });

    $(document).on("show.bs.modal", "#modal-del-client-business", function (e) {
        let opener = e.relatedTarget;
        $.each(opener.dataset, function (key, value) {
            $("#modal-del-client-business").find(`[id = '${key}']`).val(value);
        });
    });

    // CLIENT BUSINESS
    $(document).on("click", ".edit-business", function (e) {
        //clearFields("#clientBusiness");
        const opener = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/business.html", "business_form")).done(
            function () {
                $("#formTitle").text("Edit Client Business");

                $.each(opener, function (key, value) {
                    if (key !== "busRegistered")
                        $(businessFom).find(`[id = '${key}']`).val(value);
                    else $(businessForm).find(`[id = '${key}']`).attr("checked", value);
                });
            });
    });

    $(document).on("click", "#delClientBusBtn", function () {
        let id = $("#delClientBusId").val();
        notification(
            client.deleteBusiness({ id: id }).deleted,
            "center",
            "success",
            "business",
            "Delete Client Business",
            "Client business has been deleted successfully",
            true,
            3000
        );

        $("#modal-del-client-business").modal("hide");
    });


});

function clientBusinessParams() {
    let id = $("#clientBusId").val();
    let name = $("#busName").val();
    let industry = $("#busIndustry").val();
    let startDate = $("#busStartDate").val();
    let location = $("#busLocation").val();
    let shortDescription = $("#busShortDesc").val();
    let description = $("#busDescription").val();
    let registered = $("#busRegistered").is(":checked");

    let params = {
        id: id,
        client_id: currentDataset.recordId,
        name: name,
        industry: industry,
        start_date: startDate,
        location: location,
        short_description: shortDescription,
        description: description,
        registered: registered,
    };

    return params;
}

function loadBusinessesView(){
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/businesses.html", "businesses")).done(
            function () {
                
                setRecordText(currentDataset, "recordName", "Businesses");
    
                client.fetchClientBusinesses({
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
                case "business":
                    loadBusinessesView();
                    break;
            }
        });
}

