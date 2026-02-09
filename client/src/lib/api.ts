const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string | null;
  strYoutube?: string;
  savedAt?: number;
  [key: string]: string | null | undefined;
};

export type Category = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

async function fetchJson(path: string) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

export async function searchMeals(query: string) {
  return fetchJson(`/search?query=${encodeURIComponent(query)}`);
}

export async function getMealById(id: string) {
  return fetchJson(`/meal/${encodeURIComponent(id)}`);
}

export async function getCategories() {
  return fetchJson("/categories");
}

export async function filterByCategory(category: string) {
  return fetchJson(`/filter?category=${encodeURIComponent(category)}`);
}

export async function getRandomMeal() {
  return fetchJson("/random");
}
