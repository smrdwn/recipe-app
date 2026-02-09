import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import type { Meal } from "../lib/api";
import { Badge } from "./ui/badge";

type MealCardProps = {
  meal: Meal;
  isFavorite: boolean;
  onToggleFavorite: (meal: Meal) => void;
};

export default function MealCard({ meal, isFavorite, onToggleFavorite }: MealCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <Button
          className="absolute right-3 top-3 h-10 w-10 p-0"
          variant="outline"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
          onClick={() => onToggleFavorite(meal)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={isFavorite ? "h-5 w-5 fill-amber-400 stroke-amber-400" : "h-5 w-5 fill-transparent"}
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
      <CardContent className="space-y-3">
        <div>
          <Link to={`/meal/${meal.idMeal}`} className="text-lg font-semibold hover:underline">
            {meal.strMeal}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-black/70">
            {meal.strCategory ? <Badge>{meal.strCategory}</Badge> : null}
            {meal.strArea ? <Badge className="bg-moss/20 text-moss">{meal.strArea}</Badge> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
