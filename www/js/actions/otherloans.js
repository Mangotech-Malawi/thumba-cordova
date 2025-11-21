import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { setRecordText } from "../utils/utils.js";

const otherloanForm = "#otherloanForm";
let currentDataset = null;
localStorage;

$(function () {


    $(document).on("click", "#btnOtherLoans", function (e) {
       otherloansView();
    });

    $(document).on("click", "#otherloanFormBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/otherloan.html",
             "otherloan_form")).done(
            function () {

            }
        );
    });

    //Client Other Loans
    $(document).on("click", "#saveOtherLoanBtn", function (e) {
        if (form.validOtherLoansFormData()) {
            if ($("#formTitle").text().trim() === "Add Client Other Loan") {
                notification(
                    client.addOtherLoan(clientOtherLoanParams()).created,
                    "center",
                    "success",
                    "otherloan",
                    "Add Client Other Loan",
                    "Client other loan has been added successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Edit Client Other Loan") {
                notification(
                    client.updateOtherLoan(clientOtherLoanParams()).updated,
                    "center",
                    "success",
                    "otherloan",
                    "Edit Client Other Loan",
                    "Client other loan has been updated successfully",
                    true,
                    3000
                );
            }
        }

    });

    $(document).on("click", ".edit-otherloan", function (e) {
        //clearFields();
        const opener = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/otherloan.html", "otherloan_form")).done(
            function () {

                $("#formTitle").text("Edit Client Other Loan");

                $.each(opener, function (key, value) {
                    $(otherloanForm).find(`[id = '${key}']`).val(value);
    
                    if (key !== "busRegistered")
                        $(otherloanForm).find(`[id = '${key}']`).val(value);
                    else $(otherloanForm).find(`[id = '${key}']`).attr("checked", value);
                });
            });
    });

    $(document).on("show.bs.modal", "#modal-del-client-otherloan", function (e) {
        let opener = e.relatedTarget;
        $.each(opener.dataset, function (key, value) {
            $("#modal-del-client-otherloan").find(`[id = '${key}']`).val(value);
        });
    });

    $(document).on("click", "#delClientOtherLoanBtn", function (e) {
        let id = $("#delOtherLoanId").val();
        $.when(
            notification(
                client.delOtherLoan(id).deleted,
                "center",
                "success",
                "otherloan",
                "Delete Client Other Loan",
                "Client other loan has been deleted successfully",
                true,
                3000
            )
        ).done(function () {
            $("#modal-del-client-otherloan").modal("hide");
        });
    });

});

function clientOtherLoanParams() {
    let id = $("#clientOtherLoanId").val();
    let institution = $("#institution").val();
    let phoneNumber = $("#phoneNumber").val();
    let amount = $("#amountLoaned").val();
    let period = $("#loanPeriod").val();
    let periodType = $("#periodType option:selected").val();
    let rate = $("#loanRate").val();
    let loanedDate = $("#loanedDate").val();
    let amountPaid = $("#amountPaid").val();
    let purpose = $("#otherLoanPurpose").val()
    let closed = $("#loanClosed").val();
    let stopped = $("#stopped").val();
    let reasonForStopping = $("#reasonForStopping").val();

    let params = {
        id: id,
        client_id: currentDataset.recordId,
        institution: institution,
        phone_number: phoneNumber,
        amount: amount,
        period: period,
        period_type: periodType,
        rate: rate,
        loaned_date: loanedDate,
        amount_paid: amountPaid,
        purpose: purpose,
        closed: closed,
        stopped: stopped,
        reason_for_stopping: reasonForStopping,
    };

    return params;
}

function otherloansView(){
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/otherLoans.html", "other_loans")).done(
            function () {
               
                setRecordText(currentDataset, "recordName", "Other Loans");

                client.fetchClientOtherLoans({
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
          case "otherloan":
            otherloansView()
            break;
        }
      });
}

