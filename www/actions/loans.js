import * as loans from "../services/loans.js";
import { notify } from "../services/utils.js";
import { loadContent } from "./contentLoader.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import { setRecordText } from "../utils/utils.js";

const applicationModal = "#modal-loan-application";
const guarantorModal = "#modal-guarantors";
const approveModal = "#modal-approve";
const collateralSeizureModal = "#modal-seized-collateral";
const sellCollateralModal = "#modal-sell-collateral";
const dumpApplicationModal = "#modal-dump-application";

let loanApplicationId;
let selectedLoanPaymentId = null;
let paymentDate;
let loan_id;
localStorage;
let currentLoanPaymentDataset;
let currentDataset = null;

$(function () {

  if (localStorage.getItem("loanPaymentDataset") != null && typeof localStorage != undefined) {
    currentLoanPaymentDataset = JSON.parse(localStorage.getItem("loanPaymentDataset"));
    loan_id = currentLoanPaymentDataset.loanId;
    $("#paymentLoanId").val(loan_id);
    $("#paymentTitle").text(`Loan Payments for ${currentLoanPaymentDataset.applicant}`);
  }


  $(document).on("click", "#btnLoans", function (e) {
    loadLoansView();
  });

  $(document).on("click", "#statusNew", function (e) {
    $.when(loadApplicationStatusView("views/loans/new.html", "new_applications")).done(function () {
      loans.fetchLoanApplications({ status_name: "NEW" });
    });
  });

  $(document).on("click", "#statusWaiting", function (e) {
    $.when(loadApplicationStatusView("views/loans/waiting.html", "waiting_applications")).done(
      function () {
        loans.fetchLoanApplications({ status_name: "WAITING" });
      });
  });

  $(document).on("click", "#statusCompleted", function (e) {
    $.when(loadApplicationStatusView("views/loans/done.html", "completed_applications")).done(
      function () {
        loans.fetchLoanApplications({ status_name: "DONE" });
      });
  });

  $(document).on("click", "#statusDumped", function (e) {
    $.when(loadApplicationStatusView("views/loans/dumped.html", "dumped_applications")).done(
      function () {
        loans.fetchLoanApplications({ status_name: "DUMPED" });
      });
  });


  $(document).on("click", "#saveGuarantorBtn", function (e) {
    notification(
      loans.addGuarantor(loadLoanGuarantorParams()).created,
      "center",
      "success",
      "guarantor",
      "Add Loan Guarantor",
      "Loan guarantor has been added successfully",
      true,
      3000
    );
  });

  $(document).on("show.bs.modal", guarantorModal, function (e) {

    let opener = e.relatedTarget;
    $("#guarantorModalTitle").text(
      `${$(opener).attr("data-applicant")} ${$(opener).attr(
        "data-lastname"
      )} Guarantors`
    );

    loanApplicationId = $(opener).attr("data-loan-application-id");
  });

  $(document).on("hide.bs.modal", guarantorModal, function (e) {
    let someTabTriggerEl = document.querySelector(
      "#custom-content-above-home-tab"
    );
    let tab = new bootstrap.Tab(someTabTriggerEl);
    tab.show();
  });

  $(document).on("shown.bs.tab", "#custom-content-above-tab", function (e) {

    if (e.target.id === "custom-content-above-profile-tab") {
      loans.fetchLoanGuarantors({ loan_application_id: loanApplicationId });
    } else if (e.target.id === "custom-content-above-home-tab") {
    }
  });

  $(document).on("show.bs.modal", approveModal, function (e) {
    let opener = e.relatedTarget;
    loanApplicationId = $(opener).attr("data-loan-application-id");
    let applicant = $(opener).attr("data-applicant");
    let clientType = $(opener).attr("data-client-type");
    let gender = $(opener).attr("data-gender");
    let amount = $(opener).attr("data-amount");
    let rate = $(opener).attr("data-rate");
    let purpose = $(opener).attr("data-purpose");
    paymentDate = addWeeks(new Date(), parseInt($(opener).attr("data-period")));
    let collaterals = JSON.parse($(opener).attr("data-collaterals"));
    let riskPercentage = $(opener).attr("data-risk-percentage");
    let gradeName = $(opener).attr("data-grade-name");
    let gradeRange = $(opener).attr("data-grade-range");
    let scores = $(opener).attr("data-scores");
    let interest = (parseFloat(rate) * parseFloat(amount)) / 100
    let repaymentAmount = interest + parseFloat(amount)

    $("#approveLoanAppId").val(loanApplicationId);
    $("#approve-applicant").text(`${applicant}`);
    $("#approve-client-type").text(`${clientType}`);
    $("#approve-amount").text(amount);
    $("#approve-rate").text(rate);
    $("#approve-interest").text(interest);
    $("#approve-repayment-amount").text(repaymentAmount);
    $("#approve-payment-date").text(paymentDate);
    $("#approve-purpose").text(purpose);
    $("#grade-name").text(gradeName);
    $("#score-grade-range").text(gradeRange);
    $("#score-percentage").text(riskPercentage);

    populateCollateralsRow(collaterals);
  });

  $(document).on("click", "#approveLoanBtn", function (e) {
    notification(
      loans.addLoan({
        loan_application_id: loanApplicationId,
        due_date: paymentDate
      }).created,
      "center",
      "success",
      "approve",
      "Appprove Loan Application",
      "Loan application has been approved successfully",
      true,
      3000
    );
  });


  $(document).on("click", ".loan-agreement", function (e) {

    let agreement_params = {
      loan_application_id: $(this).data().loanApplicationId,
      applicant: $(this).data().applicant,
      purpose: $(this).data().purpose,
      amount: $(this).data().amount,
      rate: $(this).data().rate,
      compounding_frequency: $(this).data().compoundingFrequency,
      rate_type: $(this).data().rateType,
      loan_term_type: $(this).data().loanTermType,
      monthly_payment: $(this).data().monthlyPayment,
      repayment_terms: $(this).data().repaymentTerms,
      current_address: $(this).data().currentAddress,
      accum_amount: $(this).data().accumAmount,
      accum_days: $(this).data().accumDays,
      grace_period: $(this).data().gracePeriod
    }

    $.when(loans.getLoanAgreement(agreement_params)).done(function (htmlContent) {
      if (htmlContent) {
        let win = window.open("", "", "");
        win.document.write(htmlContent.html)
        win.document.close();
        win.print();
      } else {
        console.error("HTML content is null or empty.");
      }
    });
  });

  $(document).on("show.bs.modal", dumpApplicationModal, function (e) {
    let opener = e.relatedTarget;
    $("#dumpLoanApplicationId").val($(opener).attr("data-loan-application-id"));
  });

  $(document).on("click", "#dumpLoanApplicationBtn", function (e) {
    let loanApplicationId = $("#dumpLoanApplicationId").val();
    let dumpingReason = $("#dumpingReason").val();

    if (form.validateDumpLoanForm()) {
      notification(
        loans.dumpApplication({
          loan_application_id: loanApplicationId,
          reason: dumpingReason
        }).dumped,
        "center",
        "success",
        "dumped",
        "Dumped Loan Application",
        "Loan application has been dumped successfully",
        true,
        3000
      )
    }
  })

  $(document).on("click", ".loan-payments", function (e) {
    currentLoanPaymentDataset = this.dataset;
    localStorage.setItem("loanPaymentDataset",
      JSON.stringify(currentLoanPaymentDataset));

    loan_id = $(this).data().loanId;
    let headerText = `Loan Payments for ${$(this).data().applicant}`;

    $.when(loadRecord("views/loans/loan_payments.html", "loan_payments")).done(
      function () {
        $("#paymentLoanId").val(loan_id);
        $("#paymentTitle").text(headerText);

        $.when(loans.fetchLoanPayments({ loan_id: loan_id })).done(function () { });
      });


  });

  $(document).on("click", "#backToLoansBtn", function (e) {
    $.when(loadRecord("views/loans/loans.html", "loans")).done(
      function () {
        loans.fetchLoans();
      }
    );
  });

  $(document).on("click", "#saveLoanPaymentBtn", function (e) {

    if (form.validateLoanPaymentForm()) {
      let amount = $("#amount").val();
      let paymentDate = $("#paymentDate").val();
      let loanId = $("#paymentLoanId").val();

      if (selectedLoanPaymentId != null) {
        notification(
          loans.updateLoanPayment({
            loan_id: loanId,
            loan_payment_id: selectedLoanPaymentId,
            paid_amount: amount,
            payment_date: paymentDate
          }).updated,
          "center",
          "success",
          "loan-payment",
          "Edit Loan Payment",
          "Loan payment has updated been updated successfully",
          true,
          3000
        );
      } else {
        notification(
          loans.addLoanPayment({
            loan_id: loanId,
            paid_amount: amount,
            payment_date: paymentDate
          }).created,
          "center",
          "success",
          "loan-payment",
          "Add Loan Payment",
          "Loan payment has been done successfully",
          true,
          3000
        );
      }
    }

  });

  $(document).on("click", ".edit-loan-payment", function (e) {
    let table = $("#loanPaymentsTable").DataTable();
    let data = table.row($(this).parents('tr')).data();
    selectedLoanPaymentId = data.id

    $("#amount").val(data.paid_amount);
    $("#paymentDate").val(data.payment_date);

  });

  $(document).on("click", ".delete-loan-payment", function (e) {
    let table = $("#loanPaymentsTable").DataTable();
    let data = table.row($(this).parents('tr')).data();
    selectedLoanPaymentId = data.id

    notification(
      loans.deletePayment({
        loan_payment_id: selectedLoanPaymentId,
      }).deleted,
      "center",
      "success",
      "loan-payment",
      "Delete Loan Payment",
      "Loan payment has been deleted successfully",
      true,
      3000
    );
  });

  $(document).on("show.bs.modal", collateralSeizureModal, function (e) {
    let opener = e.relatedTarget;
    let collaterals = JSON.parse($(opener).attr("data-collaterals"));

    populateCollaterals(collaterals);

  });

  $(document).on("click", "#seizeCollateralBtn", function (e) {
    if (form.validateSeizeCollateralForm()) {
      let collaterals = $("#corraterals").val();
      let collateralsArray = new Array();

      collaterals.forEach(function (collateral, index) {
        collateralsArray.push(collateral);
      });

      notification(
        loans.addCollateralSeizure({
          collateral_ids: collateralsArray,
        }).created,
        "center",
        "success",
        "collateral-seizure",
        "Add Loan Collateral Seizure",
        "Collateral Seizure has been added successfully",
        true,
        3000
      );
    }

  });

  $(document).on("show.bs.modal", sellCollateralModal, function (e) {
    let opener = e.relatedTarget;
    $.each(opener.dataset, function (key, value) {
      $(sellCollateralModal).find(`[id = '${key}']`).text(value);
      $(sellCollateralModal).find(`[id = '${key}']`).val(value);
    });
  });

  $(document).on("click", ".return-collateral", function (e) {
    let seizure_id = $(this).data().id;

    notification(
      loans.removeCollateralSeizure({
        seizure_id: seizure_id,
      }).unseized,
      "center",
      "success",
      "remove-seizure",
      "Remove Collateral Seizure",
      "Collateral Seizure has been removed successfully",
      true,
      3000
    );
  });

  $(document).on("click", "#sellCollateralBtn", function (e) {

    let soldPrice = $("#sellingPrice").val();
    let soldDate = $("#soldDate").val();

    if ($("#collateralSaleModalTitle").text() === "Add Collateral Sale") {
      let seizureId = $("#seizureId").val();

      notification(
        loans.sellCollateral({
          collateral_seizure_id: seizureId,
          sold_price: soldPrice,
          sold_date: soldDate
        }).created,
        "center",
        "success",
        "sell-collateral",
        "Sell Collateral",
        "Collateral sale has been recorded successfully",
        true,
        3000
      );
    } else {
      let collateralSaleId = $("#collateralSaleId").val();

      notification(
        loans.editCollateralSale({
          collateral_sale_id: collateralSaleId,
          sold_price: soldPrice,
          sold_date: soldDate
        }).updated,
        "center",
        "success",
        "collateral-sale",
        "Edit Collateral Sale",
        "Collateral sale has been updated successfully",
        true,
        3000
      );
    }

  });


  $(document).on("click", ".delete-collateral-sale", function (e) {
    let collateralSaleId = $(this).data().id;

    notification(
      loans.deleteCollateralSale({
        collateral_sale_id: collateralSaleId
      }).deleted,
      "center",
      "success",
      "collateral-sale",
      "Delete Collateral Sale",
      "Collateral sale has been deleted successfully",
      true,
      3000
    );
  });

});



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

function loadLoanGuarantorParams() {
  let national_id = $("#nationalId").val();
  let firstname = $("#firstname").val();
  let lastname = $("#lastname").val();
  let gender = $("#gender option:selected").val();
  let date_of_birth = $("#dateOfBirth").val();
  let home_district = $("#homeDistrict option:selected").val();
  let home_ta = $("#homeTa").val();
  let home_village = $("#homeVillage").val();
  let current_district = $("#currentDistrict option:selected").val();
  let current_ta = $("#currentTa").val();
  let current_village = $("#currentVillage").val();
  let nearest_landmark = $("#nearest_landmark option:selected").val();
  let relationship = $("#relationship option:selected").val();

  let params = {
    loan_application_id: loanApplicationId,
    national_id: national_id,
    firstname: firstname,
    lastname: lastname,
    gender: gender,
    date_of_birth: date_of_birth,
    home_district: home_district,
    home_ta: home_ta,
    home_village: home_village,
    current_district: current_district,
    current_ta: current_ta,
    current_village: current_village,
    nearest_landmark: nearest_landmark,
    relationship: relationship,
  };

  return params;
}

function loadApplicationStatusView(path, state) {
  $.when(loadContent("mainContent", state, path)).done(function () { });
}

function loadRecord(path, state) {
  $.when(loadContent("mainContent", state, path)).done(function () { });
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
        case "application":
          $.when(loans.fetchLoanApplications({ status_name: "NEW" })).done(function () {
            $(applicationModal).modal("hide");
          });
          break;
        case "guarantor":
          $.when(loans.fetchLoanGuarantors()).done(function () { });
          break;
        case "approve":
          $.when(loans.fetchLoanApplications({ status_name: "WAITING" })).done(function () {
            $(approveModal).modal("hide");
          });
          break;
        case "dumped":
          $.when(loans.fetchLoanApplications({ status_name: "DUMPED" })).done(function () {
            $(dumpApplicationModal).modal("hide");
          });
          break;
        case "loan-payment":
          $.when(loans.fetchLoanPayments({ loan_id: loan_id })).done(function () {
            selectedLoanPaymentId = null;
            $("#amount").val("");
            $("#paymentDate").val("");
          });
          break;
        case "collateral-seizure":
          $(collateralSeizureModal).modal("hide");
          break;
        case "remove-seizure":
          loans.fetchCollateralSeizures();
          break;
        case "sell-collateral":
          $.when(loans.fetchCollateralSeizures()).done(function () {
            $(sellCollateralModal).modal("hide");
          });
          break;
        case "collateral-sale":
          $.when(loans.fetchCollateralSales()).done(function () {
            $(sellCollateralModal).modal("hide");
          });
          break;

      }
    });
}

function clearFields(formId) {
  $(":input", formId)
    .not(":button, :submit, :reset")
    .val("")
    .prop("checked", false)
    .prop("selected", false)
    .text("");
}

function populateCollateralsRow(collaterals) {
  $("#approve-collaterals").html("");
  collaterals.forEach(function (collateral, index) {
    $("#approve-collaterals").append(`
    <div class="col-sm-4 border-right">                   
      <div class="description-block">
        <h5  class="description-header">${collateral.name}</h5>
        <span class="description-text">(${index + 1}) COLLATERAL NAME</span>
      </div>
      <!-- /.description-block -->
    </div>

    <div class="col-sm-4 border-right">                   
      <div class="description-block">
        <h5  class="description-header">${collateral.purchase_price}</h5>
        <span class="description-text">(${index + 1}) PURCHASE PRICE</span>
      </div>
      <!-- /.description-block -->
    </div>

    <div class="col-sm-4 border-right">                   
    <div class="description-block">
      <h5  class="description-header">${collateral.market_value}</h5>
      <span class="description-text">(${index + 1}) MARKET VALUE</span>
    </div>
    <!-- /.description-block -->
    </div>

   `);

  });
}

function addWeeks(date, weeks) {
  date.setDate(date.getDate() + 7 * weeks);
  let options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function loadLoansView() {
  if (localStorage.getItem("clientDataSet") != null) {
    currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

    $.when(contentLoader.loadIndividualRecordView("views/clients/loans.html", "client_loans")).done(
      function () {

        setRecordText(currentDataset, "recordName", "Loans");

        loans.fetchClientLoans({
          client_id: currentDataset.recordId,
        });
      }
    );
  }
}