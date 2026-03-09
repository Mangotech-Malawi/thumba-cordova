import { apiClient } from "./api-client.js";

export function add(params) {
    return apiClient(
        "/api/v1/job_schedules",
        "POST",
        "json",
        false,
        false,
        params
    )
}

export function edit(params) {
    return apiClient(
        "/api/v1/job_schedules",
        "PUT",
        "json",
        false,
        false,
        params
    );
}

export function fetchScheduledTasks() {
    let tasks = apiClient("/api/v1/job_schedules", "GET", "json", false, false, {});
    populateScheduledTasksTable(tasks);
}

function populateScheduledTasksTable(tasks) {
    $("#scheduledTasksTable").DataTable({
        destroy: true,
        responsive: true,
        searching: true,
        ordering: true,
        lengthChange: true,
        autoWidth: false,
        info: true,
        data: tasks,
        columns: [
            { data: "id" },
            { data: "job_name" },
            { data: "job_class" },
            { data: "frequency" },
            {
                data: "run_at_time",
                render: function (data) {
                    if (!data) return "-";
                    const date = new Date(data);
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
            },
            {
                data: "next_run_at",
                render: function (data) {
                    if (!data) return "-";
                    return new Date(data).toLocaleString();
                }
            },
            {
                data: "last_run_at",
                render: function (data) {
                    if (!data) return "Never";
                    return new Date(data).toLocaleString();
                }
            },
            { data: "run_count" },
            {
                data: "is_active",
                render: function (data) {
                    if (data) {
                        return '<span class="badge badge-success">Active</span>';
                    } else {
                        return '<span class="badge badge-secondary">Inactive</span>';
                    }
                }
            },
            { data: null },
        ],
        columnDefs: [
            {
                render: getEditTaskScheduledBtn,
                data: null,
                targets: [9],
            }
        ],
    });
}


function getEditTaskScheduledBtn(data, type, row, metas) {
    const editDataFields = `data-scheduled-task-id="${data.id}"
        data-job-class="${data.job_class}"
        data-job-name="${data.job_name}"
        data-description="${data.description || ''}"
        data-frequency="${data.frequency}"
        data-run-at-time="${data.run_at_time}"
        data-run-on-days="${data.run_on_days || ''}"
        data-run-on-date="${data.run_on_date || ''}"
        data-is-active="${data.is_active}"
        data-action-type="edit"`;

    return getButton(editDataFields, "", "primary edit-task-schedule",
        "fas fa-edit");

}

function getButton(dataFields, modal, color, icon) {
    return `<button type='button' class="btn btn-block btn-${color}" data-toggle="modal" 
            data-target="#modal-${modal}" ${dataFields} ><i class="${icon}" aria-hidden="true"></i></button>`;
}
