import { apiClient } from "./api-client.js";

export function fetchSubscriptions() {
    let data = apiClient("/api/v1/subscribers", "GET", "json",
        false, false, {});

    populateSubscriptionsTable(data);
}

export function Subscribe(params){
    return apiClient("/api/v1/subscribe", "POST", "json", false, false, params);
}

function populateSubscriptionsTable(dataSet) {
    $("#emailSubscriptionsTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        buttons: ["copy", "csv", "excel", "pdf"],
        data: dataSet,
        columns: [
            { data: "id" },
            { data: "email" },
            { data: "created_at" }
        ]
        
    });
}