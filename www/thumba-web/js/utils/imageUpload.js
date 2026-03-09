
$(function () {

    $(document).on("click", "#browseBtn", function () {
        const profilePictureInput = document.getElementById("profilePictureInput");
        profilePictureInput.click();
    });

    $(document).on("change", "#profilePictureInput", function (e) {
        const profilePicture = document.getElementById("profilePicture");
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                profilePicture.src = reader.result; // Show the selected image in the preview
            };
            reader.readAsDataURL(file); // Read the file as a data URL
        }
    });

    $(document).on("click", "#takePictureBtn", function () {
        const takePictureBtn = document.getElementById("takePictureBtn");
        const cameraFeed = document.getElementById("cameraFeed");
        const cameraCanvas = document.getElementById("cameraCanvas");
        const profilePicture = document.getElementById("profilePicture");

        if (typeof cameraFeed != undefined && cameraFeed != null) {
            if (cameraFeed.style.display === "none") {
                // Show camera feed
                navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then((stream) => {
                        cameraFeed.style.display = "block";
                        cameraFeed.srcObject = stream;
                        takePictureBtn.textContent = "Capture Photo";
                    })
                    .catch((error) => {
                        alert("Unable to access camera: " + error.message);
                    });
            } else {
                // Capture image from camera feed
                const context = cameraCanvas.getContext("2d");
                cameraCanvas.width = cameraFeed.videoWidth;
                cameraCanvas.height = cameraFeed.videoHeight;
                context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);

                // Convert the captured image to a data URL
                const dataURL = cameraCanvas.toDataURL("image/png");

                // Display the captured image as profile picture
                profilePicture.src = dataURL;

                // Convert the data URL to a File object and update the profile picture input
                dataURLtoFile(dataURL, "captured_profile_picture.png");

                // Stop the camera and hide feed
                const stream = cameraFeed.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
                cameraFeed.style.display = "none";
                takePictureBtn.textContent = "Take Picture";
            }
        }

    });

});

// Function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ua = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ua[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Function to convert Blob to File and trigger file input change
function dataURLtoFile(dataURL, filename) {
    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], filename, { type: blob.type });
    const dataTransfer = new DataTransfer(); // Create a new DataTransfer object
    dataTransfer.items.add(file); // Add the file to it
    profilePictureInput.files = dataTransfer.files; // Set the input's files to this new file
}




