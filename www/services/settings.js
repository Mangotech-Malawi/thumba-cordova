import { apiClient } from "./api-client.js";

export function addAnalysis(params) {
  return apiClient(
    "/api/v1/applications/analyse",
    "POST",
    "json",
    false,
    false,
    params
  );
}

export function addScoreName(params) {
  return apiClient("/api/v1/score_name/new", "POST", "json", false, false, params);
}

export function editScoreName(params) {
  return apiClient("/api/v1/score_name/edit", "POST", "json", false, false, params);
}

export function deleteScoreName(params) {
  return apiClient("/api/v1/score_name/delete", "POST", "json", false, false, params);
}

export function addDTIRatio(params) {
  return apiClient("/api/v1/dti_ratio/new", "POST", "json", false, false, params);
}

export function editDTIRatio(params) {
  return apiClient("/api/v1/dti_ratio/edit", "POST", "json", false, false, params);
}

export function deleteDTIRatio(params) {
  return apiClient("/api/v1/dti_ratio/void", "POST", "json", false, false, params);
}

export function addScore(params) {
  return apiClient("/api/v1/score/new", "POST", "json", false, false, params);
}

export function editScore(params) {
  return apiClient("/api/v1/score/edit", "POST", "json", false, false, params);
}

export function deleteScore(params) {
  return apiClient("/api/v1/score/delete", "POST", "json", false, false, params);
}

export function calculateAutomaticScores(params) {
  return apiClient(
    "/api/v1/applications/calculate_risk",
    "GET",
    "json",
    false,
    false,
    params
  );
}

export function fetchManualScores() {
  return apiClient("/api/v1/scores/composite", "GET", "json", false, false, {});
}

export function fetchDTIScoreNames() {
  return apiClient("/api/v1/score_names/dti", "GET", "json", false, false, {});
}

export function fetchScoresNames() {

  let data = apiClient("/api/v1/score_names", "GET", "json", false, false, {});

  if (data != null) {
    loadScoreNamesTable(data);
  }

  return data;

}

export function fetchDTIRatios() {

  let data = apiClient("/api/v1/dti_ratios", "GET", "json", false, false, {});

  if (data != null) {
    loadDTIRatiosTable(data);
  }

  return data;

}


export function fetchScores() {
  let data = apiClient("/api/v1/scores", "GET", "json", false, false, {});

  loadScores(data);
}

function loadScoreNamesTable(dataset) {
  $("#scoreNamesTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "code" },
      { data: "score_type" },
      { data: "description" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getScoreNameUpdateBtn,
        data: null,
        targets: [4],
      },
      {
        render: getScoreNameDelBtn,
        data: null,
        targets: [5],
      },
    ],
  });
}

function getScoreNameUpdateBtn(data, type, row, metas) {
  let dataFields = `data-score-name-id = "${data.id}"
                    data-score-code = "${data.code}"
                    data-score-type = "${data.score_type}"
                    data-score-description ="${data.description}"
                    data-action-type = "edit"`;

  return getButton(dataFields, "analysis-score-name", "default", "fas fa-edit");
}

function getScoreNameDelBtn(data, type, row, metas) {
  let dataFields = `data-score-name-del-id = "${data.id}"
    data-action-type = "edit"`;

  return getButton(dataFields, "analysis-score", "danger", "fas fa-trash");
}



function loadDTIRatiosTable(dataset) {
  $("#dtiRatiosTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "code" },
      { data: "description" },
      { data: "min_ratio" },
      { data: "max_ratio" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getDtiRatioNameUpdateBtn,
        data: null,
        targets: [5],
      },
      {
        render: getDtiRatioDelBtn,
        data: null,
        targets: [6],
      },
    ],
  });
}

function getDtiRatioNameUpdateBtn(data, type, row, metas) {
  let dataFields = `data-dti-ratio-id = "${data.id}"
                    data-dti-score-names="${data.score_name_id}"
                    data-score-code = "${data.code}"
                    data-score-name-description ="${data.description}"
                    data-min-ratio="${data.min_ratio}"
                    data-max-ratio="${data.max_ratio}"
                    data-action-type = "edit"`;

  return getButton(dataFields, "dti-ratios", "default", "fas fa-edit");
}

function getDtiRatioDelBtn(data, type, row, metas) {
  let dataFields = `data-id = "${data.id}"
    data-action-type = "edit"`;

  return getButton(dataFields, "", "danger delete-dti-ratio", "fas fa-trash");
}

function loadScores(dataset) {
  $("#scoresTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "code" },
      { data: "score_type" },
      { data: "description" },
      { data: "score" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getScoreUpdateBtn,
        data: null,
        targets: [5],
      },
      {
        render: getScoreDelBtn,
        data: null,
        targets: [6],
      },
    ],
  });
}

function getScoreUpdateBtn(data, type, row, metas) {
  let dataFields = `data-score-id = "${data.id}"
                    data-code = "${data.code}"
                    data-name = "${data.name}"
                    data-description ="${data.description}"
                    data-score ="${data.score}"
                    data-action-type = "edit"`;

  return getButton(dataFields, "analysis-score", "default", "fas fa-edit");
}

function getScoreDelBtn(data, type, row, metas) {
  let dataFields = `data-id = "${data.id}"
    data-action-type = "edit"`;

  return getButton(dataFields, "", "danger delete-score", "fas fa-trash");
}

export function addGrade(params) {
  return apiClient("/api/v1/grade/new", "POST", "json", false, false, params);
}

export function editGrade(params) {
  return apiClient("/api/v1/grade/edit", "POST", "json", false, false, params);
}

export function deleteGrade(params) {
  return apiClient("/api/v1/grade/delete", "POST", "json", false, false, params);
}


export function fetchGrades() {
  let data = apiClient("/api/v1/grades", "GET", "json", false, false, {});

  loadGrades(data);
}

export function fetchGrade(params) {
  let data = apiClient(
    "/api/v1/analysis_grade",
    "GET",
    "json",
    false,
    false,
    params
  );
  return data;
}

function loadGrades(dataset) {
  $("#gradesTable").DataTable({
    destroy: true,
    responsive: true,
    searching: true,
    ordering: true,
    lengthChange: true,
    autoWidth: false,
    info: true,
    data: dataset,
    columns: [
      { data: "id" },
      { data: "name" },
      { data: "maximum" },
      { data: "minimum" },
      { data: null },
      { data: null },
    ],
    columnDefs: [
      {
        render: getGradeUpdateBtn,
        data: null,
        targets: [4],
      },
      {
        render: getGradeDelBtn,
        data: null,
        targets: [5],
      },
    ],
  });
}

export function getGradeUpdateBtn(data, type, row, metas) {
  let dataFields = `data-grade-id = "${data.id}"
                      data-name     = "${data.name}"
                      data-maximum  = "${data.maximum}"
                      data-minimum  = "${data.minimum}"
                      data-action-type = "edit"`;
  return getButton(dataFields, "analysis-grade", "success", "fas fa-edit");
}

export function getGradeDelBtn(data, type, row, metas) {
  let dataFields = `data-id = "${data.id}"
                    data-action-type = "edit"`;
  return getButton(dataFields, "", "danger delete-grade", "fas fa-trash");
}

function getButton(dataFields, modal, color, icon) {
  return `<button type='button' class="btn btn-block btn-${color}"
             data-toggle="modal" data-target="#modal-${modal}" ${dataFields} >
              <i class="${icon}" aria-hidden="true"></i></button>`;
}
