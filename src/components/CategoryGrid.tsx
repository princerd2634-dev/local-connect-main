import { Zap, Wrench, BookOpen, Truck, Paintbrush, Hammer, Scissors, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { name: "Electrician", icon: Zap, color: "bg-amber-100 text-amber-600" },
  { name: "Plumber", icon: Wrench, color: "bg-blue-100 text-blue-600" },
  { name: "Tutor", icon: BookOpen, color: "bg-green-100 text-green-600" },
  { name: "Delivery", icon: Truck, color: "bg-purple-100 text-purple-600" },
  { name: "Painter", icon: Paintbrush, color: "bg-rose-100 text-rose-600" },
  { name: "Carpenter", icon: Hammer, color: "bg-orange-100 text-orange-600" },
  { name: "Salon", icon: Scissors, color: "bg-pink-100 text-pink-600" },
  { name: "Security", icon: ShieldCheck, color: "bg-slate-100 text-slate-600" },
];

const CategoryGrid = () => (
  <section className="py-16">
    <div className="container">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Browse by Category</h2>
        <p className="mt-2 text-muted-foreground">Find the right professional for every need</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/services?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 card-elevated"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoryGrid;
