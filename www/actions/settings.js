import * as loans from "../services/loans.js";
import * as settings from "../services/settings.js";
import { automaticScoreOptions } from "../services/chartsOptions/automatic_score.js";
import { manualScoreOptions } from "../services/chartsOptions/manual_score.js";
import { riskResultOptions } from "../services/chartsOptions/risk_results.js";
import { notify } from "../services/utils.js";
import {
  validateAnalysisScoreNameForm, validateAnalysisScoreForm,
  validateGradeForm, validateDTIRatioForm
} from "../utils/forms.js";
import { loadContent } from "./contentLoader.js";
import { formatCurrency } from "../utils/formaters.js"

const scoresModal = "#modal-analysis-score";
const gradesModal = "#modal-analysis-grade";
const scoreNameModal = "#modal-analysis-score-name";
const dtiRatioModal = "#modal-dti-ratios";
const delScoreModal = "#modal-del-score";
let totalManualScore = 0.0;
let totalAutomaticScore = 0.0;
let availableManualScore = 0.0;
let availableAutomaticScore = 0.0;
let selectedManualScoreIds = new Array();
let totalScore = 0.0;
let risk_percentage = 0.0;
let gradeId;
let loanApplicationId = localStorage.getItem("loanApplicationId");

if (loanApplicationId != null && typeof loanApplicationId !== undefined && loanApplicationId !== "") {
  populateCalculatorCharts()
}

$(function () {
  //Resetting manual score to zero

  $(document).on("click", ".view-risk-calculator", function (e) {
    e.preventDefault();

    totalManualScore = 0.0;
    availableManualScore = 0.0;
    risk_percentage = 0.0;
    selectedManualScoreIds = new Array();

    loanApplicationId = $(this).data().loanApplicationId;

    localStorage.removeItem("loanApplicationId");
    localStorage.setItem("loanApplicationId", loanApplicationId);

    populateCalculatorCharts();

  });

  $(document).on("show.bs.modal", scoreNameModal, function (e) {
    let opener = e.relatedTarget;

    if ($(opener).attr("data-action-type") == "edit") {
      $(scoreNameModal).find(`[id = 'scoreNameModalTitle']`).text("Edit Score Name");
      $.each(opener.dataset, function (key, value) {
        $(scoreNameModal).find(`[id = '${key}']`).val(value).change();
      });
    } else {
      $(scoreNameModal).find(`[id = 'scoreNameModalTitle']`).text("Add Score Name");
    }
  });

  $(document).on("show.bs.modal", dtiRatioModal, function (e) {
    let opener = e.relatedTarget;

    clearFields("#dtiRatioForm");

    $.when(settings.fetchDTIScoreNames()).done(function (score_names) {
      $.when(populateDTIRatioScoreNames(score_names)).done(function () {
        if ($(opener).attr("data-action-type") == "edit") {
          $(dtiRatioModal).find(`[id = 'dtiRatioModalTitle']`).text("Edit DTI Ratio");

          $.each(opener.dataset, function (key, value) {
            $(dtiRatioModal).find(`[id = '${key}']`).val(value);
          });
        } else {
          $(dtiRatioModal).find(`[id = 'dtiRatioModalTitle']`).text("Add DTI Ratio");
        }
      });
    })


  });

  $(document).on("show.bs.modal", scoresModal, function (e) {
    let opener = e.relatedTarget;

    if ($(opener).attr("data-action-type") == "edit") {
      $(scoresModal).find(`[id = 'scoreModalTitle']`).text("Edit Score");

      let code = $(opener).attr("data-code");
      let id = $(opener).attr("data-score-id");
      let description = $(opener).attr("data-description");

      //Populating score names multiselect
      populateScoreNames(
        new Array({
          id: id,
          code: code,
          description: description,
        })
      );

      $.each(opener.dataset, function (key, value) {
        $(scoresModal).find(`[id = '${key}']`).val(value);
      });
    } else {
      $(scoresModal).find(`[id = 'scoreModalTitle']`).text("Add Score");
      //Populating score names multiselect
      populateScoreNames(settings.fetchScoresNames());
    }
  });

  $(document).on("click", ".manual-score-chkbox", function (e) {
    if (this.checked) {
      totalManualScore = parseFloat(totalManualScore) + parseFloat(this.value);
      selectedManualScoreIds.push(parseInt(this.dataset.id));
    } else {
      totalManualScore = parseFloat(totalManualScore) - parseFloat(this.value);
      selectedManualScoreIds.splice(
        selectedManualScoreIds.indexOf(parseInt(this.dataset.id)),
        1
      );
    }

    totalManualScore = parseFloat(Number(totalManualScore).toFixed(1));
    updateManualScoreChart(totalManualScore);
    updateRiskResultsChart();
    updateGradesLabel();
  });

  $(document).on("click", "#saveScoreNameBtn", function () {
    if (validateAnalysisScoreNameForm()) {
      if ($("#scoreNameModalTitle").text() === "Add Score Name") {
        notification(
          settings.addScoreName(scoreNameParams()).created,
          "center",
          "success",
          "score_name",
          "Add Analysis Score Name",
          "Analyisis score name has been added successfully",
          true,
          3000
        );
      } else if ($("#scoreNameModalTitle").text() === "Edit Score Name") {
        notification(
          settings.editScoreName(scoreNameParams()).updated,
          "center",
          "success",
          "score_name",
          "Edit Analysis Score Name",
          "Analysis score name has been updated successfully",
          true,
          3000
        );
      }
    }

  });

  $(document).on("click", "#saveDtiRatioBtn", function () {
    if (validateDTIRatioForm()) {

      if ($("#dtiRatioModalTitle").text() === "Add DTI Ratio") {
        notification(
          settings.addDTIRatio(DTIRatioParams()).created,
          "center",
          "success",
          "dti_ratio",
          "Add DTI Ratio",
          "DTI Ratio has been added successfully",
          true,
          3000
        );
      } else if ($("#dtiRatioModalTitle").text() === "Edit DTI Ratio") {
        notification(
          settings.editDTIRatio(DTIRatioParams()).updated,
          "center",
          "success",
          "dti_ratio",
          "Edit DTI Ratio",
          "DTI Ratio has been updated successfully",
          true,
          3000
        );
      }
    }
  });

  $(document).on("click", ".delete-dti-ratio", function (e) {
    let id = $(this).data().id;

    notification(
      settings.deleteDTIRatio({
        id: id
      }).deleted,
      "center",
      "success",
      "dti_ratio",
      "Debt Income Ratio",
      "Debt-Income-Ratio has been deleted successfully",
      true,
      3000
    );
  });


  $(document).on("click", "#saveScoreBtn", function () {
    if (validateAnalysisScoreForm()) {
      if ($("#scoreModalTitle").text() === "Add Score") {
        notification(
          settings.addScore(scoreParams()).created,
          "center",
          "success",
          "score",
          "Add Analysis Score",
          "Analyisis score has been added successfully",
          true,
          3000
        );
      } else if ($("#scoreModalTitle").text() === "Edit Score") {
        notification(
          settings.editScore(scoreParams()).updated,
          "center",
          "success",
          "score",
          "Edit Analysis Score",
          "Analysis score has been updated successfully",
          true,
          3000
        );
      }
    }

  });

  $(document).on("click", ".delete-score", function (e) {
    let id = $(this).data().id;

    notification(
      settings.deleteScore({
        score_id: id
      }).deleted,
      "center",
      "success",
      "score",
      "Void Score",
      "Score has been voided successfully",
      true,
      3000
    );

  });

  $(document).on("show.bs.modal", gradesModal, function (e) {
    let opener = e.relatedTarget;

    if ($(opener).attr("data-action-type") == "edit") {
      $(gradesModal).find(`[id = 'gradesModalTitle']`).text("Edit Grade");
      $.each(opener.dataset, function (key, value) {
        $(gradesModal).find(`[id = '${key}']`).val(value);
      });
    } else {
      $(gradesModal).find(`[id = 'gradesModalTitle']`).text("Add Grade");
    }
  });

  $(document).on("click", "#saveGradeBtn", function () {
    if (validateGradeForm()) {
      if ($("#gradesModalTitle").text() === "Add Grade") {
        notification(
          settings.addGrade(gradeParams()).created,
          "center",
          "success",
          "grade",
          "Add Analysis Grade",
          "Analyisis grade has been added successfully",
          true,
          3000
        );
      } else if ($("#gradesModalTitle").text() === "Edit Grade") {
        notification(
          settings.editGrade(gradeParams()).updated,
          "center",
          "success",
          "grade",
          "Edit Analysis Grade",
          "Analysis grade has been updated successfully",
          true,
          3000
        );
      }
    }

  });

  $(document).on("click", ".delete-grade", function (e) {
    let id = $(this).data().id;

    notification(
      settings.deleteGrade({
        grade_id: id
      }).deleted,
      "center",
      "success",
      "grade",
      "Analysis Risk Grade ",
      "Loan Risk Grade has been deleted successfully",
      true,
      3000
    );
  });

  $(document).on("click", "#saveLoanAnalysisBtn", function () {

    notification(
      settings.addAnalysis({
        loan_application_id: loanApplicationId,
        grade_id: gradeId,
        score_ids: selectedManualScoreIds,
      }).created,
      "center",
      "success",
      "analysis",
      "Record loan application analysis",
      "Analysis has been done successfully",
      true,
      3000
    );
  });

  $(document).on("click", "#newApplicationBackBtn", function () {
    $.when(loadRecord("views/loans/new.html", "new_applications")).done(
      function () {
        loans.fetchLoanApplications({ status_name: "NEW" });
      }
    )
  });

});


function scoreNameParams() {
  let scoreNameId = $("#scoreNameId").val();
  let shortCode = $("#scoreCode").val(); //Has value when updating scores
  let scoreType = $("#scoreType").val();
  let description = $("#scoreDescription").val();

  let params = {
    score_name_id: scoreNameId,
    code: shortCode,
    score_type: scoreType,
    description: description,
  };

  return params;
}

function DTIRatioParams() {
  let dtiRatioId = $("#dtiRatioId").val();
  let scoreNameId = $("#dtiScoreNames").val();
  let minRatio = $("#minRatio").val();
  let maxRatio = $("#maxRatio").val();

  let params = {
    id: dtiRatioId,
    score_name_id: scoreNameId,
    min_ratio: minRatio,
    max_ratio: maxRatio
  }

  return params;
}

function scoreParams() {
  let scoreId = $("#scoreId").val(); //Has value when updating scores
  let scoreNameId = $("#scoreName").val();
  let score = $("#score").val();

  let params = {
    score_id: scoreId,
    score_name_id: scoreNameId,
    score: score,
  };

  return params;
}

function gradeParams() {
  let gradeId = $("#gradeId").val();
  let name = $("#name").val();
  let minimum = $("#minimum").val();
  let maximum = $("#maximum").val();

  let params = {
    grade_id: gradeId,
    name: name,
    minimum: minimum,
    maximum: maximum,
  };

  return params;
}

function populateCalculatorCharts() {

  $.when(loadRecord("views/settings/risk_calculator.html", "risk_calculator")).done(function () {

    $.when(settings.calculateAutomaticScores({ loan_application_id: loanApplicationId })).done(function (automaticScores) {
      if (automaticScores.error) {
        if (automaticScores.no_dti_range) {
          notification(
            automaticScores.no_dti_range,
            "center",
            "warning",
            "dti_range",
            "DTI Range Error",
            `DTI Range for this ${automaticScores.dti_score}% score does not exist`,
            true,
            4000
          );
        } else if (automaticScores.negative) {
          notification(
            automaticScores.negative,
            "center",
            "warning",
            "dti_range",
            "Negative or Zero Cash at Hand",
            `The possible cash at hand is negative or zero hence DTI calculation not done`,
            true,
            4000
          );
        }

      } else {

        populateAutomaticScoreChart(automaticScores);

      }

      createManualScoresCheckBoxes(settings.fetchManualScores());
      updateManualScoreChart(totalManualScore);
      updateRiskResultsChart();
      updateGradesLabel();
    });


  });
}

function populateAutomaticScoreChart(automatic_score) {
  automaticScoreOptions.series[0] = automatic_score.score_percentage;

  let automaticScoreChart = new ApexCharts(
    document.querySelector("#automatic-score-chart"),
    automaticScoreOptions
  );

  automaticScoreChart.render();

  availableAutomaticScore = automatic_score.total_available_score;
  totalAutomaticScore = automatic_score.score;

  $("#automatic-score-progress-bar").attr("style", `width: ${automatic_score.score_percentage}%`)
  $(".available-score").text(availableAutomaticScore);
  $(".analysis-score").text(`${automatic_score.score_percentage}/100`);
  $("#analysis-score-percentage").text(`${automatic_score.score_percentage}%`);
  $("#installment-amount").text(`MWK${formatCurrency(automatic_score.installment_amount)}`);
  $("#monthly-salary").text(`MWK${formatCurrency(automatic_score.total_monthly_salary)}`);
  $("#dependants-expense").text(`MWK${formatCurrency(automatic_score.total_monthly_dependants_expenses)}`);
  $("#monthly-otherloans").text(`MWK${formatCurrency(automatic_score.total_monthly_otherloans)}`);
  $("#business-profits").text(`MWK${formatCurrency(automatic_score.total_monthly_business_profits)}`);

  selectedManualScoreIds.push(automatic_score.score_id);
}

function updateManualScoreChart(score) {

  let score_percentage = Number((score * 100) / availableManualScore).toFixed(1);
  $("#manual-score-progress-bar").attr("style", `width: ${score_percentage}%`);
  $("#manual-score-ratio").text(`${score_percentage}/${100}`);


}

function updateRiskResultsChart() {
  $("#risk-result-chart").html("");
  risk_percentage =
    100.0 -
    parseFloat(
      Number(
        ((totalManualScore + totalAutomaticScore) * 100) /
        (availableAutomaticScore + availableManualScore)
      ).toFixed(1)
    );

  riskResultOptions.series[0] = risk_percentage;

  let automatedScoreChart = new ApexCharts(
    document.querySelector("#risk-result-chart"),
    riskResultOptions
  );

  automatedScoreChart.render();
}

function updateGradesLabel() {
  $.when(settings.fetchGrade({ risk_percentage: risk_percentage })).done(function (grade) {
    if (grade) {
      gradeId = grade[0].id;
      $("#loan-risk-grade").text(grade[0].name);
      $("#loan-risk-grade-range").text(
        `${grade[0].minimum} - ${grade[0].maximum}  `
      );
    } else {
      notify(
        "center",
        "error",
        "Grades not available",
        "Please add grades for analysis grading ",
        true,
        4000)
    }
  });

}

function populateScoreNames(scoreNames) {
  let scoreNamesArray = [];

  scoreNames.forEach(function (scoreName, index) {
    availableManualScore = scoreNamesArray.push(
      '<option value ="',
      scoreName.id,
      '">',
      `${scoreName.code} | ${scoreName.description}`,
      "</option>"
    );
  });

  $("#scoreName").html(scoreNamesArray.join(""));
}

function populateDTIRatioScoreNames(scoreNames) {
  let scoreNamesArray = [];

  scoreNames.forEach(function (scoreName, index) {
    availableManualScore = scoreNamesArray.push(
      '<option value ="',
      scoreName.id,
      '">',
      `${scoreName.code} | ${scoreName.description}`,
      "</option>"
    );
  });

  $("#dtiScoreNames").html(scoreNamesArray.join(""));
}

function createManualScoresCheckBoxes(scores) {
  $("#scores-checkbox-row").html("");
  if (scores != null){
    scores.forEach(function (score, index) {
      $("#scores-checkbox-row").append(
        '<li>' +
        '<div class="icheck-primary  d-inline ml-2 ">' +
        '<input class="manual-score-chkbox" type="checkbox" value="' +
        score.score +
        '" id="' +
        score.id +
        score.code +
        '" data-id ="' +
        score.id +
        '" /><label for="' +
        score.id +
        score.code +
        '">' +
        '</label></div>' +
        '<span class="text">' +
        score.code +
        "</span>" +
        "</div></li>"
      );
  
      availableManualScore += score.score;
    });
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
        case "score_name":
          $.when(settings.fetchScoresNames()).done(function () {
            $(scoreNameModal).modal("hide");
          });
          break;
        case "score":
          $.when(settings.fetchScores()).done(function () {
            $(scoresModal).modal("hide");
          });
          break;
        case "dti_ratio":
          $.when(settings.fetchDTIRatios()).done(function () {
            $(dtiRatioModal).modal("hide");
          });
          break;
        case "grade":
          $.when(settings.fetchGrades()).done(function () {
            $(gradesModal).modal("hide");
          });
          break;
        case "analysis":
          $.when(loans.fetchLoanApplications({ status_name: "NEW" })).done(function () {
            $(riskCalculatorModal).modal("hide");
          });
          break;
      }
    });
}

function clearFields(formId) {
  $(":input", formId).not(":button, :submit, :reset").val("").prop("checked", false).prop("selected", false);
}

function loadRecord(path, state) {
  $.when(loadContent("mainContent", state, path)).done(function () { });
}

