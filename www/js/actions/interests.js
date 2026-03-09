import * as interest from "../services/interests.js";
import * as settings from "../services/settings.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { notify } from "../services/utils.js";
import { setRecordText } from "../utils/utils.js";

const modalId = "#modal-interest";
const loanProductForm = "#loanProductForm";
const delModalId = "#modal-del-interest";
let rowCounter;
$(function () {

  $(document).on("click", "#btnInterestBtn", function (e) {
    $.when(contentLoader.loadIndividualRecordView("views/forms/interest.html", "interest_form")).done(
      function () {
        rowCounter = 0;
        populateScoreNames();
      }
    );
  });

  $(document).on("click", ".edit-loan-product", function (e) {
    const data = $(this).data();

    $.when(contentLoader.loadIndividualRecordView("views/forms/interest.html", "interest_form")).done(
      function () {
        $("#formTitle").text("Edit Loan Product");

        rowCounter = 0;
        $.when(populateScoreNames()).done(function () {
          // Wait for score names to load before populating form
          $.each(data, function (key, value) {
            if (key === "scores" && Array.isArray(value) && value.length > 0) {
              // Clear existing score rows
              $('#scoresContainer').empty();

              // Add a row for each score
              value.forEach(scoreItem => {
                addScoreRowWithData(scoreItem.score_name_id, scoreItem.score);
              });
            } else {
              $(loanProductForm).find(`[id = '${key}']`).val(value).trigger("change");
            }
          });

        });
      }
    );

  });

  $(document).on("click", "#loanProductBackBtn", function (e) {
    $.when(contentLoader.loadIndividualRecordView("views/interests.html", "interests")).done(
      function () {
        interest.fetchInterests();
      }
    );
  });

  $(document).on("show.bs.modal", modalId, function (e) {
    let opener = e.relatedTarget;

    if ($(opener).attr("data-action-type") === "edit") {
      $(modalId).find(`[id = 'interestModalTitle']`).text("Edit Interest");

      $.each(opener.dataset, function (key, value) {
        $(modalId).find(`[id = '${key}']`).val(value).change();

      });
    } else {
      $(modalId).find(`[id = 'interestModalTitle']`).text("Add Interest");
    }
  });

  $(document).on("show.bs.modal", delModalId, function (e) {
    $(delModalId)
      .find(`[id = 'delInterestId']`)
      .val($(e.relatedTarget).attr("data-del-interest-id"));
  });

  $(document).on("click", "#saveInterestBtn", function () {
    const id = $("#interestId").val();
    const name = $("#name").val();
    const max = $("#max").val();
    const min = $("#min").val();
    const rate = $("#rate").val();
    const period = $("#period").val();
    const accum_amount = $("#accumAmount").val();
    const grace_period = $("#gracePeriod").val();
    const accum_days = $("#accumDays").val();
    const loan_term_type = $("#loanTermType").val();
    const rate_type = $("#rateType").val();
    const compounding_frequency = $("#compoundingFrequency").val();
    const payment_frequency = $("#paymentFrequency").val();
    const disbursement_type = $("#disbursementType").val();
    const max_disbursement_pct = $("#minimumDisbursementPercentage").val();
    const min_disbursement_pct = $("#maximumDisbursementPercentage").val();
    const scores = getScoresArray();

    let params = {
      interest_id: id,
      name: name,
      max: max,
      min: min,
      rate: rate,
      period: period,
      accum_amount: accum_amount,
      grace_period: grace_period,
      accum_days: accum_days,
      loan_term_type: loan_term_type,
      rate_type: rate_type,
      compounding_frequency: compounding_frequency,
      payment_frequency: payment_frequency,
      disbursement_type: disbursement_type,
      max_disbursement_pct: max_disbursement_pct,
      min_disbursement_pct: min_disbursement_pct,
      scores: scores //Add Scores Array
    };

    if (form.validateInterestForm()) {
      if ($("#formTitle").text().trim() === "Edit Loan Product") {
        let resp = interest.editInterest(params);

        if (resp.updated) {
          $.when(
            notify(
              "center",
              "success",
              "Edit Interest",
              "Interest updated successfully",
              false,
              3000
            )
          ).done(function () {
            $.when(interest.fetchInterests()).done(function () {
              $(modalId).modal("hide");
            });
          });
        }
      } else if ($("#formTitle").text().trim() === "Add Loan Product") {
        let resp = interest.addInterest(params);
        if (resp != null) {
          $.when(
            notify(
              "center",
              "success",
              "Add Interest",
              "Interest added successfully",
              false,
              3000
            )
          ).done(function () {
            $.when(interest.fetchInterests()).done(function () {
              $(modalId).modal("hide");
            });
          });
        }
        //
      }
    }

  });

  $(document).on("hide.bs.modal", modalId, function (e) {
    clearFields();
  });

  $(document).on("click", "#delInterestBtn", function (e) {
    let id = $("#delInterestId").val();

    deleteNotification(interest.deleteInterest(id));
  });

  $(document).on("click", "#addScoreRowBtn", function (e) {
    addScoreRow()
  });

  $(document).on("click", "#removeScoreBtn", function (e) {
    const rowId = $(this).data('row-id');
    removeScoreRow(rowId);
    updateAllScoreSelects();
  });


});

function deleteNotification(resp) {
  if (resp.deleted) {
    $.when(
      notify(
        "center",
        "success",
        "Delete Interest",
        "interest has been deleted successfully",
        false,
        1500
      )
    ).done(function () {
      $.when(interest.fetchInterests()).done(function () {
        $(delModalId).modal("hide");
      });
    });
  }
}

function clearFields() {
  $("#interestId").val("");
  $("#name").val("");
  $("#max").val("");
  $("#min").val("");
  $("#rate").val("");
  $("#period").val("");
  $("#accumAmount").val("");
  $("#gracePeriod").val("");
  $("#accumDays").val("");
  $("#compoundingFrequency").val("");
  $("#disbursementType").val("");
  $("#paymentFrequency").val("");
}

function populateScoreNames() {
  $.when(settings.fetchManualScores()).done(function (composite_scores) {
    localStorage.setItem("composite_scores", JSON.stringify(composite_scores));
  });
}

function getSelectedScoreIds() {
  const selectedIds = [];
  $('.score-name-select').each(function () {
    const value = $(this).val();
    if (value) {
      selectedIds.push(value);
    }
  });
  return selectedIds;
}

function getAvailableScores() {
  const composite_scores = JSON.parse(localStorage.getItem("composite_scores"));
  const selectedIds = getSelectedScoreIds();

  return composite_scores.filter(score => !selectedIds.includes(score.id.toString()));
}

function updateAllScoreSelects() {
  $('.score-name-select').each(function () {
    const currentSelect = $(this);
    const currentValue = currentSelect.val();
    const availableScores = getAvailableScores();

    // Add back the current selection temporarily
    if (currentValue) {
      const composite_scores = JSON.parse(localStorage.getItem("composite_scores"));
      const currentScore = composite_scores.find(s => s.id.toString() === currentValue);
      if (currentScore && !availableScores.find(s => s.id === currentScore.id)) {
        availableScores.push(currentScore);
      }
    }

    // Rebuild options
    const options = '<option value="">Select Score Name</option>' +
      availableScores.map(score =>
        `<option value="${score.id}" ${score.id.toString() === currentValue ? 'selected' : ''}>${score.code}</option>`
      ).join('');

    currentSelect.html(options);
  });
}

function addScoreRow() {
  const composite_scores = JSON.parse(localStorage.getItem("composite_scores"));
  const availableScores = getAvailableScores();

  if (availableScores.length === 0) {
    notify("center", "warning", "Score Names", "All score names have been selected", false, 2000);
    return;
  }

  rowCounter++;
  const container = document.getElementById('scoresContainer');

  const scoreItem = document.createElement('div');
  scoreItem.className = 'score-item';
  scoreItem.id = `score-row-${rowCounter}`;

  scoreItem.innerHTML = `
            <div class="row align-items-center">
                <div class="col-lg-5 col-md-5 col-sm-12 mb-2">
                    <label>Score Name</label>
                    <select class="form-control score-name-select" data-row="${rowCounter}" style="width: 100%;">
                        <option value="">Select Score Name</option>
                        ${availableScores.map(composite_score => `<option value="${composite_score.id}">${composite_score.code}</option>`).join('')}
                    </select>
                </div>
                <div class="col-lg-5  col-md-5 col-sm-12 mb-2">
                    <label>Score</label>
                    <input type="number" class="form-control score-input" data-row="${rowCounter}" placeholder="Enter score" step="0.01">
                </div>
                <div class="col-lg-2  col-md-2 col-sm-12 mb-2">
                    <label class="d-none d-md-block">&nbsp;</label>
                    <button type="button" id="removeScoreBtn" class="btn btn-danger btn-block" data-row-id="${rowCounter}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;

  container.appendChild(scoreItem);

  // Initialize select2 and attach change handler
  const newSelect = $(`#score-row-${rowCounter} .score-name-select`);
  newSelect.select2();

  newSelect.on('change', function () {
    updateAllScoreSelects();
  });
}

function removeScoreRow(rowId) {
  const row = document.getElementById(`score-row-${rowId}`);
  if (row) {
    row.remove();
  }
}

function getScoresArray() {
  const scores = [];
  $('.score-item').each(function () {
    const scoreNameId = parseInt($(this).find('.score-name-select').val());
    const score = parseFloat($(this).find('.score-input').val());

    if (scoreNameId && !isNaN(score)) {
      scores.push({
        score_name_id: scoreNameId,
        score: score
      });
    }
  });

  return scores;
}

function addScoreRowWithData(scoreNameId, scoreValue) {
  const composite_scores = JSON.parse(localStorage.getItem("composite_scores"));
  const availableScores = getAvailableScores();

  // Add the current score to available if not already there
  const currentScore = composite_scores.find(s => s.id === scoreNameId);
  if (currentScore && !availableScores.find(s => s.id === scoreNameId)) {
    availableScores.push(currentScore);
  }

  rowCounter++;
  const container = document.getElementById('scoresContainer');

  const scoreItem = document.createElement('div');
  scoreItem.className = 'score-item';
  scoreItem.id = `score-row-${rowCounter}`;

  scoreItem.innerHTML = `
        <div class="row align-items-center">
            <div class="col-lg-5 col-md-5 col-sm-12 mb-2">
                <label>Score Name</label>
                <select class="form-control score-name-select" data-row="${rowCounter}" style="width: 100%;">
                    <option value="">Select Score Name</option>
                                    ${availableScores.map(composite_score =>
                    `<option value="${composite_score.id}" ${composite_score.id === scoreNameId ? 'selected' : ''}>${composite_score.code}</option>`
                      ).join('')}
                  </select>
            </div>
            <div class="col-lg-5 col-md-5 col-sm-12 mb-2">
                <label>Score</label>
                <input type="number" class="form-control score-input" data-row="${rowCounter}" placeholder="Enter score" step="0.01" value="${scoreValue}">
            </div>
            <div class="col-lg-2 col-md-5 col-sm-12 mb-2">
                <label class="d-none d-md-block">&nbsp;</label>
                <button type="button" id="removeScoreBtn" class="btn btn-danger btn-block" data-row-id="${rowCounter}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;

  container.appendChild(scoreItem);

  // Initialize select2 and attach change handler
  const newSelect = $(`#score-row-${rowCounter} .score-name-select`);
  newSelect.select2();

  newSelect.on('change', function () {
    updateAllScoreSelects();
  });
}


