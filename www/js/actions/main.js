// A token will be used to access data from server
$(function () {
  // Check if branch is selected
  const token = sessionStorage.getItem("token")
  const branch_user_roles = JSON.parse(sessionStorage.getItem("branch_user_roles"));
  const branch_role_id = sessionStorage.getItem("selected_branch_id");

  if (token && !branch_role_id && branch_user_roles.length > 0) {
    window.location = "branch_selection.html";
    return;
  } else if (token && branch_role_id && branch_user_roles.length > 0) {
    $("#branch-label").removeClass("d-none");
    $("#change-branch-link").removeClass("d-none");
  } else {
    $("#branch-label").addClass("d-none");
    $("#change-branch-link").addClass("d-none");
  }

  var touchStartY;
  var touchStartTime;
  var refreshTimeout;

  $(window).on('touchstart', function (event) {
    touchStartY = event.originalEvent.touches[0].clientY;
    touchStartTime = Date.now();
  });

  $("#lbl-username").text(sessionStorage.getItem("username"));
  $("#account-name").text(` ${sessionStorage.getItem("account_name")}`);

  // Display selected branch if available
  if (sessionStorage.getItem("selected_branch_name")) {
    $("#selected-branch").text(sessionStorage.getItem("selected_branch_name"));
  }


  $(window).on('touchmove', { passive: false }, function (event) {
    var touchCurrentY = event.originalEvent.touches[0].clientY;
    var scrollPosition = $(window).scrollTop();

    // Check if a modal is open
    var isModalOpen = $('.modal.show').length > 0;

    if (touchCurrentY > touchStartY && scrollPosition === 0 && !isModalOpen) {
      clearTimeout(refreshTimeout); // Clear any existing timeout

      var touchDuration = Date.now() - touchStartTime;
      var minimumTouchDuration = 600; // Minimum touch duration in milliseconds

      if (touchDuration >= minimumTouchDuration) {
        event.preventDefault();
        location.reload(); // Refresh the page
      }
    }
  });

  $(document).on("click", "tr", function (e) {
    $(this).toggleClass("active");
  });

  $(document).on("click", "#logout-link", function (e) {
    sessionStorage.clear();
    localStorage.clear();

    window.location = "index.html";
  });

  $(document).on("click", "#stopped", function () {
    if (this.checked)
      $("#reasonForStoppingRow").removeClass("d-none").slideDown();
    else $("#reasonForStoppingRow").addClass("d-none").slideUp();
  });

  // Use delegated input event for money-input fields to handle dynamic elements
  $(document).on('input', '.money-input', function () {
    let input = $(this);
    let value = input.val();
    let cursorPos = this.selectionStart;
    let commasBefore = (value.slice(0, cursorPos).match(/,/g) || []).length;
    let raw = value.replace(/,/g, '');
    // Remove all except digits and dot
    raw = raw.replace(/[^\d.]/g, '');
    // Only keep first dot
    let dotIndex = raw.indexOf('.');
    let integerPart = raw;
    let decimalPart = '';
    if (dotIndex !== -1) {
      integerPart = raw.slice(0, dotIndex);
      decimalPart = raw.slice(dotIndex + 1);
      // Remove any additional dots from decimal part
      decimalPart = decimalPart.replace(/\./g, '');
    }
    let formattedInt = integerPart ? new Intl.NumberFormat().format(integerPart) : '';
    // Limit decimal part to 2 digits
    if (decimalPart.length > 2) decimalPart = decimalPart.slice(0, 2);
    let formatted = dotIndex !== -1 ? formattedInt + '.' + decimalPart : formattedInt;
    input.val(formatted);
    let newValue = input.val();
    let commasAfter = (newValue.slice(0, cursorPos).match(/,/g) || []).length;
    let newCursorPos = cursorPos + (commasAfter - commasBefore);
    this.setSelectionRange(newCursorPos, newCursorPos);
  });


});




$(document).on({
  /* ajaxStart: function () {
     $("body").addClass("loading");
   },
   ajaxStop: function () {
     $("body").removeClass("loading");
   },*/
});
