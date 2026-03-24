import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import CategoryGrid from "@/components/CategoryGrid";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockServices } from "@/data/mockServices";
import { motion } from "framer-motion";
import { Shield, Clock, ThumbsUp } from "lucide-react";

const features = [
  { icon: Shield, title: "Verified Providers", desc: "All service providers are background-verified for your safety." },
  { icon: Clock, title: "Quick Response", desc: "Get connected within minutes. No long waits." },
  { icon: ThumbsUp, title: "Satisfaction Guaranteed", desc: "Rated by real customers. Only the best providers listed." },
];

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <HeroSearch />
    <CategoryGrid />

    {/* Featured Services */}
    <section className="bg-secondary/50 py-16">
      <div className="container">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Featured Services</h2>
            <p className="mt-1 text-muted-foreground">Top-rated professionals in your area</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/services">View All</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockServices.slice(0, 3).map((s) => (
            <ServiceCard key={s.name} {...s} />
          ))}
        </div>
      </div>
    </section>

    {/* Why Choose Us */}
    <section className="py-16">
      <div className="container">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl">Why Choose LocalNeedFinder?</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-card p-6 text-center card-elevated"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
                <f.icon className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="hero-gradient py-16">
      <div className="container text-center">
        <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">Are You a Service Provider?</h2>
        <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
          Join thousands of professionals growing their business with LocalNeedFinder. Get discovered by customers near you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Register as Provider</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/services">Find Services</Link>
          </Button>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Index;
