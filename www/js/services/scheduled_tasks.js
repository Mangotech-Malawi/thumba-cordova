import { apiClient } from "./api-client.js";

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
                render: function(data) {
                    if (!data) return "-";
                    const date = new Date(data);
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
            },
            { 
                data: "next_run_at",
                render: function(data) {
                    if (!data) return "-";
                    return new Date(data).toLocaleString();
                }
            },
            { 
                data: "last_run_at",
                render: function(data) {
                    if (!data) return "Never";
                    return new Date(data).toLocaleString();
                }
            },
            { data: "run_count" },
            { 
                data: "is_active",
                render: function(data) {
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
                render: getScheduledTaskActionsBtn,
                data: null,
                targets: [9],
            }
        ],
    });
}

function getScheduledTaskActionsBtn(data, type, row, metas) {
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

    const deleteDataFields = `data-scheduled-task-id="${data.id}"
        data-action-type="delete"`;

    const editBtn = `<button type="button" class="btn btn-default btn-sm edit-scheduled-task" 
        data-toggle="modal" data-target="#modal-scheduled-task" ${editDataFields}>
        <i class="fas fa-edit"></i>
    </button>`;

    const deleteBtn = `<button type="button" class="btn btn-danger btn-sm delete-scheduled-task" ${deleteDataFields}>
        <i class="fas fa-trash"></i>
    </button>`;

    const toggleBtn = data.is_active 
        ? `<button type="button" class="btn btn-warning btn-sm toggle-task-status" data-scheduled-task-id="${data.id}" data-is-active="false">
            <i class="fas fa-pause"></i>
        </button>`
        : `<button type="button" class="btn btn-success btn-sm toggle-task-status" data-scheduled-task-id="${data.id}" data-is-active="true">
            <i class="fas fa-play"></i>
        </button>`;

    return `<div class="btn-group">${editBtn} ${toggleBtn} ${deleteBtn}</div>`;
}