import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as scheduled_task from "../services/scheduled_tasks.js"

const scheduledTaskForm = "#scheduledTaskForm";

$(function () {

    $(document).on("click", "#btnScheduledTasks", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/scheduled_tasks.html",
            "scheduled_tasks")).done(
                function () {
                    $("#formTitle").text("Add Job Schedule");
                }
            );
    });

    $(document).on("click", "#scheduledTasksBackBtn", function (e) {
        loadJobScheduleView();
    });

    $(document).on("click", ".edit-task-schedule", function (e) {
        const data = $(this).data();

        $.when(contentLoader.loadIndividualRecordView("views/forms/scheduled_tasks.html",
            "scheduled_tasks")).done(
                function () {

                    $("#formTitle").text("Edit Job Schedule");

                    $.each(data, function (key, value) {
                        // Special handling for runAtTime
                        if (key === 'runAtTime' && value) {
                            // Extract time from datetime string (e.g., "2000-01-01T16:05:00.000+02:00" -> "16:05")
                            const timeOnly = value.substring(11, 16); // Gets HH:MM from ISO string
                            $("#runAtTime").val(timeOnly);
                        }
                        // Special handling for isActive checkbox
                        else if (key === 'isActive') {
                            $("#isActive").prop('checked', value);
                        }
                        // Special handling for run_on_days - parse comma-separated string or array
                        else if (key === 'runOnDays' && value) {
                            let days = [];
                            if (typeof value === 'string') {
                                days = value.split(',').map(d => d.trim());
                            } else if (Array.isArray(value)) {
                                days = value;
                            }
                            
                            days.forEach(day => {
                                $(`#${day}`).prop('checked', true);
                            });
                        }
                        else {
                            $(scheduledTaskForm).find(`[id = '${key}']`).val(value).trigger("change");
                        }
                    });
                }
            );
    });

    $(document).on("click", "#saveJobScheduledBtn", function (e) {
        if (form.validateJobScheduleForm()) {
            if ($("#formTitle").text().trim() === "Add Job Schedule") {
                notification(
                    scheduled_task.add(getJobScheduleParams()).created,
                    "center",
                    "success",
                    "job_schedule",
                    "Add Job Schedule",
                    "Job schedule has been added successfully",
                    true,
                    3000
                )
            } else if ($("#formTitle").text().trim() === "Edit Job Schedule") {
                notification(
                    scheduled_task.edit(getJobScheduleParams()).updated,
                    "center",
                    "success",
                    "job_schedule",
                    "Update Job Schedule",
                    "Job schedule has been edited successfully",
                    true,
                    3000
                )
            }
        }
    });

});

function getJobScheduleParams() {
    const scheduled_task_id = $("#scheduledTaskId").val();
    const job_class = $("#jobClass").val();
    const job_name = $("#jobName").val();
    const frequency = $("#frequency").val();
    const runAtTime = $("#runAtTime").val();
    const runOnDate = $("#runOnDate").val();
    const description = $("#description").val();
    const isActive = $("#isActive").prop('checked');

    // Collect selected days for weekly frequency
    const selectedDays = [];
    $('.day-checkbox:checked').each(function() {
        selectedDays.push($(this).val());
    });

    let params = {
        scheduled_task_id: scheduled_task_id,
        job_class: job_class,
        job_name: job_name,
        frequency: frequency,
        run_on_days: frequency === 'weekly' ? selectedDays.join(',') : null, // Store as comma-separated string
        run_at_time: runAtTime,
        run_on_date: frequency === 'monthly' || frequency === 'yearly' ? runOnDate : null,
        description: description,
        is_active: isActive
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
                case "job_schedule":
                    loadJobScheduleView();
                    break;
            }
        });
}


function loadJobScheduleView() {
    $.when(contentLoader.loadIndividualRecordView("views/settings/scheduled_tasks.html",
        "scheduled_tasks")).done(
            function () {
                scheduled_task.fetchScheduledTasks();
            }
        );
}