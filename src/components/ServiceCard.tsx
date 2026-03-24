import { Star, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export interface ServiceCardProps {
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  description: string;
  price: string;
  phone: string;
  image: string;
}

const ServiceCard = ({ name, category, rating, reviews, location, description, price, phone, image }: ServiceCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group overflow-hidden rounded-xl bg-card card-elevated"
  >
    <div className="relative h-44 overflow-hidden">
      <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
        {category}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-foreground">{name}</h3>
        <span className="text-sm font-bold text-primary">{price}</span>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-foreground">{rating}</span>
        <span className="text-xs text-muted-foreground">({reviews} reviews)</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" /> {location}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1" asChild>
          <a href={`tel:${phone}`}><Phone className="mr-1 h-3 w-3" /> Call</a>
        </Button>
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <a href={`https://wa.me/91${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  </motion.div>
);

export default ServiceCard;
