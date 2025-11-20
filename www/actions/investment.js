import * as investment from "../services/investments.js";
import * as user from "../services/users.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { notify } from "../services/utils.js";
import { setRecordText } from "../utils/utils.js";

const investmentModal = "#modal-investment";
const investmentProductForm = "#investmentProductForm";
const investmentPackageModal = "#modal-investiment-package";

$(function () {

    $(document).on("click", "#btnInvestmentProduct", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/investment_product.html", 
                                "investment_product_form")).done(
          function () {
    
          }
        );
    });

    $(document).on("click", ".edit-investment-product", function (e) {
        const data = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/investment_product.html", "investment_product_form")).done(
            function () {
            $("#formTitle").text("Edit Investment Product");

            $.each(data, function (key, value) {
                $(investmentProductForm).find(`[id = '${key}']`).val(value);
                $(investmentProductForm).find(`[id = '${key}']`).val(value).trigger("change");
            });
            }
        );
    });

      $(document).on("click", "#investmentProductBackBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/investments/investmentPackages.html", "investment_packages")).done(
          function () {
            investment.fetchInvestimentPackages();
          }
        );
      });


    $(document).on("click", "#saveInvestmentPackageBtn", function (e) {

        if(form.validateInvestmentPackageForm())
        if ($("#formTitle").text().trim() === "Add Investment Product") {
            notification(
                investment.addInvestmentPackage(getInvestmentPackageParams()).created,
                "center",
                "success",
                "investment_package",
                "Add Investment Product",
                "Investment Product has been added successfully",
                true,
                3000
            );
        } else if ($("#formTitle").text() === "Edit Investment Product") {
            notification(
                investment.editInvestmentPackage(getInvestmentPackageParams()).updated,
                "center",
                "success",
                "investment_package",
                "Edit Investment Product",
                "Investment Product has been edited successfully",
                true,
                3000
            );
        }
    });

    $(document).on("show.bs.modal", investmentPackageModal, function (e) {
        let opener = e.relatedTarget;
    

        if ($(opener).attr("data-action-type") === "edit") {
            $(investmentPackageModal).find(`[id = 'investmentPackageModalTitle']`).text("Edit Investment Package");

            $.each(opener.dataset, function (key, value) {
                $(investmentPackageModal).find(`[id = '${key}']`).val(value);
            });
        } else {
            $(investmentPackageModal).find(`[id = 'investmentPackageModalTitle']`).text("Add Investment Package");
        }
    });

    $(document).on("click", ".download-investment-package", function(){
       
        let investiment_package_id = $(this).data().investmentPackageId

        $.when(investment.getPackageFile({id:  investiment_package_id})).done(function (htmlContent) {
            if (htmlContent) {
              let win = window.open("", "", "");
              win.document.write(htmlContent.html)
              win.document.close();
              win.print();
            } else {
              console.error("HTML content is null or empty.");
            }
        });
    })

    $(document).on("click", "#downloadInvestmentProducts", function (){
        $.when(investment.getPackagesFile()).done(function (htmlContent) {
            if (htmlContent) {
              let win = window.open("", "", "");
              win.document.write(htmlContent.html)
              win.document.close();
              win.print();
            } else {
              console.error("HTML content is null or empty.");
            }
        });
    })

    $(document).on("click", ".delete-investment-package", function (e) {
        let id = $(this).data().id;

        notification(
            investment.deleteInvestmentPackage({
                investiment_package_id: id
            }).deleted,
            "center",
            "success",
            "investment_package",
            "Delete Investment Package",
            "Investment package has been deleted successfully",
            true,
            3000
        );

    });

    $(document).on("show.bs.modal", investmentModal, function (e) {
        clearFields("#investmentForm");

        let users = user.fetchUsers();
        let opener = e.relatedTarget;
        let investors = [];
        let investmentPackagesArray = [];
        let investmentPackages = investment.fetchInvestimentPackages("load-none");

        if (investmentPackages !== null) {
            investmentPackages.forEach(function (investment_package, index) {
                investmentPackagesArray.push(
                    '<option value ="',
                    investment_package.id,
                    '">',
                    `${investment_package.package_name} | ${investment_package.interest_rate}%`,
                    "</option>"
                )
            });

            $("#investmentPackageId").html(investmentPackagesArray.join(""));
        }

        if (users !== null) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].role === "investor" || users[i].role === "co-owner") {
                    investors.push(
                        '<option value ="',
                        users[i].id,
                        '">',
                        `National ID: ${users[i].national_id } | Initials: ${users[i].firstname}  ${users[i].lastname} `,
                        "</option>"
                    );
                }

                $("#investorId").html(investors.join(""));
            }
        }


        if ($(opener).attr("data-action-type") === "edit") {
            $(investmentModal).find(`[id = 'investmentModalTitle']`).text("Edit Investment");

            $.each(opener.dataset, function (key, value) {
                $(investmentModal).find(`[id = '${key}']`).val(value);
            });
        } else {
            $(investmentModal).find(`[id = 'investmentModalTitle']`).text("Add Investment");
        }
    });

    $(document).on("click", "#saveInvestmentBtn", function (e) {
        if(form.validateInvestmentForm()){
            if ($("#investmentModalTitle").text() === "Add Investment") {
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
            } else if ($("#investmentModalTitle").text() === "Edit Investment") {
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

    $(document).on("click", ".delete-investment", function (e) {
        let id = $(this).data().id;

        notification(
            investment.deleteInvestment({
                id: id
            }).deleted,
            "center",
            "success",
            "investment",
            "Delete Investment",
            "Investment has been deleted successfully",
            true,
            3000
        );
    });
});

function getInvestmentPackageParams() {
    let id = $("#investmentPackageId").val();
    let package_name = $("#packageName").val();
    let package_type = $("#packageType option:selected").val();
    let min_amount = $("#minAmount").val();
    let max_amount = $("#maxAmount").val();
    let interest_rate = $("#interestRate").val();
    let interest_rate_frequency = $("#interestRateFrequency option:selected").val();
    let duration = $("#duration").val();
    let durationType = $("#durationType").val();
    let compoundingFrequency = $("#compoundingFrequency").val();
    let currency = $("#currency").val();
    let requirements = $("#requirements").val();
    let terms_and_conditions = $("#termsAndConditions").val();
    let payout_schedule = $("#payoutSchedule").val();
    let risk_level = $("#riskLevel option:selected").val();

    let params = {
        investiment_package_id: id,
        package_name: package_name,
        package_type: package_type,
        min_amount: min_amount,
        max_amount: max_amount,
        interest_rate: interest_rate,
        interest_frequency: interest_rate_frequency,
        duration: duration,
        duration_type: durationType,
        currency: currency,
        requirements: requirements,
        term_and_conditions: terms_and_conditions,
        payout_schedule: payout_schedule,
        compounding_frequency: compoundingFrequency,
        risk_level: risk_level
    }

    return params;
}

function getInvestmentParams(){
    let investment_id = $("#investmentId").val();
    let user_id = $("#investorId").val();
    let investment_package_id = $("#investmentPackageId").val();
    let amount = $("#amount").val();
    let description =  $("#description").val();
    let investment_date =  $("#investmentDate").val();

    let params = {
        id: investment_id,
        user_id: user_id,
        investiment_package_id: investment_package_id,
        amount: amount,
        description: description,
        investment_date: investment_date
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
                case "investment_package":
                    $.when(investment.fetchInvestimentPackages()).done(function () {
                        $(investmentPackageModal).modal("hide");
                    });
                    break;
                case "investment":
                    $.when(investment.fetchInvestments()).done(function () {
                        $(investmentModal).modal("hide");
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
