import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative overflow-hidden hero-gradient py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-5xl" style={{ textShadow: "var(--hero-text-shadow)" }}>
            Find Trusted Local Services Near You
          </h1>
          <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
            Electricians, plumbers, tutors, delivery &amp; more — all at your fingertips.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for services near you..."
                className="h-12 w-full rounded-xl border-0 bg-card pl-10 pr-4 text-sm text-foreground shadow-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="h-12 w-full rounded-xl border-0 bg-card pl-10 pr-4 text-sm text-foreground shadow-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 rounded-xl px-8 shadow-lg">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["Electrician", "Plumber", "Tutor", "AC Repair", "Carpenter"].map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); navigate(`/services?q=${encodeURIComponent(tag)}`); }}
                className="rounded-full bg-primary-foreground/20 px-4 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSearch;
