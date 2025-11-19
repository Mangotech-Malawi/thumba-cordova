import * as report from "../services/reports.js"

$(document).ready(function () {

    $(document).on("click", ".users-report-btn", function (e) {
        e.preventDefault();
        let documentType = $(this).data().documentType;

        if (documentType === "csv") {
            downloadCSV();
        } else {
            $.when(report.users({ document_type: documentType })).done(
                function (data) {
                    downloadPDF(data);
                }
            );
        }
    });

});

function downloadCSV() {
    let token = sessionStorage.getItem("token");

    // Send POST request to the backend
    fetch('http://127.0.0.1:3000/api/v1/report/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ document_type: "csv"})

    })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error:', error));
}


function downloadPDF(htmlContent) {
    if (htmlContent) {
        let win = window.open("", "", "");
        win.document.write(htmlContent.html)
        win.document.close();
        win.print();
    } else {
        console.error("HTML content is null or empty.")
    }
}
