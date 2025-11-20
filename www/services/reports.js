import { apiClient, fileApiClient  } from "./api-client.js";

export function users(params) {
  return apiClient("/api/v1/report/users", "GET", "json", false, false, params);
}

export function admin(params){
  return apiClient("/api/v1/report/admin", "GET", "json", false, false, params);
}

export function loan(params){
  return apiClient("/api/v1/report/loan", "GET", "json", false, false, params);
}

export function finance(params){
  return apiClient("/api/v1/report/finance", "GET", "json", false, false, params);
}

export function shares(params){
  return apiClient("/api/v1/report/shares", "GET", "json", false, false, params);
}


export function getSharesReportPDF(start_date, end_date) {
  return fileApiClient(
    `/api/v1/report/shares_pdf?start_date=${start_date}&end_date=${end_date}`,
    "GET",
    "binary",
    true,   // async should be true (so $.when() can wait)
    false,
    null,
    false   // not uploading a file
  );
}

export function getFinanceReportPDF(start_date, end_date) {
  return fileApiClient(
    `/api/v1/report/finance_pdf?start_date=${start_date}&end_date=${end_date}`,
    "GET",
    "binary",
    true,   // async should be true (so $.when() can wait)
    false,
    null,
    false   // not uploading a file
  );
}

export function getLoanReportPDF(start_date, end_date){
  return fileApiClient(
    `/api/v1/report/loans_pdf?start_date=${start_date}&end_date=${end_date}`,
    "GET",
    "binary",
    true,   // async should be true (so $.when() can wait)
    false,
    null,
    false   // not uploading a file
  );
}


export function getAdminReportPDF(start_date, end_date){
  return fileApiClient(
    `/api/v1/report/admin_pdf?start_date=${start_date}&end_date=${end_date}`,
    "GET",
    "binary",
    true,   // async should be true (so $.when() can wait)
    false,
    null,
    false   // not uploading a file
  );
}



