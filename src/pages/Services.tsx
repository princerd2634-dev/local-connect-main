import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { supabase } from "@/integrations/supabase/client";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

const allCategories = ["All", "Electrician", "Plumber", "Tutor", "Delivery", "Painter", "Carpenter", "Salon", "Security"];

type Service = Tables<"services">;

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "All";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat.charAt(0).toUpperCase() + initialCat.slice(1));
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("services").select("*").eq("is_active", true).order("created_at", { ascending: false });
      setServices(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()) || (s.description || "").toLowerCase().includes(query.toLowerCase());
      const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
      const matchesLoc = !location || (s.location || "").toLowerCase().includes(location.toLowerCase());
      return matchesQ && matchesCat && matchesLoc;
    });
  }, [query, selectedCategory, location, services]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-foreground">Find Services</h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services..."
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" className="sm:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container flex-1 py-8">
        <div className={`mb-6 flex-wrap gap-2 ${showFilters ? "flex" : "hidden sm:flex"}`}>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><p className="text-muted-foreground">Loading services...</p></div>
        ) : filtered.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{filtered.length} service{filtered.length > 1 ? "s" : ""} found</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <Link key={s.id} to={`/services/${s.id}`}>
                  <ServiceCard
                    name={s.name}
                    category={s.category}
                    rating={0}
                    reviews={0}
                    location={s.location || ""}
                    description={s.description || ""}
                    price={s.price || ""}
                    phone={s.phone || ""}
                    image={s.image_url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop"}
                  />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No services found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Services;
