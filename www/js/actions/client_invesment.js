import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as investment from "../services/investments.js";
import { setRecordText } from "../utils/utils.js";

const investmentForm = "#investmentForm";
let currentDataset = null;
localStorage;

$(function () {


    $(document).on("click", "#btnInvestments", function (e) {
        clientInvestmentsSubView();
    });

    $(document).on("click", "#addSub", function (e) {
        const action_type = $(this).data().actionType;

        $.when(contentLoader.loadIndividualRecordView("views/forms/investment.html", "add_investment")).done(
            function () {
                $.when(populateInvestmentPackages()).done(function () {
                    if (action_type === "add-investment") {
                        const package_id = localStorage.getItem("packageId");
                        let inputElement = $("#investmentPackageId");
                        selectInvestmentPackage(inputElement, package_id);
                    }
                });
            }
        );
    });

    $(document).on("click", "#investmentDetails", function (e) {
        clientInvestmentsView("investment_details");
    });

    $(document).on("click", "#investmentOverview", function (e) {
        clientInvestmentsView("investment_overview");
    });

    $(document).on("click", ".edit-investment", function (e) {
        const opener = $(this).data(); // Get data attributes from clicked element

        // Load the investment form view
        $.when(contentLoader.loadIndividualRecordView("views/forms/investment.html", "add_investment"))
            .done(function () {
                // Populate the investment packages dropdown
                $.when(populateInvestmentPackages()).done(function () {
                    $("#formTitle").text("Edit Client Investment"); // Update the form title

                    // Populate the form fields
                    $.each(opener, function (key, value) {
                        let inputElement = $(investmentForm).find(`[id='${key}']`);

                        // If the input is the investment package dropdown
                        if (inputElement.is("#investmentPackageId")) {
                            selectInvestmentPackage(inputElement, value)
                        } else if (inputElement.is("#investmentDate")) {

                            $("#investmentDatePicker").datetimepicker({
                                format: "L",
                            });

                            if (inputElement.is("#investmentDate")) {
                                const parsedDate = new Date(value);

                                if (!isNaN(parsedDate.getTime())) {
                                    const formattedDate = moment(parsedDate).format("L");
                                    $("#investmentDatePicker").datetimepicker("date", formattedDate);
                                    inputElement.val(formattedDate).change();
                                } else {
                                    console.error("Invalid date value:", value);
                                }
                            }

                        } else {
                            inputElement.val(value);
                        }
                    });
                });
            });
    });


    $(document).on("change", "#investmentPackageId", function () {
        const selectedPackage = $(this).val();
        if (selectedPackage) {
            const investmentPackageObject = JSON.parse(decodeURIComponent(selectedPackage));

            // Update the labels
            $("#minAmount").text(investmentPackageObject.min_amount);
            $("#maxAmount").text(investmentPackageObject.max_amount);
            $("#interestRate").text(`${investmentPackageObject.interest_rate}%`);
            $("#interestFrequency").text(investmentPackageObject.interest_frequency);
            $("#duration").text(`${investmentPackageObject.duration} ${investmentPackageObject.duration_type}`);
            $("#currency").text(investmentPackageObject.currency);
            $("#compoundingFrequency").text(investmentPackageObject.compounding_frequency);

            // Show the details section if hidden
            $("#investmentPackageDetails").show();
        } else {
            // Hide the details section if no package is selected
            $("#investmentPackageDetails").hide();
        }
    });


    $(document).on("click", ".client-investments", function (e) {
        const subscription_id = $(this).data().subscriptionId;
        const package_id = $(this).data().packageId;

        localStorage.removeItem("packageId");
        localStorage.setItem("packageId", package_id);
        localStorage.removeItem("subscriptionId");
        localStorage.setItem("subscriptionId", subscription_id);

        clientInvestmentsView("investment_details");

    });

    $(document).on("click", "#investmentBtn", function (e) {
        if (form.validateInvestmentForm()) {
            if ($("#formTitle").text().trim() === "Add Client Investment") {
                notification(
                    investment.addInvestment(getInvestmentParams()).created,
                    "center",
                    "success",
                    "client_investments",
                    "Add Investment",
                    "Investment has been added successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text() === "Edit Client Investment") {
                notification(
                    investment.editInvestment(getInvestmentParams()).updated,
                    "center",
                    "success",
                    "client_investments",
                    "Edit Investment",
                    "Investment has been edited successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text().trim() === "Add Investment Subscription") {
                notification(
                    investment.addInvestment(getInvestmentParams()).created,
                    "center",
                    "success",
                    "investment",
                    "Add Investment",
                    "Investment has been added successfully",
                    true,
                    3000
                );
            } else if ($("#formTitle").text() === "Edit Investment Subscription") {
                notification(
                    investment.editInvestment(getInvestmentParams()).updated,
                    "center",
                    "success",
                    "investment",
                    "Edit Investment",
                    "Investment has been edited successfully",
                    true,
                    3000
                );
            }
        }
    });


});

function getInvestmentParams() {

    let investment_id = $("#investmentId").val();

    let investment_package_id = JSON.parse(decodeURIComponent($("#investmentPackageId").val())).id
    let amount = $("#amount").val();
    let investment_date = $("#investmentDate").val();

    let params = {
        id: investment_id,
        client_id: currentDataset.recordId,
        investiment_package_id: investment_package_id,
        amount: amount,
        investment_date: investment_date
    }

    return params;
}

function clientInvestmentsSubView() {

    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/investmentsSubscription.html", "client_investments")).done(
            function () {
              
                setRecordText(currentDataset, "recordName", "Investment Subscriptions");

                investment.fetchClientSubscriptions({
                    client_id: currentDataset.recordId,
                });

            }
        );
    }
}

function loadInvestmentDetailsView(subscription_id) {
    $.when(contentLoader.loadInvestmentView("views/clients/investment_details.html",
        "investment_details")).done(
            function () {
                investment.fetchClientInvestments({
                    subscription_id: subscription_id,
                });
            }
        );
}

function loadInvestmentOverview(subscription_id) {
    $.when(contentLoader.loadInvestmentView("views/clients/investment_overview.html",
        "investment_overview")).done(
            function () {
                investment.fetchClientInvestments({
                    subscription_id: subscription_id,
                });
            }
        );
}

function clientInvestmentsView(viewType) {
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/investments.html", "investments")).done(
            function () {

                let subscription_id = localStorage.getItem("subscriptionId");

                if (viewType === "investment_details") {
                    loadInvestmentDetailsView(subscription_id);
                } else if (viewType === "investment_overview") {
                    loadInvestmentOverview(subscription_id);
                }

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
                case "investment":
                    clientInvestmentsSubView();
                    break;
            }
        });
}

function populateInvestmentPackages() {
    let investmentPackages = investment.fetchInvestimentPackages("load-none");


    if (investmentPackages !== null) {
        let investmentPackagesArray = [];
        investmentPackages.forEach(function (investment_package) {
            investmentPackagesArray.push(
                '<option value="',
                encodeURIComponent(JSON.stringify(investment_package)),
                '" data-package-id="', investment_package.id, '">',
                `${investment_package.package_name} | ${investment_package.interest_rate}%`,
                '</option>'
            );
        });

        $("#investmentPackageId").html(investmentPackagesArray.join(""));
    }
}

function selectInvestmentPackage(inputElement, value) {
    const matchingOption = inputElement.find(`option[data-package-id='${value}']`);
    if (matchingOption.length > 0) {
        inputElement.val(matchingOption.val()).trigger("change"); // Trigger change if matching

        inputElement.prop("disabled", true);
    }
}

