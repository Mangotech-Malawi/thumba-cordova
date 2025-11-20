export function notify(position, icon, title, text, showButton, timer) {
    Swal.fire({
        position: position,
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: showButton,
        timer: timer
    });
}

export function toastNote(heading, text, icon) {

    $.toast({
        text: text, // Text that is to be shown in the toast
        heading: heading, // Optional heading to be shown on the toast
        icon: icon, // Type of toast icon
        showHideTransition: 'slide', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: 6000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
        position: 'bottom-right', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values

        textAlign: 'left',  // Text alignment i.e. left, right or center
        loader: false,  // Whether to show loader or not. True by default
        class: 'larger-font', // Background color of the toast loader
        beforeShow: function () { }, // will be triggered before the toast is shown
        afterShown: function () { }, // will be triggered after the toat has been shown
        beforeHide: function () { }, // will be triggered before the toast gets hidden
        afterHidden: function () { }  // will be triggered after the toast has been hidden
    });

}

export function setRecordText(dataset, titleId, record) {
    if (dataset.clientType === "individual") {
        $(`#${titleId}`).text(
            `${dataset.recordFirstname} ${dataset.recordLastname} ${record}`
        );

    } else if (dataset.clientType === "organization") {
        $(`#${titleId}`).text(
            `${dataset.orgName} ${record}`
        );
    } else if (dataset.clientType === "group"){
        $(`#${titleId}`).text(
            `${dataset.groupName} ${record}`
        );
    }
}