import { apiClient } from "../services/api-client.js";

// Global variables
let allBranches = [];
let visibleBranchCount = 3; // Initially show only 3 branches

$(function () {
  // Display user name
  const userName = sessionStorage.getItem("username");
  $("#userName").text(userName);

  // Load branches
  loadBranches();

  // Handle branch selection via card click
  $(document).on("click", ".branch-card", function (e) {
    // Don't trigger if clicking the select button (it has its own handler)
    if ($(e.target).hasClass('select-branch-btn') || $(e.target).closest('.select-branch-btn').length) {
      return;
    }

    selectBranch($(this));
  });

  // Handle branch selection via select button
  $(document).on("click", ".select-branch-btn", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const card = $(this).closest('.branch-card');
    selectBranch(card);
  });

  // Handle branch search
  $("#branchSearch").on("keyup", function () {
    filterBranches($(this).val().toLowerCase());
  });

  // Handle clear search button
  $("#clearSearch").on("click", function () {
    $("#branchSearch").val("").focus();
    filterBranches("");
  });

  // Handle show more button
  $("#showMoreBtn").on("click", function () {
    visibleBranchCount = allBranches.length; // Show all branches
    filterBranches($("#branchSearch").val().toLowerCase());
    $(this).parent().hide(); // Hide the show more button
  });

  // Function to handle branch selection
  function selectBranch(cardElement) {
    // Remove selected class from all cards
    $(".branch-card").removeClass("selected");

    // Add selected class to clicked card
    cardElement.addClass("selected");

    // Enable continue button
    $("#continueBtn").prop("disabled", false);

    // Store selected branch data
    const branchId = cardElement.data("branch-id");
    const branchName = cardElement.data("branch-name");
    const branchCode = cardElement.data("branch-code");
    const branchType = cardElement.data("branch-type");

    // Store in sessionStorage
    sessionStorage.setItem("selected_branch_id", branchId);
    sessionStorage.setItem("selected_branch_name", branchName);
    sessionStorage.setItem("selected_branch_code", branchCode);
    sessionStorage.setItem("selected_branch_type", branchType);

    // Show toast notification
    toastr.success(`Selected branch: ${branchName}`, 'Branch Selected', { timeOut: 2000 });
  }

  // Handle continue button click
  $("#continueBtn").on("click", function () {
    if (sessionStorage.getItem("selected_branch_id")) {
      // Show loading overlay
      $("body").addClass("loading");

      // Redirect to main application
      window.location = "thumba.html";
    } else {
      // Show error if no branch is selected
      toastr.error("Please select a branch to continue", "Error", { timeOut: 3000 });
    }
  });

  // Handle logout button click
  $("#logoutBtn").on("click", function () {
    Swal.fire({
      title: 'Logout Confirmation',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear session storage
        sessionStorage.clear();
        localStorage.clear();

        // Redirect to login page
        window.location = "index.html";
      }
    });
  });

});

// Function to load branches from API
function loadBranches() {
  // Show loading state
  $("body").addClass("loading");

  // Use dummy data instead of API call for testing
  setTimeout(function () {
    const branches = sessionStorage.getItem("branch_user_roles");

    // Store all branches globally
    if (branches && branches.length > 0) {
      allBranches = JSON.parse(branches);

      // Update branch count
      $("#branchCount").text(allBranches.length);

      if (allBranches && allBranches.length > 0) {
        // Filter branches (this will apply the initial limit)
        filterBranches("");

        // Show "Show More" button if there are more branches than the initial limit
        if (allBranches.length > visibleBranchCount) {
          $("#showMoreContainer").show();
        }
      } else {
        displayNoBranchesMessage();
      }

      // Hide loading state
      $("body").removeClass("loading");
    }
  }, 1000); // Simulate network delay

}

// Function to filter branches based on search term
function filterBranches(searchTerm) {
  // Filter branches based on search term
  const filteredBranches = allBranches.filter(branch_role => {
    return branch_role.branch.name.toLowerCase().includes(searchTerm) ||
      branch_role.branch.branch_code.toLowerCase().includes(searchTerm) ||
      branch_role.branch.branch_type.toLowerCase().includes(searchTerm) ||
      (branch_role.branch.location && branch_role.branch.location.toLowerCase().includes(searchTerm));
  });

  // Limit the number of branches to display if not searching
  const branchesToDisplay = searchTerm ?
    filteredBranches : // Show all filtered branches when searching
    filteredBranches.slice(0, visibleBranchCount); // Limit when not searching

  // Update visible branch count
  $("#visibleBranchCount").text(branchesToDisplay.length);

  // Display branches
  displayBranches(branchesToDisplay);

  // Show/hide "Show More" button based on search and visible count
  if (searchTerm || filteredBranches.length <= visibleBranchCount) {
    $("#showMoreContainer").hide();
  } else if (filteredBranches.length > visibleBranchCount) {
    $("#showMoreContainer").show();
  }
}

// Function to display branches as cards
function displayBranches(branches_roles) {

  $("#branchesContainer").empty();

  if (branches_roles.length === 0) {
    $("#branchesContainer").html(`
      <div class="col-12 text-center py-4">
        <i class="fas fa-search text-muted" style="font-size: 2rem;"></i>
        <h5 class="mt-3">No branches found</h5>
        <p>Try a different search term or clear the search.</p>
      </div>
    `);
    return;
  }


  branches_roles.forEach(function (branch_role) {
    const branchIcon = getBranchIcon(branch_role.branch.branch_type);
    const branchCard = `
      <div class="col-md-4 col-sm-6 mb-4">
        <div class="card branch-card text-center h-100"
             data-branch-id="${branch_role.branch.id || branch_role.branch.id}"
             data-branch-name="${branch_role.branch.name}"
             data-branch-code="${branch_role.branch.branch_code}"
             data-branch-type="${branch_role.branch.branch_type}">
          <div class="card-header bg-light py-2">
            <span class="badge badge-info">${capitalizeFirstLetter(branch_role.branch.branch_type)}</span>
          </div>
          <div class="card-body py-3">
            <i class="${branchIcon} branch-icon text-primary"></i>
            <h5 class="card-title mb-1">${branch_role.branch.name}</h5>
            <p class="card-text text-muted mb-1"><small>${branch_role.branch.branch_code}</small></p>
            ${branch_role.branch.location ? `<p class="card-text mb-0"><small><i class="fas fa-map-marker-alt mr-1"></i>${branch_role.branch.location}</small></p>` : ''}
          </div>
         
        </div>
      </div>
    `;

    $("#branchesContainer").append(branchCard);
  });
}

function displayNoBranchesMessage() {
  $("#branchesContainer").html(`
    <div class="col-12 text-center py-5">
      <i class="fas fa-exclamation-circle text-warning" style="font-size: 3rem;"></i>
      <h5 class="mt-3">No branches available</h5>
      <p>You don't have access to any branches. Please contact your administrator.</p>
    </div>
  `);
}

function getBranchIcon(branchType) {
  switch (branchType?.toLowerCase()) {
    case 'main':
      return 'fas fa-building';
    case 'satellite':
      return 'fas fa-broadcast-tower';
    case 'mobile':
      return 'fas fa-truck';
    case 'agency':
      return 'fas fa-store';
    case 'online':
      return 'fas fa-globe';
    default:
      return 'fas fa-building';
  }
}

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
