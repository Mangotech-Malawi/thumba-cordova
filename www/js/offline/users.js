// offline_users.js
import { openDatabase, getDB } from "./db.js";

export async function addOfflineUser(user) {
  const db = getDB() || (await openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offline_users"], "readwrite");
    const store = transaction.objectStore("offline_users");

    // Update if exists, otherwise add
    const request = store.put(user);
    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function offlineLogin(username, passwordHash) {
  const db = getDB() || (await openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offline_users"], "readonly");
    const store = transaction.objectStore("offline_users");
    const index = store.index("username");

    const request = index.get(username);
    request.onsuccess = (event) => {
      const user = event.target.result;
      if (user && user.password_hash === passwordHash) {
        resolve(user);
      } else {
        resolve(null);
      }
    };
    request.onerror = (e) => reject(e.target.error);
  });
  
}

export async function getAllUsers() {
  const db = getDB() || (await openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offline_users"], "readonly");
    const store = transaction.objectStore("offline_users");
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getOfflineUser(username) {
  const db = getDB() || (await openDatabase());
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offline_users"], "readonly");
    const store = transaction.objectStore("offline_users");
    const index = store.index("username");

    const request = index.get(username);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}