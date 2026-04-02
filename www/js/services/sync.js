import { apiClient } from "./api-client.js";
import { formatCurrency } from "../utils/formaters.js"
import * as db from "../offline/db.js";
import * as recoveryAttempts from "../offline/recovery-attempts.js";

export function sync(params) {
  return apiClient("/api/v1/offline/sync", "GET", "json", false, false, params);
}

export async function syncOfflineData(lastSyncTime) {
  try {
    const params = {
      last_sync: lastSyncTime || localStorage.getItem("last_sync") || new Date(0).toISOString()
    };

    const response = sync(params);

    if (response && response.sync_data) {
      // Process synced data
      await processSyncData(response.sync_data);

      // Update last sync time
      localStorage.setItem("last_sync", new Date().toISOString());

      return {
        success: true,
        message: "Sync completed successfully",
        data: response.sync_data
      };
    } else {
      return {
        success: false,
        message: "No sync data received"
      };
    }
  } catch (error) {
    console.error("Sync error:", error);
    return {
      success: false,
      message: "Sync failed: " + error.message
    };
  }
}

/**
 * Sync recovery attempts from offline storage to server
 * @returns {Promise<Object>} - Sync result with success status and message
 */
export async function syncRecoveryAttempts() {
  try {
    // Get all unsynced recovery attempts from IndexedDB
    const unsyncedAttempts = await recoveryAttempts.getUnsyncedRecoveryAttempts();

    if (!unsyncedAttempts || unsyncedAttempts.length === 0) {
      console.log("✅ No unsynced recovery attempts to sync");
      return {
        success: true,
        message: "No unsynced attempts",
        synced_count: 0
      };
    }

    // Filter out raw_json before sending to server
    const attemptsToSync = unsyncedAttempts.map(attempt => {
      const { raw_json, ...attemptWithoutRawJson } = attempt;
      return attemptWithoutRawJson;
    });

    console.log(`📤 Syncing ${attemptsToSync.length} recovery attempts to server...`);

    // Send POST request with array of recovery attempts (without raw_json)
    const response = await apiClient(
      "/api/v1/recovery_attempts/sync",
      "POST",
      "json",
      false,
      false,
      { attempts: attemptsToSync }
    );

    if (response.sync_data !== null && typeof response.sync_data !== undefined && response.sync_data !== "") {
      // Mark all synced attempts as synced in IndexedDB
      const syncedCount = await Promise.all(
        unsyncedAttempts.map(attempt =>
          recoveryAttempts.markRecoveryAttemptAsSynced(attempt.id)
            .catch(err => {
              console.error(`Failed to mark attempt ${attempt.id} as synced:`, err);
              return false;
            })
        )
      ).then(results => results.filter(r => r === true).length);

      console.log(`✅ Successfully synced ${syncedCount} recovery attempts`);

      return {
        success: true,
        message: `${syncedCount} recovery attempt(s) synced successfully`,
        synced_count: syncedCount,
        response: response
      };
    } else {
      console.warn("⚠️ Server returned error response:", response);
      return {
        success: false,
        message: response?.message || "Server rejected sync request",
        error: response?.error
      };
    }
  } catch (error) {
    console.error("❌ Recovery attempts sync failed:", error);
    return {
      success: false,
      message: "Sync failed: " + error.message,
      error: error
    };
  }
}

async function processSyncData(syncData) {
  try {
    // Save recovery cases
    if (syncData.recovery_cases && Array.isArray(syncData.recovery_cases)) {
      await saveRecoveryCases(syncData.recovery_cases);
    }

    // Save metadata (action types, outcomes, default reasons)
    if (syncData.metadata) {
      localStorage.setItem("sync_metadata", JSON.stringify(syncData.metadata));

      // Store all metadata in IndexedDB
      if (syncData.metadata.action_types) {
        await saveActionTypes(syncData.metadata.action_types);
      }
      if (syncData.metadata.outcomes) {
        await saveOutcomes(syncData.metadata.outcomes);
      }
      if (syncData.metadata.default_reasons) {
        await saveDefaultReasons(syncData.metadata.default_reasons);
      }
      if (syncData.metadata.payment_methods) {
        await savePaymentMethods(syncData.metadata.payment_methods);
      }
      if (syncData.metadata.not_reached_reasons) {
        await saveNotReachedReasons(syncData.metadata.not_reached_reasons);
      }
      if (syncData.metadata.next_actions) {
        await saveNextActions(syncData.metadata.next_actions);
      }
      if (syncData.metadata.client_risk_statuses) {
        await saveClientRiskStatuses(syncData.metadata.client_risk_statuses);
      }
      if (syncData.metadata.refusal_reasons) {
        await saveRefusalReasons(syncData.metadata.refusal_reasons);
      }
      if (syncData.metadata.payment_commitments) {
        await savePaymentCommitments(syncData.metadata.payment_commitments);
      }
      if (syncData.metadata.collector_assessments) {
        await saveCollectorAssessments(syncData.metadata.collector_assessments);
      }
    }

    console.log("✅ All sync data processed successfully");
  } catch (error) {
    console.error("Error processing sync data:", error);
    throw error;
  }
}

async function saveRecoveryCases(cases) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["recovery_cases"], "readwrite");
    const store = transaction.objectStore("recovery_cases");

    cases.forEach(caseData => {
      store.put(caseData);
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = (e) => reject(e.target.error);
  });
}

async function saveActionTypes(actionTypes) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["action_types"], "readwrite");
    const store = transaction.objectStore("action_types");

    // Clear existing and save new
    store.clear().onsuccess = () => {
      actionTypes.forEach(item => store.put(item));
    };

    transaction.oncomplete = () => {
      localStorage.setItem("action_types", JSON.stringify(actionTypes));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

async function saveOutcomes(outcomes) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["outcomes"], "readwrite");
    const store = transaction.objectStore("outcomes");

    // Clear existing and save new
    store.clear().onsuccess = () => {
      outcomes.forEach(item => store.put(item));
    };

    transaction.oncomplete = () => {
      localStorage.setItem("outcomes", JSON.stringify(outcomes));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}


async function saveDefaultReasons(reasons) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["default_reasons"], "readwrite");
    const store = transaction.objectStore("default_reasons");
    store.clear().onsuccess = () => {
      reasons.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("default_reasons", JSON.stringify(reasons));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save payment_methods metadata
async function savePaymentMethods(paymentMethods) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["payment_methods"], "readwrite");
    const store = transaction.objectStore("payment_methods");
    store.clear().onsuccess = () => {
      paymentMethods.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("payment_methods", JSON.stringify(paymentMethods));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save not_reached_reasons metadata
async function saveNotReachedReasons(notReachedReasons) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["not_reached_reasons"], "readwrite");
    const store = transaction.objectStore("not_reached_reasons");
    store.clear().onsuccess = () => {
      notReachedReasons.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("not_reached_reasons", JSON.stringify(notReachedReasons));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save next_actions metadata
async function saveNextActions(nextActions) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["next_actions"], "readwrite");
    const store = transaction.objectStore("next_actions");
    store.clear().onsuccess = () => {
      nextActions.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("next_actions", JSON.stringify(nextActions));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save client_risk_statuses metadata
async function saveClientRiskStatuses(clientRiskStatuses) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["client_risk_statuses"], "readwrite");
    const store = transaction.objectStore("client_risk_statuses");
    store.clear().onsuccess = () => {
      clientRiskStatuses.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("client_risk_statuses", JSON.stringify(clientRiskStatuses));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save refusal_reasons metadata
async function saveRefusalReasons(refusalReasons) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["refusal_reasons"], "readwrite");
    const store = transaction.objectStore("refusal_reasons");
    store.clear().onsuccess = () => {
      refusalReasons.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("refusal_reasons", JSON.stringify(refusalReasons));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save payment_commitments metadata
async function savePaymentCommitments(paymentCommitments) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["payment_commitments"], "readwrite");
    const store = transaction.objectStore("payment_commitments");
    store.clear().onsuccess = () => {
      paymentCommitments.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("payment_commitments", JSON.stringify(paymentCommitments));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

// Save collector_assessments metadata
async function saveCollectorAssessments(collectorAssessments) {
  const database = db.getDB() || (await db.openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["collector_assessments"], "readwrite");
    const store = transaction.objectStore("collector_assessments");
    store.clear().onsuccess = () => {
      collectorAssessments.forEach(item => store.put(item));
    };
    transaction.oncomplete = () => {
      localStorage.setItem("collector_assessments", JSON.stringify(collectorAssessments));
      resolve(true);
    };
    transaction.onerror = (e) => reject(e.target.error);
  });
}

export function getLastSyncTime() {
  return localStorage.getItem("last_sync") || "Never synced";
}
