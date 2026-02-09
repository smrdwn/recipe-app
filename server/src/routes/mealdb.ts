import { Router } from "express";

const router = Router();

const API_BASE = process.env.MEALDB_API_BASE ?? "https://www.themealdb.com/api/json/v1";
const API_KEY = process.env.MEALDB_API_KEY ?? "1";

const CATEGORY_TTL_MS = 1000 * 60 * 60;
let categoryCache: { expiresAt: number; payload: unknown } | null = null;

async function fetchWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMealdb(endpoint: string, query: URLSearchParams) {
  const url = `${API_BASE}/${API_KEY}/${endpoint}?${query.toString()}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`MealDB error: ${response.status}`);
  }

  return response.json();
}

router.get("/search", async (req, res, next) => {
  try {
    const query = new URLSearchParams({ s: String(req.query.query ?? "") });
    const payload = await fetchMealdb("search.php", query);
    res.set("Cache-Control", "public, max-age=60");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/meal/:id", async (req, res, next) => {
  try {
    const query = new URLSearchParams({ i: req.params.id });
    const payload = await fetchMealdb("lookup.php", query);
    res.set("Cache-Control", "public, max-age=300");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/categories", async (_req, res, next) => {
  try {
    if (categoryCache && categoryCache.expiresAt > Date.now()) {
      res.set("Cache-Control", "public, max-age=3600");
      return res.json(categoryCache.payload);
    }

    const payload = await fetchMealdb("categories.php", new URLSearchParams());
    categoryCache = { expiresAt: Date.now() + CATEGORY_TTL_MS, payload };
    res.set("Cache-Control", "public, max-age=3600");
    return res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/filter", async (req, res, next) => {
  try {
    const category = String(req.query.category ?? "");
    if (!category) {
      return res.status(400).json({ error: "category query is required" });
    }

    const query = new URLSearchParams({ c: category });
    const payload = await fetchMealdb("filter.php", query);
    res.set("Cache-Control", "public, max-age=600");
    return res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (_req, res, next) => {
  try {
    const payload = await fetchMealdb("random.php", new URLSearchParams());
    res.set("Cache-Control", "no-store");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
