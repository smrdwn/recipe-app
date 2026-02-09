import { BrowserRouter, NavLink, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Home from "./pages/Home";
import Details from "./pages/Details";
import Favorites from "./pages/Favorites";
import ThemeToggle from "./components/ThemeToggle";
import SkipLink from "./components/SkipLink";
import ErrorBoundary from "./components/ErrorBoundary";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

function Header() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (query.trim()) {
      next.set("q", query.trim());
    } else {
      next.delete("q");
    }
    next.delete("c");
    navigate({ pathname: "/", search: next.toString() });
  };

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="font-display text-2xl text-berry">
            Recipe Radar
          </NavLink>
          <nav className="ml-6 hidden items-center gap-4 text-sm font-medium md:flex">
            <NavLink to="/favorites">Favorites</NavLink>
          </nav>
        </div>
        <form onSubmit={onSubmit} className="flex w-full flex-1 gap-2 md:max-w-lg">
          <label className="sr-only" htmlFor="header-search">
            Search recipes
          </label>
          <Input
            id="header-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recipes"
          />
          <Button type="submit" variant="default">
            Search
          </Button>
        </form>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <nav className="flex items-center gap-4 text-sm font-medium md:hidden">
            <NavLink to="/favorites">Favorites</NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function OfflineWatcher() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const status = useMemo(() => (isOnline ? "online" : "offline"), [isOnline]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (status === "offline") {
      toast.warning("You're offline. Viewing cached data and favorites.");
    } else {
      toast.success("You're back online.");
    }
  }, [status]);

  return null;
}

function AppShell() {
  return (
    <div className="min-h-screen text-ink">
      <SkipLink />
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meal/:id" element={<Details />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OfflineWatcher />
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
