const DB_NAME = "MicrofinanceOfflineDB";
const DB_VERSION = 3; // Incremented to add metadata stores
let db;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Existing offline_users store
      if (!db.objectStoreNames.contains("offline_users")) {
        const userStore = db.createObjectStore("offline_users", {
          keyPath: "user_id",
          autoIncrement: true
        });
        userStore.createIndex("username", "username", { unique: true });
        userStore.createIndex("role", "role", { unique: false });
        userStore.createIndex("last_sync", "last_sync", { unique: false });
      }

      // New recovery cases store
      if (!db.objectStoreNames.contains("recovery_cases")) {
        const caseStore = db.createObjectStore("recovery_cases", {
          keyPath: "id",
          autoIncrement: true
        });
        caseStore.createIndex("assigned_to_user_id", "assigned_to_user_id", { unique: false });
        caseStore.createIndex("status", "status", { unique: false });
        caseStore.createIndex("branch_id", "branch_id", { unique: false });
      }

      // Metadata stores
      if (!db.objectStoreNames.contains("action_types")) {
        db.createObjectStore("action_types", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("outcomes")) {
        db.createObjectStore("outcomes", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("default_reasons")) {
        db.createObjectStore("default_reasons", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("payment_methods")) {
        db.createObjectStore("payment_methods", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("not_reached_reasons")) {
        db.createObjectStore("not_reached_reasons", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("next_actions")) {
        db.createObjectStore("next_actions", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("client_risk_statuses")) {
        db.createObjectStore("client_risk_statuses", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("refusal_reasons")) {
        db.createObjectStore("refusal_reasons", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("payment_commitments")) {
        db.createObjectStore("payment_commitments", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("collector_assessments")) {
        db.createObjectStore("collector_assessments", { keyPath: "id" });
      }

      // Recovery attempts store
      if (!db.objectStoreNames.contains("recovery_attempts")) {
        const attemptsStore = db.createObjectStore("recovery_attempts", {
          keyPath: "id",
          autoIncrement: true
        });
        attemptsStore.createIndex("recovery_case_id", "recovery_case_id", { unique: false });
        attemptsStore.createIndex("client_id", "client_id", { unique: false });
        attemptsStore.createIndex("assigned_to_user_id", "assigned_to_user_id", { unique: false });
        attemptsStore.createIndex("created_at", "created_at", { unique: false });
        attemptsStore.createIndex("synced", "synced", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(`DB error: ${event.target.errorCode}`);
    };
  });
}

export function getDB() {
  return db;
}