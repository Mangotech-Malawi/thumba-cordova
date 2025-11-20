import * as expense from "../services/expenses.js";
const expenseModal = "#modal-expense";

import { validateExpenseForm } from "../utils/forms.js";

$(function () {
    $(document).on("show.bs.modal", expenseModal, function (e) {
        let opener = e.relatedTarget;

        if ($(opener).attr("data-button-type") === "edit") {
            $(expenseModal).find(`[id = 'expenseModalTitle']`).text("Edit Expense");

            $.each(opener.dataset, function (key, value) {
                $(expenseModal).find(`[id = '${key}']`).val(value);
            });

        } else {
            $(expenseModal).find(`[id = 'expenseModalTitle']`).text("Add Expense");
        }
    });

    $(document).on("click", "#saveExpenseBtn", function (e) {
        if (validateExpenseForm()) {
            if ($("#expenseModalTitle").text() === "Edit Expense") {
                notification(
                    expense.edit(getExpenseParams()).updated,
                    "center",
                    "success",
                    "expense",
                    "Edit expense",
                    "Expense has been edited successfully",
                    true,
                    3000
                )
            } else {
                notification(
                    expense.add(getExpenseParams()).created,
                    "center",
                    "success",
                    "expense",
                    "Add expense",
                    "Expense has been added successfully",
                    true,
                    3000
                )
            }
        }
    });

    $(document).on("hide.bs.modal", expenseModal, function (e) {
        clearFields();
    });

    $(document).on("click", ".del-expense", function (e) {
        let id = $(this).data().delExpenseId;

        notification(
            expense.deleteExpense({ id: id }).deleted,
            "center",
            "success",
            "expense",
            "Delete Expense",
            "Expense has been deleted successfully",
            true,
            3000
        );
    });
});

function getExpenseParams() {
    let id = $("#expenseId").val();
    let amount = $("#amount").val();
    let category = $("#category").val();
    let description = $("#description").val();

    let params = {
        id: id,
        amount: amount,
        category: category,
        description: description,
    };

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
                case "expense":
                    $.when(expense.fetchExpensesData()).done(function () {
                        $(expenseModal).modal("hide");
                    });
                    break;
            }
        });
}

function clearFields() {
    $("#expenseId").val("");
    $("#amount").val("");
    $("#category").val("");
    $("#description").val("");
}
