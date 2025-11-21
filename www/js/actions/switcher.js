import * as users from "../services/users.js";
import { fetchIncomeData } from "../services/income.js";
import * as client from "../services/clients.js";
import { fetchInterests } from "../services/interests.js";
import * as loans from "../services/loans.js";
import * as investment from "../services/investments.js";
import * as settings from "../services/settings.js";
import * as expense from "../services/expenses.js";
import { loadContent } from "../actions/contentLoader.js";
import { content_view } from "../app-views/content.js";
import { links } from "../app-views/links.js";
import * as dashboard from "../services/dashboard.js";
import * as subscription from "../services/subscription.js";
import * as account from "../services/account.js";
import * as share_management from "../services/share_management.js";
import { populateAccountDetails } from "../actions/account.js"

let privileges = sessionStorage.getItem("privileges");

const mainContent = "mainContent";
const modalContent = "modalContent";

let state = localStorage.getItem("state");

if (state == null || state == '' || typeof state == undefined) {
  selectContent("dashboard");
} else {
  selectContent(localStorage.getItem("state"));
}



$(document).ready(function () {
  if (sessionStorage.getItem("role") != null) {
    loadLinks(privileges);
  }

  $("#dashboard").on("click", function (e) {
    selectContent("dashboard");
  });

  $("#reports").on("click", function (e) {
    selectContent("reports");
  });

  $("#individualClient").on("click", function (e) {
    selectContent("individual");
  });

  $("#orgClient").on("click", function (e) {
    selectContent("organization");
  });

  $("#groupClient").on("click", function (e) {
    selectContent("group");
  });

  //The folloing are user management links
  $("#loans").on("click", function (e) {
    selectContent("loans");
  });

  $("#users").on("click", function (e) {
    selectContent("users");
  });

  $("#users").on("click", function (e) {
    selectContent("users");
  });

  $("#roles").on("click", function (e) {
    selectContent("user_roles");
  });

  $("#userInvitations").on("click", function (e) {
    selectContent("user_invitations");
  });

  $("#applications").on("click", function (e) {
    selectContent("applications");
  });

  $("#interests").on("click", function (e) {
    selectContent("interests");
  });

  $("#investors").on("click", function (e) {
    selectContent("investors");
  });

  $("#income").on("click", function (e) {
    selectContent("income");
  });

  $("#applications").on("click", function (e) {
    selectContent("applications");
  });

  $("#loans").on("click", function (e) {
    selectContent("loans");
  });

  $("#grades").on("click", function (e) {
    selectContent("grades");
  });

  $("#scores").on("click", function (e) {
    selectContent("scores");
  });

  $("#score-names").on("click", function (e) {
    selectContent("score_names");
  });

  $("#dti-ratios").on("click", function (e) {
    selectContent("dti_ratios");
  });

  $("#seized-collaterals").on("click", function (e) {
    selectContent("seized_collaterals");
  });

  $("#email-subscribers").on("click", function (e) {
    selectContent("email_subscriptions");
  });

  $("#collateral-sales").on("click", function (e) {
    selectContent("collateral_sales");
  })

  $(document).on("click", "#applicationBackBtn", function (e) {
    selectContent("applications");
  });

  $(document).on("click", "#investment-packages", function (e) {
    selectContent("investment_packages");
  });

  $(document).on("click", "#investments", function (e) {
    selectContent("investments");
  });

  $(document).on("click", "#returnOfInvestiments", function (e) {
    selectContent("return_on_investments");
  });

  $(document).on("click", "#my-investments", function (e) {
    selectContent("my_investments");
  });

  $(document).on("click", "#my-rois", function (e) {
    selectContent("my_return_on_investments");
  });

  $(document).on("click", "#view-my-returns", function (e) {
    selectContent("my_return_on_investments");
  });

  $(document).on("click", "#view-my-investments", function (e) {
    selectContent("my_investments");
  });

  $(document).on("click", "#expenses", function (e) {
    selectContent("expenses");
  });

  $(document).on("click", "loan-report", function (e) {
    selectContent("loan-report");
  });

  $(document).on("click", "#accounts", function (e) {
    selectContent("accounts");
  });

  $(document).on("click", "#accounts-dashboard", function (e) {
    selectContent("super_user_dashboard");
  });

  $(document).on("click", "#account-settings", function (e) {
    selectContent("account_settings");
  });

  $(document).on("click", "#branches", function (e) {
    selectContent("branches");
  });

  $(document).on("click", "#shareClass", function (e) {
    selectContent("share_classes");
  });

  $(document).on("click", "#shareholders", function (e) {
    selectContent("shareholders");
  });

  $(document).on("click", "#capitalContribution", function (e) {
    selectContent("capital_contribution");
  });

  $(document).on("click", "#shares", function (e) {
    selectContent("shares");
  });

  $("#logout").on("click", function (e) {
    sessionStorage.clear();
    users.logout();
  });
});

function loadLinks(privileges) {
  const userPrivileges = JSON.parse(privileges).map(priv => priv.name);

  // Filter and sort links based on position
  const allowedLinks = links
    .filter(link => userPrivileges.includes(link.privilege))
    .sort((a, b) => a.position - b.position); // Sort by position

  // Load links in the sorted order
  allowedLinks.forEach(link => {
    $.when(loadContent("sidebarLinks", "", link.link)).done(() => {
    })
  });
}


export function selectContent(state) {

  for (let index = 0; index < content_view.length; index++) {
    if (state === content_view[index].state) {
      loadOtherContent(state, index)
      break;
    }
  }
}

function loadOtherContent(state, index) {

  $.when(loadContent(mainContent, state, content_view[index].link)).done(
    function () {
      if (
        content_view[index].modals != null &&
        typeof content_view[index].modals != undefined
      ) {

        $(`#${modalContent}`).html("");

        $.each(content_view[index].modals, function (key, modal_path) {
          $.when(loadContent(modalContent, "", modal_path)).done(
            function () { }
          );
        });

        $("#pageTitle").text(content_view[index].title);


      }

      let user_id = sessionStorage.getItem("user_id");

      switch (state) {
        case "users":
          users.fetchUsers();
          break;
        case "user_invitations":
          users.fetchInvitations();
          break;
        case "user_roles":
          users.fetchRoles();
          break
        case "group":
          client.fetchClientsData(state);
          break;
        case "individual":
          client.fetchClientsData(state);
          break;
        case "client_form":
          users.loadIdentifierTypes();
          break;
        case "organization":
          client.fetchClientsData(state);
          break;
        case "individual_records":
          setRecordTitle("recordName", "Records");
          break;
        case "organization_records":
          setRecordTitle("recordName", "Records");
          break;
        case "group_records":
          setRecordTitle("recordName", "Records");
          break;
        case "interests":
          fetchInterests(state);
          break;
        case "investors":
          // fetchInterests(state);
          break;
        case "applications":
          populateApplicationStatusesStats(
            loans.fetchLoanApplicationsStatuses()
          );
        case "income":
          fetchIncomeData();
          break;
        case "grades":
          settings.fetchGrades();
          break;
        case "scores":
          settings.fetchScores();
          break;
        case "score_names":
          settings.fetchScoresNames();
          break;
        case "dti_ratios":
          settings.fetchDTIRatios();
          break;
        case "loans":
          loans.fetchLoans();
          break;
        case "loan_payments":
          loadLoanPayments();
          break;
        case "seized_collaterals":
          loans.fetchCollateralSeizures();
          break;
        case "collateral_sales":
          loans.fetchCollateralSales();
          break;
        case "collateral_sales":
          loans.fetchCollateralSales();
          break;
        case "demographics":
          loadDemographics();
          break;
        case "jobs":
          loadClientJobs();
          break;
        case "dependants":
          loadClientDependants();
          break;
        case "businesses":
          loadClientBusinesses();
          break;
        case "assets":
          loadClientAssets();
          break;
        case "other_loans":
          loadClientOtherLoans();
          break;
        case "new_applications":
          loans.fetchLoanApplications({ status_name: "NEW" });
          break;
        case "waiting_applications":
          loans.fetchLoanApplications({ status_name: "WAITING" });
          break;
        case "completed_applications":
          loans.fetchLoanApplications({ status_name: "DONE" });
          break;
        case "dumped_applications":
          loans.fetchLoanApplications({ status_name: "DUMPED" });
          break;
        case "client_investments":
          loadClientInvestments();
          break;
        case "investment_packages":
          investment.fetchInvestimentPackages();
          break;
        case "investments":
          investment.fetchInvestments();
          break;
        case "return_on_investments":
          investment.fetchReturnsOnInvestments()
          break;
        case "my_investments":
          investment.fetchMyInvestments({ user_id: user_id });
          break;
        case "my_return_on_investments":
          investment.fetchMyReturnOnInvestments({ user_id: user_id });
          break;
        case "expenses":
          expense.fetchExpensesData();
          break;
        case "investor_dashboard":
          dashboard.investor();
          break;
        case "email_subscriptions":
          subscription.fetchSubscriptions();
          break;
        case "admin_dashboard":
          dashboard.admin();
          break;
        case "loan_officer_dashboard":
          dashboard.loanOfficer();
          break;
        case "accounts":
          account.fetchAccounts();
          break;
        case "branches":
          account.fetchBranches("account");
          break;
        case "account_settings":
          populateAccountDetails();
          break;
        case "share_classes":
          share_management.fetchShareClasses();
          break;
        case "shareholders":
          share_management.fetchShareholders();
          break;
        case "capital_contribution":
          share_management.fetchCapitalContributions();
          break;
        case "shares":
          share_management.fetchShares();
          break;
      }
    }
  );
}

function populateApplicationStatusesStats(statuses_stats) {
  if (statuses_stats != null)
    statuses_stats.forEach(function (status_stat, index) {
      if (status_stat.name === "NEW") {
        $("#status-new").text(status_stat.num_of_applications);
      } else if (status_stat.name === "WAITING") {
        $("#status-waiting").text(status_stat.num_of_applications);
      } else if (status_stat.name === "DONE") {
        $("#status-completed").text(status_stat.num_of_applications);
      } else if (status_stat.name === "DUMPED") {
        $("#status-dumped").text(status_stat.num_of_applications);
      }
    });
}


function loadDemographics() {
  const currentDataset = getDataset("clientDataSet");
  $.each(currentDataset, function (key, value) {
    $("#demographics").find(`[id = '${key}']`).text(value);
  });

  $("#recordName").text(
    `${currentDataset.recordFirstname} ${currentDataset.recordLastname} Demographics`
  );
}

function loadClientJobs() {
  const currentDataset = setRecordTitle("recordName", "Jobs");

  client.fetchClientJobs({
    client_id: currentDataset.recordId,
  });
}

function loadClientDependants() {
  const currentDataset = setRecordTitle("recordName", "Dependants");

  client.fetchClientDependants({
    client_id: currentDataset.recordId,
  });
}

function loadClientBusinesses() {
  const currentDataset = setRecordTitle("recordName", "Businesses");

  client.fetchClientBusinesses({
    client_id: currentDataset.recordId,
  });
}

function loadClientAssets() {
  const currentDataset = setRecordTitle("recordName", "Assets");

  client.fetchClientAssets({
    client_id: currentDataset.recordId,
  });
}

function loadClientOtherLoans() {
  const currentDataset = setRecordTitle("recordName", "Other Loams");

  client.fetchClientOtherLoans({
    client_id: currentDataset.recordId,
  });
}

function loadClientInvestments() {
  const currentDataset = setRecordTitle("recordName", "Investment Subscriptions");

  investment.fetchClientSubscriptions({
    client_id: currentDataset.recordId,
  });
}

function loadLoanPayments() {
  let currentDataset = getDataset("loanPaymentDataset");
  $("#paymentLoanId").val(currentDataset.loanId);
  $("#paymentTitle").text(`Loan Payments for ${currentDataset.firstname} ${currentDataset.lastname}`);
  $.when(loans.fetchLoanPayments({ loan_id: currentDataset.loanId })).done(function () { });

}

function setRecordTitle(titleId, recordName) {
  const currentDataset = getDataset("clientDataSet");

  if (currentDataset.clientType === "individual") {
    $(`#${titleId}`).text(
      `${currentDataset.recordFirstname} ${currentDataset.recordLastname} ${recordName}`
    );
  } else if (currentDataset.clientType === "organization") {
    $(`#${titleId}`).text(
      `${currentDataset.orgName} ${recordName}`
    );
  }

  return currentDataset;

}

function getDataset(datasetName) {
  return JSON.parse(localStorage.getItem(datasetName));
}
