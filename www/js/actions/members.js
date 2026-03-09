import * as client from "../services/clients.js";
import * as form from "../utils/forms.js";
import * as contentLoader from "../actions/contentLoader.js";
import { setRecordText } from "../utils/utils.js";

let currentDataset = null;
localStorage;

$(function () {

    $(document).on("click", "#btnMembers", function (e) {
        loadDependantsView();
    });

});

function loadDependantsView() {
    if (localStorage.getItem("clientDataSet") != null) {
        currentDataset = JSON.parse(localStorage.getItem("clientDataSet"));

        $.when(contentLoader.loadIndividualRecordView("views/clients/members.html", "members")).done(
            function () {

                setRecordText(currentDataset, "recordName", "Members");

                client.fetchGroupMembers({
                    group_id: currentDataset.groupId,
                });
            }
        );
    }
}