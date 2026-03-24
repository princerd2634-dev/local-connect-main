import { Link } from "react-router-dom";
import { Search, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Local<span className="text-gradient">Need</span>Finder
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Find trusted local services near you. From electricians to tutors — we connect you with the best.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["Home", "Services", "About", "Contact"].map((l) => (
              <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Categories</h4>
          <div className="flex flex-col gap-2">
            {["Electrician", "Plumber", "Tutor", "Delivery", "Carpenter"].map((c) => (
              <Link key={c} to={`/services?category=${c.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Contact</h4>
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> +91 98765 43210</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> help@localneedfinder.in</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> New Delhi, India</span>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LocalNeedFinder. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
