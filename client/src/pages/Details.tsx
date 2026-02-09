import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import { getMealById, type Meal } from "../lib/api";
import { useFavorites } from "../features/favorites/useFavorites";

export default function Details() {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const mealQuery = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id ?? ""),
    enabled: Boolean(id)
  });

  const meal = (mealQuery.data?.meals?.[0] as Meal | undefined) ?? undefined;

  const ingredients = useMemo(() => {
    if (!meal) {
      return [];
    }
    return Array.from({ length: 20 }).reduce<string[]>((acc, _, index) => {
      const ingredient = meal[`strIngredient${index + 1}`];
      const measure = meal[`strMeasure${index + 1}`];
      if (ingredient) {
        acc.push(`${measure ?? ""} ${ingredient}`.trim());
      }
      return acc;
    }, []);
  }, [meal]);

  if (mealQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (mealQuery.isError || !meal) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-black/60">
        Meal not found. Try another one.
      </div>
    );
  }

  const tagList = meal.strTags?.split(",").filter(Boolean) ?? [];

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden">
        <img src={meal.strMealThumb} alt={meal.strMeal} className="h-72 w-full object-cover" />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{meal.strMeal}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {meal.strCategory ? <Badge>{meal.strCategory}</Badge> : null}
            {meal.strArea ? <Badge className="bg-moss/20 text-moss">{meal.strArea}</Badge> : null}
          </div>
        </div>
        <Button
          variant="outline"
          className="h-12 w-12 p-0"
          aria-pressed={isFavorite(meal.idMeal)}
          aria-label={isFavorite(meal.idMeal) ? "Remove from favorites" : "Save to favorites"}
          onClick={async () => {
            const wasFavorite = isFavorite(meal.idMeal);
            await toggleFavorite(meal);
            toast.success(wasFavorite ? "Removed from favorites" : "Saved to favorites");
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={
              isFavorite(meal.idMeal)
                ? "h-6 w-6 fill-amber-400 stroke-amber-400"
                : "h-6 w-6 fill-transparent"
            }
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.6 6.6 20.3l1-6.1-4.4-4.3 6.1-.9L12 3.5z" />
          </svg>
        </Button>
      </div>

      {tagList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tagList.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <p className="mt-4 whitespace-pre-line text-sm text-black/70">{meal.strInstructions}</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <ul className="mt-4 space-y-2 text-sm text-black/70">
            {ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {meal.strYoutube ? (
          <Button asChild variant="outline">
            <a href={meal.strYoutube} target="_blank" rel="noreferrer">
              Watch on YouTube
            </a>
          </Button>
        ) : null}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">Quick ingredients</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ingredients list</DialogTitle>
              <DialogDescription>Perfect for shopping.</DialogDescription>
            </DialogHeader>
            <ul className="space-y-2 text-sm text-black/70">
              {ingredients.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
