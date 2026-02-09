import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import MealCard from "../components/MealCard";
import { filterByCategory, getCategories, getMealById, getRandomMeal, searchMeals, type Meal } from "../lib/api";
import { useFavorites } from "../features/favorites/useFavorites";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("c") ?? "";

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories
  });

  const resultsQuery = useQuery({
    queryKey: ["results", query, category],
    queryFn: async () => {
      if (query.trim()) {
        return searchMeals(query.trim());
      }
      if (category) {
        return filterByCategory(category);
      }
      return { meals: [] };
    },
    enabled: Boolean(query.trim() || category)
  });

  const randomQuery = useQuery({
    queryKey: ["random"],
    queryFn: getRandomMeal,
    enabled: false
  });

  const meals: Meal[] = useMemo(() => {
    if (!resultsQuery.data) {
      return [];
    }
    const list = resultsQuery.data.meals ?? [];
    return list as Meal[];
  }, [resultsQuery.data]);

  const onSelectCategory = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("c", value);
    } else {
      next.delete("c");
    }
    next.delete("q");
    setSearchParams(next);
  };

  const onToggleFavorite = async (meal: Meal) => {
    const wasFavorite = isFavorite(meal.idMeal);
    let fullMeal = meal;

    if (!meal.strInstructions) {
      try {
        const detail = await getMealById(meal.idMeal);
        const detailed = detail.meals?.[0] as Meal | undefined;
        if (detailed) {
          fullMeal = detailed;
        }
      } catch (error) {
        toast.error("Full recipe details are not cached yet.");
        return;
      }
    }

    await toggleFavorite(fullMeal);
    toast.success(wasFavorite ? "Removed from favorites" : "Saved to favorites");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Find your next meal</h1>
          <p className="mt-2 text-sm text-black/60">Search by name or browse curated categories.</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            const result = await randomQuery.refetch();
            const randomMeal = result.data?.meals?.[0] as Meal | undefined;
            if (randomMeal) {
              toast.success(`Try ${randomMeal.strMeal}`);
              setSearchParams({ q: randomMeal.strMeal });
            }
          }}
        >
          Surprise me
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categoriesQuery.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-full" />
            ))
          : categoriesQuery.data?.categories?.map((item: { strCategory: string }) => (
              <Button
                key={item.strCategory}
                variant={category === item.strCategory ? "default" : "outline"}
                aria-pressed={category === item.strCategory}
                onClick={() => onSelectCategory(item.strCategory)}
              >
                {item.strCategory}
              </Button>
            ))}
        {category ? (
          <Button variant="ghost" onClick={() => onSelectCategory("")}>
            Clear
          </Button>
        ) : null}
      </div>

      {resultsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : resultsQuery.isError ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-black/60">
          Something went wrong. Try another search.
        </div>
      ) : meals.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-black/60">
          {query || category
            ? "No recipes found. Try a different search or category."
            : "Start by searching or picking a category."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              isFavorite={isFavorite(meal.idMeal)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {favorites.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-black/60">
          <Badge>{favorites.length} saved</Badge>
          <span className="ml-2">Favorites are available offline.</span>
        </div>
      ) : null}
    </section>
  );
}
