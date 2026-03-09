import * as syncService from "../services/sync.js";

$(function() {
  // Sync button click
  $(document).on('click', '#syncBtn', function() {
    startSync();
  });

  // Cancel sync
  $(document).on('click', '#syncCancelBtn', function() {
    $('#syncProgressModal').modal('hide');
  });

  // Display last sync time on page load
  displayLastSyncTime();
});

function startSync() {
  // Show modal
  $('#syncProgressModal').modal('show');
  
  updateProgress(0, "Connecting to server...");

  // Simulate progress updates
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress > 85) progress = 85;
    updateProgress(progress, "Syncing data...");
  }, 500);

  // Start both sync operations in parallel
  const lastSync = localStorage.getItem("last_sync") || new Date(0).toISOString();
  
  Promise.all([
    syncService.syncOfflineData(lastSync),
    syncService.syncRecoveryAttempts()
  ])
    .then(([offlineResult, attemptsResult]) => {
      clearInterval(progressInterval);
      
      const success = offlineResult.success && attemptsResult.success;
      
      if (success) {
        updateProgress(100, "Sync completed!");
        
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Sync Successful',
            html: `
              <p>All data synced successfully!</p>
              <p class="text-sm text-muted">
                Recovery Cases: ${offlineResult.data?.recovery_cases ? offlineResult.data.recovery_cases.length : 0}<br>
                Recovery Attempts: ${attemptsResult.synced_count || 0}<br>
                <small>Last Sync: ${new Date().toLocaleString()}</small>
              </p>
            `,
            confirmButtonText: 'OK'
          }).then(() => {
            $('#syncProgressModal').modal('hide');
            displayLastSyncTime();
          });
        }, 800);
      } else {
        const errorMessages = [];
        if (!offlineResult.success) errorMessages.push(`Offline Sync: ${offlineResult.message}`);
        if (!attemptsResult.success) errorMessages.push(`Recovery Attempts: ${attemptsResult.message}`);
        
        updateProgress(100, "Sync completed with errors");
        
        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: 'Sync Completed with Warnings',
            html: `
              ${errorMessages.map(msg => `<p class="text-sm text-muted">${msg}</p>`).join('')}
              <p class="text-sm">Some data could not be synced.</p>
            `,
            confirmButtonText: 'OK'
          }).then(() => {
            $('#syncProgressModal').modal('hide');
            displayLastSyncTime();
          });
        }, 800);
      }
    })
    .catch(error => {
      clearInterval(progressInterval);
      updateProgress(100, "Sync failed!");
      
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Sync Error',
          text: error.message || 'An unexpected error occurred',
          confirmButtonText: 'OK'
        }).then(() => {
          $('#syncProgressModal').modal('hide');
        });
      }, 800);
    });
}

function updateProgress(percent, message) {
  const progressBar = $('#syncProgressBar');
  progressBar.css('width', percent + '%');
  progressBar.attr('aria-valuenow', percent);
  $('#syncProgressText').text(Math.round(percent) + '%');
  $('#syncStatus').text(message);
}

function displayLastSyncTime() {
  const lastSync = syncService.getLastSyncTime();
  $('#lastSyncTime').text(lastSync === "Never synced" ? "Never" : new Date(lastSync).toLocaleString());
}