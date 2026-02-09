import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meal } from "../../lib/api";
import { getAllFavorites, getFavorite, removeFavorite, saveFavorite } from "./db";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Meal[]>([]);

  const refresh = useCallback(async () => {
    const all = await getAllFavorites();
    setFavorites(all as Meal[]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const favoriteIds = useMemo(() => new Set(favorites.map((meal) => meal.idMeal)), [favorites]);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(async (meal: Meal) => {
    const existing = await getFavorite(meal.idMeal);
    if (existing) {
      await removeFavorite(meal.idMeal);
    } else {
      await saveFavorite(meal);
    }
    await refresh();
  }, [refresh]);

  return { favorites, refresh, isFavorite, toggleFavorite };
}
