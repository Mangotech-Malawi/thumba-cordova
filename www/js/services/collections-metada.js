import { apiClient, isApiHealthy } from "./api-client.js";
import * as db from "../offline/db.js";

/**
 * Fetch action types from offline storage
 */
export async function getActionTypes() {
    console.log('Fetching action types from IndexedDB...');
    return await getOfflineActionTypes();
}

/**
 * Get action types from IndexedDB
 */
async function getOfflineActionTypes() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["action_types"], "readonly");
            const store = transaction.objectStore("action_types");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const actionTypes = event.target.result;
                console.log(`✅ Retrieved ${actionTypes.length} action types from offline storage`);
                resolve(actionTypes);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline action types:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineActionTypes:", error);
        return [];
    }
}

/**
 * Save action types to IndexedDB
 */
async function saveActionTypesToOffline(actionTypes) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["action_types"], "readwrite");
            const store = transaction.objectStore("action_types");

            store.clear();

            actionTypes.forEach(actionType => {
                store.add(actionType);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${actionTypes.length} action types to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving action types:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveActionTypesToOffline:", error);
    }
}

/**
 * Fetch default reasons from offline storage
 */
export async function getDefaultReasons() {
    console.log('Fetching default reasons from IndexedDB...');
    return await getOfflineDefaultReasons();
}

/**
 * Get default reasons from IndexedDB
 */
async function getOfflineDefaultReasons() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["default_reasons"], "readonly");
            const store = transaction.objectStore("default_reasons");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const defaultReasons = event.target.result;
                console.log(`✅ Retrieved ${defaultReasons.length} default reasons from offline storage`);
                resolve(defaultReasons);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline default reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineDefaultReasons:", error);
        return [];
    }
}

/**
 * Save default reasons to IndexedDB
 */
async function saveDefaultReasonsToOffline(reasons) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["default_reasons"], "readwrite");
            const store = transaction.objectStore("default_reasons");

            store.clear();

            reasons.forEach(reason => {
                store.add(reason);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${reasons.length} default reasons to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving default reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveDefaultReasonsToOffline:", error);
    }
}

/**
 * Fetch payment methods from offline storage
 */
export async function getPaymentMethods() {
    console.log('Fetching payment methods from IndexedDB...');
    return await getOfflinePaymentMethods();
}

/**
 * Get payment methods from IndexedDB
 */
async function getOfflinePaymentMethods() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["payment_methods"], "readonly");
            const store = transaction.objectStore("payment_methods");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const paymentMethods = event.target.result;
                console.log(`✅ Retrieved ${paymentMethods.length} payment methods from offline storage`);
                resolve(paymentMethods);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline payment methods:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflinePaymentMethods:", error);
        return [];
    }
}

/**
 * Save payment methods to IndexedDB
 */
async function savePaymentMethodsToOffline(paymentMethods) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["payment_methods"], "readwrite");
            const store = transaction.objectStore("payment_methods");

            store.clear();

            paymentMethods.forEach(method => {
                store.add(method);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${paymentMethods.length} payment methods to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving payment methods:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in savePaymentMethodsToOffline:", error);
    }
}

/**
 * Fetch not reached reasons from offline storage
 */
export async function getNotReachedReasons() {
    console.log('Fetching not reached reasons from IndexedDB...');
    return await getOfflineNotReachedReasons();
}

/**
 * Get not reached reasons from IndexedDB
 */
async function getOfflineNotReachedReasons() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["not_reached_reasons"], "readonly");
            const store = transaction.objectStore("not_reached_reasons");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const notReachedReasons = event.target.result;
                console.log(`✅ Retrieved ${notReachedReasons.length} not reached reasons from offline storage`);
                resolve(notReachedReasons);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline not reached reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineNotReachedReasons:", error);
        return [];
    }
}

/**
 * Save not reached reasons to IndexedDB
 */
async function saveNotReachedReasonsToOffline(reasons) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["not_reached_reasons"], "readwrite");
            const store = transaction.objectStore("not_reached_reasons");

            store.clear();

            reasons.forEach(reason => {
                store.add(reason);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${reasons.length} not reached reasons to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving not reached reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveNotReachedReasonsToOffline:", error);
    }
}

/**
 * Fetch next actions from offline storage
 */
export async function getNextActions() {
    console.log('Fetching next actions from IndexedDB...');
    return await getOfflineNextActions();
}

/**
 * Get next actions from IndexedDB
 */
async function getOfflineNextActions() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["next_actions"], "readonly");
            const store = transaction.objectStore("next_actions");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const nextActions = event.target.result;
                console.log(`✅ Retrieved ${nextActions.length} next actions from offline storage`);
                resolve(nextActions);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline next actions:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineNextActions:", error);
        return [];
    }
}

/**
 * Save next actions to IndexedDB
 */
async function saveNextActionsToOffline(nextActions) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["next_actions"], "readwrite");
            const store = transaction.objectStore("next_actions");

            store.clear();

            nextActions.forEach(action => {
                store.add(action);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${nextActions.length} next actions to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving next actions:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveNextActionsToOffline:", error);
    }
}

/**
 * Fetch client risk statuses from offline storage
 */
export async function getClientRiskStatuses() {
    console.log('Fetching client risk statuses from IndexedDB...');
    return await getOfflineClientRiskStatuses();
}

/**
 * Get client risk statuses from IndexedDB
 */
async function getOfflineClientRiskStatuses() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["client_risk_statuses"], "readonly");
            const store = transaction.objectStore("client_risk_statuses");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const statuses = event.target.result;
                console.log(`✅ Retrieved ${statuses.length} client risk statuses from offline storage`);
                resolve(statuses);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline client risk statuses:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineClientRiskStatuses:", error);
        return [];
    }
}

/**
 * Save client risk statuses to IndexedDB
 */
async function saveClientRiskStatusesToOffline(statuses) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["client_risk_statuses"], "readwrite");
            const store = transaction.objectStore("client_risk_statuses");

            store.clear();

            statuses.forEach(status => {
                store.add(status);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${statuses.length} client risk statuses to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving client risk statuses:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveClientRiskStatusesToOffline:", error);
    }
}

/**
 * Fetch refusal reasons from offline storage
 */
export async function getRefusalReasons() {
    console.log('Fetching refusal reasons from IndexedDB...');
    return await getOfflineRefusalReasons();
}

/**
 * Get refusal reasons from IndexedDB
 */
async function getOfflineRefusalReasons() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["refusal_reasons"], "readonly");
            const store = transaction.objectStore("refusal_reasons");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const reasons = event.target.result;
                console.log(`✅ Retrieved ${reasons.length} refusal reasons from offline storage`);
                resolve(reasons);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline refusal reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineRefusalReasons:", error);
        return [];
    }
}

/**
 * Save refusal reasons to IndexedDB
 */
async function saveRefusalReasonsToOffline(reasons) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["refusal_reasons"], "readwrite");
            const store = transaction.objectStore("refusal_reasons");

            store.clear();

            reasons.forEach(reason => {
                store.add(reason);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${reasons.length} refusal reasons to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving refusal reasons:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveRefusalReasonsToOffline:", error);
    }
}

/**
 * Fetch payment commitments from offline storage
 */
export async function getPaymentCommitments() {
    console.log('Fetching payment commitments from IndexedDB...');
    return await getOfflinePaymentCommitments();
}

/**
 * Get payment commitments from IndexedDB
 */
async function getOfflinePaymentCommitments() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["payment_commitments"], "readonly");
            const store = transaction.objectStore("payment_commitments");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const commitments = event.target.result;
                console.log(`✅ Retrieved ${commitments.length} payment commitments from offline storage`);
                resolve(commitments);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline payment commitments:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflinePaymentCommitments:", error);
        return [];
    }
}

/**
 * Save payment commitments to IndexedDB
 */
async function savePaymentCommitmentsToOffline(commitments) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["payment_commitments"], "readwrite");
            const store = transaction.objectStore("payment_commitments");

            store.clear();

            commitments.forEach(commitment => {
                store.add(commitment);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${commitments.length} payment commitments to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving payment commitments:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in savePaymentCommitmentsToOffline:", error);
    }
}

/**
 * Fetch collector assessments from offline storage
 */
export async function getCollectorAssessments() {
    console.log('Fetching collector assessments from IndexedDB...');
    return await getOfflineCollectorAssessments();
}

/**
 * Get collector assessments from IndexedDB
 */
async function getOfflineCollectorAssessments() {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["collector_assessments"], "readonly");
            const store = transaction.objectStore("collector_assessments");
            const request = store.getAll();

            request.onsuccess = (event) => {
                const assessments = event.target.result;
                console.log(`✅ Retrieved ${assessments.length} collector assessments from offline storage`);
                resolve(assessments);
            };

            request.onerror = (event) => {
                console.error("Error fetching offline collector assessments:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in getOfflineCollectorAssessments:", error);
        return [];
    }
}

/**
 * Save collector assessments to IndexedDB
 */
async function saveCollectorAssessmentsToOffline(assessments) {
    try {
        const database = db.getDB() || (await db.openDatabase());

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(["collector_assessments"], "readwrite");
            const store = transaction.objectStore("collector_assessments");

            store.clear();

            assessments.forEach(assessment => {
                store.add(assessment);
            });

            transaction.oncomplete = () => {
                console.log(`✅ Saved ${assessments.length} collector assessments to offline storage`);
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error saving collector assessments:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Error in saveCollectorAssessmentsToOffline:", error);
    }
}


