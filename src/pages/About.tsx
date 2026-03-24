import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Users, Target } from "lucide-react";
import { motion } from "framer-motion";

const About = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <div className="container flex-1 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground">About LocalNeedFinder</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          LocalNeedFinder is India's growing platform that connects local residents with trusted service providers in their neighbourhood. Whether you need an electrician at midnight or a tutor for your child, we make finding help simple, fast, and reliable.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          We believe every small business deserves visibility and every customer deserves quality service. Our mission is to empower local economies by bridging the gap between service seekers and providers.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", desc: "Connect every Indian household with reliable local services within minutes." },
            { icon: Users, title: "Community First", desc: "Built for local communities — by understanding real neighbourhood needs." },
            { icon: Shield, title: "Trust & Safety", desc: "Every provider is verified. Your safety and satisfaction come first." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-xl bg-card p-6 card-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <item.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default About;
