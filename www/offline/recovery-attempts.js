// recovery-attempts.js - Handle offline storage of recovery case attempts
import { openDatabase, getDB } from "./db.js";

/**
 * Save a recovery attempt to offline storage
 * @param {Object} recoveryJSON - The recovery case JSON from buildRecoveryJSON()
 * @returns {Promise<number>} - The ID of the stored recovery attempt
 */
export async function saveRecoveryAttemptOffline(recoveryJSON) {
  const db = getDB() || (await openDatabase());

  const attempt = {
    recovery_case_id: recoveryJSON.recovery_case_id,
    client_id: recoveryJSON.client_id,
    assigned_to_user_id: parseInt(sessionStorage.getItem("user_id") || 0),
    
    // Step 1: Action Type & Client Outreach
    action_type: recoveryJSON.step1?.action_type,
    action_type_text: recoveryJSON.step1?.action_type_text,
    client_reached: recoveryJSON.step1?.client_reached,

    // Step 2: Not Reached (conditional)
    not_reached_reason: recoveryJSON.step2_not_reached?.reason,
    not_reached_reason_text: recoveryJSON.step2_not_reached?.reason_text,
    not_reached_other_reason: recoveryJSON.step2_not_reached?.other_reason,
    next_step_planned: recoveryJSON.step2_not_reached?.next_step_planned,
    notes_client_not_reached: recoveryJSON.step2_not_reached?.notes,

    // Step 3: Default Reason
    default_reason: recoveryJSON.step3_default_reason?.reason,
    default_reason_text: recoveryJSON.step3_default_reason?.reason_text,
    default_reason_other: recoveryJSON.step3_default_reason?.other_reason,

    // Step 4: Willingness to Pay
    willing_to_pay: recoveryJSON.step4_willingness?.willing_to_pay,

    // Step 5: Payment Commitment (conditional)
    payment_when: recoveryJSON.step5_commitment?.payment_when,
    payment_when_text: recoveryJSON.step5_commitment?.payment_when_text,
    custom_payment_date: recoveryJSON.step5_commitment?.custom_date,
    amount_promised: recoveryJSON.step5_commitment?.amount_promised,

    // Step 6: Refusal Reason (conditional)
    refusal_reason: recoveryJSON.step6_refusal?.refusal_reason,
    refusal_reason_text: recoveryJSON.step6_refusal?.refusal_reason_text,
    refusal_other_reason: recoveryJSON.step6_refusal?.refusal_other,

    // Step 7: Collector Assessment
    collector_assessment: recoveryJSON.step7_assessment?.collector_assessment,
    collector_assessment_text: recoveryJSON.step7_assessment?.collector_assessment_text,

    // Step 8: Payment Details (conditional)
    payment_made: recoveryJSON.step8_payment?.payment_made,
    amount_paid: recoveryJSON.step8_payment?.amount_paid,
    payment_method: recoveryJSON.step8_payment?.payment_method,
    payment_method_text: recoveryJSON.step8_payment?.payment_method_text,

    // Step 9: Risk Status
    client_risk_status: recoveryJSON.step9_risk?.risk_status,
    client_risk_status_text: recoveryJSON.step9_risk?.risk_status_text,

    // Step 10: Next Action & Notes
    next_action: recoveryJSON.step10_next?.next_action,
    next_action_text: recoveryJSON.step10_next?.next_action_text,
    general_notes: recoveryJSON.step10_next?.notes,

    // Metadata
    created_at: new Date().toISOString(),
    synced: false,
    raw_json: recoveryJSON // Store full JSON for reference
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readwrite");
    const store = transaction.objectStore("recovery_attempts");
    const request = store.add(attempt);

    request.onsuccess = () => {
      console.log(`✅ Recovery attempt saved offline with ID: ${request.result}`);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Error saving recovery attempt:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Helper function to get a metadata value by ID from a store
 */
async function getMetadataValueById(storeName, id) {
  if (!id) return null;
  
  const db = getDB() || (await openDatabase());

  return new Promise((resolve) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(parseInt(id));

    request.onsuccess = (event) => {
      const result = event.target.result;
      // Return the code or name field depending on what's available
      resolve(result ? (result.code || result.name || null) : null);
    };

    request.onerror = () => {
      resolve(null);
    };
  });
}

/**
 * Get all offline recovery attempts for a specific recovery case with metadata enrichment
 * @param {number} recoveryCaseId - The recovery case ID
 * @returns {Promise<Array>} - Array of recovery attempts with metadata text values
 */
export async function getRecoveryAttemptsByCaseId(recoveryCaseId) {
  const db = getDB() || (await openDatabase());

  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readonly");
    const store = transaction.objectStore("recovery_attempts");
    const index = store.index("recovery_case_id");

    const request = index.getAll(recoveryCaseId);

    request.onsuccess = async (event) => {
      let attempts = event.target.result;
      console.log(`✅ Retrieved ${attempts.length} recovery attempts for case ${recoveryCaseId}`);
      
      // Enrich attempts with metadata text values
      const enrichedAttempts = await Promise.all(attempts.map(async (attempt) => {
        return {
          ...attempt,
          // Add text values by looking up from metadata stores
          action_type_code: await getMetadataValueById("action_types", attempt.action_type),
          not_reached_reason_code: await getMetadataValueById("not_reached_reasons", attempt.not_reached_reason),
          default_reason_code: await getMetadataValueById("default_reasons", attempt.default_reason),
          payment_when_code: await getMetadataValueById("payment_commitments", attempt.payment_when),
          refusal_reason_code: await getMetadataValueById("refusal_reasons", attempt.refusal_reason),
          collector_assessment_code: await getMetadataValueById("collector_assessments", attempt.collector_assessment),
          payment_method_name: await getMetadataValueById("payment_methods", attempt.payment_method),
          client_risk_status_code: await getMetadataValueById("client_risk_statuses", attempt.client_risk_status),
          next_action_code: await getMetadataValueById("next_actions", attempt.next_action)
        };
      }));
      
      resolve(enrichedAttempts);
    };

    request.onerror = (event) => {
      console.error("Error fetching recovery attempts by case ID:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get all unsynced recovery attempts (for syncing to server)
 * @returns {Promise<Array>} - Array of unsynced recovery attempts
 */
export async function getUnsyncedRecoveryAttempts() {
  const db = getDB() || (await openDatabase());

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readonly");
    const store = transaction.objectStore("recovery_attempts");
    const request = store.getAll();

    request.onsuccess = (event) => {
      const allAttempts = event.target.result;
      // Filter unsynced attempts in JavaScript since boolean index queries can fail
      const unsyncedAttempts = allAttempts.filter(attempt => attempt.synced === false);
      console.log(`✅ Retrieved ${unsyncedAttempts.length} unsynced recovery attempts`);
      resolve(unsyncedAttempts);
    };

    request.onerror = (event) => {
      console.error("Error fetching unsynced recovery attempts:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Mark a recovery attempt as synced
 * @param {number} attemptId - The recovery attempt ID
 * @returns {Promise<boolean>} - Success status
 */
export async function markRecoveryAttemptAsSynced(attemptId) {
  const db = getDB() || (await openDatabase());

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readwrite");
    const store = transaction.objectStore("recovery_attempts");
    const request = store.get(attemptId);

    request.onsuccess = (event) => {
      const attempt = event.target.result;
      if (attempt) {
        attempt.synced = true;
        attempt.synced_at = new Date().toISOString();

        const updateRequest = store.put(attempt);
        updateRequest.onsuccess = () => {
          console.log(`Recovery attempt ${attemptId} marked as synced`);
          resolve(true);
        };
        updateRequest.onerror = (e) => reject(e.target.error);
      } else {
        reject(new Error(`Recovery attempt ${attemptId} not found`));
      }
    };

    request.onerror = (event) => {
      console.error("Error marking recovery attempt as synced:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Delete a recovery attempt
 * @param {number} attemptId - The recovery attempt ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteRecoveryAttempt(attemptId) {
  const db = getDB() || (await openDatabase());

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readwrite");
    const store = transaction.objectStore("recovery_attempts");
    const request = store.delete(attemptId);

    request.onsuccess = () => {
      console.log(`✅ Recovery attempt ${attemptId} deleted`);
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Error deleting recovery attempt:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Get all recovery attempts for the current user
 * @returns {Promise<Array>} - Array of recovery attempts
 */
export async function getCurrentUserRecoveryAttempts() {
  const db = getDB() || (await openDatabase());
  const userId = parseInt(sessionStorage.getItem("user_id") || 0);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recovery_attempts"], "readonly");
    const store = transaction.objectStore("recovery_attempts");
    const index = store.index("assigned_to_user_id");

    const request = index.getAll(userId);

    request.onsuccess = (event) => {
      const attempts = event.target.result;
      console.log(`✅ Retrieved ${attempts.length} recovery attempts for current user`);
      resolve(attempts);
    };

    request.onerror = (event) => {
      console.error("Error fetching current user recovery attempts:", event.target.error);
      reject(event.target.error);
    };
  });
}
