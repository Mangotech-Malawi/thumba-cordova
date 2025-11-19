import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
const jobForm = "#clientJobForm";
let currentDataset = null
localStorage;

$(function () {

    $(document).on("click", "#btnJobs", function (e) {
        loadJobView();
        $("#formTitle").text("Add Client Job");
    });

    $(document).on("click", "#jobFormBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/job.html", "job_form")).done(
            function () {

            }
        );
    });

    $(document).on("click", "#saveJobBtn", function (e) {
        if (form.validClientJobFormData()) {
            if ($("#formTitle").text().trim() === "Add Client Job") {
                notification(
                    client.addJob(clientJobParams()).created,
                    "center",
                    "success",
                    "job",
                    "Add Client Job",
                    "Client Job has been updated successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Edit Client Job") {
                notification(
                    client.updateJob(clientJobParams()).updated,
                    "center",
                    "success",
                    "job",
                    "Edit Client Job",
                    "Client Job has been updated successfully",
                    true,
                    3000
                );
            }
        }
    });


    //CLIENT JOB MODAL
    $(document).on("click", ".edit-client-job", function (e) {
        const opener = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/job.html", "job_form")).done(
            function () {

                $("#formTitle").text("Edit Client Job");

                $.each(opener, function (key, value) {
                    $(jobForm).find(`[id = '${key}']`).val(value);
                });
            }
        );
    });



    $(document).on("show.bs.modal", "#modal-del-client-job", function (e) {
        let opener = e.relatedTarget;
        $.each(opener.dataset, function (key, value) {
            $("#modal-del-client-job").find(`[id = '${key}']`).val(value);
        });
    });

    $(document).on("click", "#delClientJobBtn", function () {
        let id = $("#delClientJobId").val();

        notification(
            client.delJob(id).deleted,
            "center",
            "danger",
            "delete-job",
            "Delete Client Job",
            "Client Job has been deleted successfully",
            true,
            3000
        );
    });
});


///
function clientJobParams() {
    let id = $("#clientJobId").val();
    let title = $("#title").val();
    let department = $("#department").val();
    let employerType = $("#employerType").val();
    let employerName = $("#employerName").val();
    let employementType = $("#employmentType").val();
    let dateStarted = $("#dateStarted").val();
    let contractDue = $("#contractDue").val();
    let netSalary = $("#netSalary").val();
    let grossSalary = $("#grossSalary").val();
    let payDate = $("#payDate").val();
    let postalAddress = $("#postalAddress").val();
    let email = $("#emailAddress").val(); //Phone Number
    let phoneNumber = $("#phoneNumber").val();
    let district = $("#district").val();

    let params = {
        id: id,
        client_id: currentDataset.recordId,
        title: title,
        department: department,
        employer_type: employerType,
        employer_name: employerName,
        employment_type: employementType,
        date_started: dateStarted,
        contract_due: contractDue,
        net_salary: netSalary,
        gross_salary: grossSalary,
        pay_date: payDate,
        postal_address: postalAddress,
        email_address: email,
        phone_number: phoneNumber,
        district: district,
    };

    return params;
}

function loadJobView() {
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/jobs.html", "jobs")).done(
            function () {
                $("#recordName").text(
                    `${currentDataset.recordFirstname} ${currentDataset.recordLastname} Jobs`
                );

                client.fetchClientJobs({
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
                case "job":
                    loadJobView();
                    break;
                case "delete-job":
                    $.when(
                        client.fetchClientJobs({
                            client_id: currentDataset.recordId,
                        })
                    ).done(function () {
                        $("#modal-del-client-job").modal("hide");
                    });
                    break;
            }
        });
}



