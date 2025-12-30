import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import * as scheduled_task from "../services/scheduled_tasks.js"

$(function () {

    $(document).on("click", "#btnScheduledTasks", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/forms/scheduled_tasks.html",
            "scheduled_tasks")).done(
                function () {

                }
            );
    });


    $(document).on("click", "#scheduledTasksBackBtn", function (e) {
        $.when(contentLoader.loadIndividualRecordView("views/settings/scheduled_tasks.html", "scheduled_tasks")).done(
            function () {
               scheduled_task.fetchScheduledTasks();
            }
        );
    });

});