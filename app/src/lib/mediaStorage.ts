// Native IndexedDB helper for storing uploaded user images & videos
const DB_NAME = "LoveLandingMediaDB";
const STORE_NAME = "media_overrides";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB not available");
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaOverride(
  key: string,
  dataUrl: string,
  type: "image" | "video"
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ dataUrl, type, updatedAt: Date.now() }, key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to save media override to IndexedDB:", err);
  }
}

export async function loadAllMediaOverrides(): Promise<
  Record<string, { src: string; type: "image" | "video" }>
> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      const result: Record<string, { src: string; type: "image" | "video" }> = {};
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          result[cursor.key as string] = {
            src: cursor.value.dataUrl,
            type: cursor.value.type,
          };
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to load media overrides from IndexedDB:", err);
    return {};
  }
}

export async function removeMediaOverride(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to remove media override from IndexedDB:", err);
  }
}
