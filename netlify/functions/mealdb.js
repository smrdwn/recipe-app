const API_BASE = process.env.MEALDB_API_BASE ?? "https://www.themealdb.com/api/json/v1";
const API_KEY = process.env.MEALDB_API_KEY ?? "1";

const CATEGORY_TTL_MS = 1000 * 60 * 60;
let categoryCache = null;

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMealdb(endpoint, query) {
  const queryString = query.toString();
  const url = `${API_BASE}/${API_KEY}/${endpoint}${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`MealDB error: ${response.status}`);
  }

  return response.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const path = event.path.replace(/^\/api\//, "");
  const queryParams = event.queryStringParameters || {};

  try {
    if (path === "search") {
      const query = new URLSearchParams({ s: String(queryParams.query ?? "") });
      const payload = await fetchMealdb("search.php", query);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60"
        },
        body: JSON.stringify(payload)
      };
    }

    if (path.startsWith("meal/")) {
      const id = path.replace("meal/", "");
      const query = new URLSearchParams({ i: id });
      const payload = await fetchMealdb("lookup.php", query);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        },
        body: JSON.stringify(payload)
      };
    }

    if (path === "categories") {
      if (categoryCache && categoryCache.expiresAt > Date.now()) {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600"
          },
          body: JSON.stringify(categoryCache.payload)
        };
      }

      const payload = await fetchMealdb("categories.php", new URLSearchParams());
      categoryCache = { expiresAt: Date.now() + CATEGORY_TTL_MS, payload };
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600"
        },
        body: JSON.stringify(payload)
      };
    }

    if (path === "filter") {
      const category = String(queryParams.category ?? "");
      if (!category) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "category query is required" })
        };
      }

      const query = new URLSearchParams({ c: category });
      const payload = await fetchMealdb("filter.php", query);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600"
        },
        body: JSON.stringify(payload)
      };
    }

    if (path === "random") {
      const payload = await fetchMealdb("random.php", new URLSearchParams());
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        },
        body: JSON.stringify(payload)
      };
    }

    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Not found", path })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
