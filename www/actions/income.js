import * as users from "../services/users.js";
import * as income from "../services/income.js";
import { notify } from "../services/utils.js";

const modalId = "#modal-income";
const delModalId = "#modal-del-income";

$(function () {
  $(document).on("show.bs.modal", modalId, function (e) {
    let data = users.fetchUsers();
    let opener = e.relatedTarget;

    let investors = [];

    if (data !== null) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].role === "investor" || data[i].role === "co-owner") {
          investors.push(
            '<option value ="',
            data[i].id,
            '">',
            data[i].firstname,
            "</option>"
          );
        }

        $("#investorId").html(investors.join(""));
      }
    }

    if ($(opener).attr("data-button-type") === "edit") {
      $(modalId).find(`[id = 'incomeModalTitle']`).text("Edit Income");

      $.each(opener.dataset, function (key, value) {
        $(modalId).find(`[id = '${key}']`).val(value);
      });
    } else {
      $(modalId).find(`[id = 'incomeModalTitle']`).text("Add Income");
    }
  });

  $(document).on("click", "#saveIncomeBtn", function (e) {
    let id = $("#incomeId").val();
    let amount = $("#amount").val();
    let category = $("#category").val();
    let investorId = $("#investorId").val();
    let description = $("#description").val();

    let params = {
      id: id,
      amount: amount,
      category: category,
      user_id: investorId,
      description: description,
    };

    if ($("#incomeModalTitle").text() === "Edit Income") {
      let resp = income.edit(params);

      if (resp.updated) {
        $.when(
          notify(
            "center",
            "success",
            "Edit Income",
            "Imcome updated successfully",
            false,
            3000
          )
        ).done(function () {
          $.when(income.fetchIncomeData()).done(function () {
            $(modalId).modal("hide");
          });
        });
      }
    } else {
      let resp = income.add(params);

      if (resp != null) {
        $.when(
          notify(
            "center",
            "success",
            "Add Income",
            "Income added successfully",
            false,
            3000
          )
        ).done(function () {
          $.when(income.fetchIncomeData()).done(function () {
            $(modalId).modal("hide");
          });
        });
      }
    }
  });

  $(document).on("hide.bs.modal", modalId, function (e) {
    clearFields();
  });

  $(document).on("show.bs.modal", delModalId, function (e) {
    let opener = e.relatedTarget;
    $("#delIncomeId").val("");
    $("#reason").val("");
    delIncomeId = $(opener).attr("data-del-income-id");

    $(delModalId).find(`[id = 'delIncomeId']`).val(delIncomeId);
  });

  $(document).on("click", "#delIncomeBtn", function (e) {
    let id = $("#delIncomeId").val();
    let void_reason = $("#reason").val();

    deleteNotification(income.deleteIncome(id, void_reason));
  });
});

function deleteNotification(resp) {
  if (resp.deleted) {
    $.when(
      notify(
        "center",
        "success",
        "Delete Income",
        "Income has besen deleted successfully",
        false,
        1500
      )
    ).done(function () {
      $.when(income.fetchIncomeData()).done(function () {
        $(delModalId).modal("hide");
      });
    });
  }
}

function clearFields() {
  $("#incomeId").val("");
  $("#amount").val("");
  $("#category").val("");
  $("#investorId").val("");
  $("#description").val("");
}
