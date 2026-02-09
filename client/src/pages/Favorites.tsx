import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useFavorites } from "../features/favorites/useFavorites";

export default function Favorites() {
  const { favorites, refresh } = useFavorites();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");

  const filtered = useMemo(() => {
    const list = favorites.filter((meal) =>
      meal.strMeal.toLowerCase().includes(filter.trim().toLowerCase())
    );
    return list.sort((a, b) => {
      if (sort === "name") {
        return a.strMeal.localeCompare(b.strMeal);
      }
      return (b.savedAt ?? 0) - (a.savedAt ?? 0);
    });
  }, [favorites, filter, sort]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Favorites</h1>
        <p className="mt-2 text-sm text-black/60">Saved meals stay available offline.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter favorites"
        />
        <Button variant={sort === "recent" ? "default" : "outline"} onClick={() => setSort("recent")}>
          Recent
        </Button>
        <Button variant={sort === "name" ? "default" : "outline"} onClick={() => setSort("name")}>
          Name
        </Button>
        <Button variant="ghost" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-black/60">
          No favorites yet. Start saving recipes from the home page.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-black/60">
          Nothing matches that filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((meal) => (
            <Card key={meal.idMeal} className="overflow-hidden">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="h-44 w-full object-cover" />
              <CardContent className="space-y-3">
                <div>
                  <Link to={`/meal/${meal.idMeal}`} className="text-lg font-semibold hover:underline">
                    {meal.strMeal}
                  </Link>
                  <p className="mt-2 text-xs text-black/60">
                    {meal.strCategory ?? ""} {meal.strArea ? `- ${meal.strArea}` : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const { removeFavorite } = await import("../features/favorites/db");
                    await removeFavorite(meal.idMeal);
                    await refresh();
                  }}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {favorites.length === 0 ? (
        <Skeleton className="h-16" />
      ) : null}
    </section>
  );
}
