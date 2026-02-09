import { openDB } from "idb";
import type { Meal } from "../../lib/api";

const DB_NAME = "recipe-radar";
const STORE_NAME = "favorites";
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "idMeal" });
    }
  }
});

export async function saveFavorite(meal: Meal) {
  const db = await dbPromise;
  await db.put(STORE_NAME, { ...meal, savedAt: Date.now() });
}

export async function removeFavorite(idMeal: string) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, idMeal);
}

export async function getFavorite(idMeal: string) {
  const db = await dbPromise;
  return db.get(STORE_NAME, idMeal);
}

export async function getAllFavorites() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}
