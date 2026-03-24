import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, Phone, MapPin, Send } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;
type Review = Tables<"reviews">;

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<(Review & { user_name?: string })[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchService();
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    const [sRes, rRes] = await Promise.all([
      supabase.from("services").select("*").eq("id", id!).single(),
      supabase.from("reviews").select("*").eq("service_id", id!).order("created_at", { ascending: false }),
    ]);
    if (sRes.data) setService(sRes.data);

    // enrich reviews with profile names
    const revs = rRes.data || [];
    if (revs.length > 0) {
      const uids = [...new Set(revs.map((r) => r.user_id))];
      const pRes = await supabase.from("profiles").select("user_id, full_name").in("user_id", uids);
      const profiles = pRes.data || [];
      setReviews(revs.map((r) => ({ ...r, user_name: profiles.find((p) => p.user_id === r.user_id)?.full_name || "Anonymous" })));
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  const handleReview = async () => {
    if (!user) { toast({ title: "Please log in to leave a review", variant: "destructive" }); return; }
    const { error } = await supabase.from("reviews").insert({ service_id: id!, user_id: user.id, rating, comment });
    if (!error) { toast({ title: "Review submitted!" }); setComment(""); fetchService(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleInquiry = async () => {
    if (!user) { toast({ title: "Please log in to send an inquiry", variant: "destructive" }); return; }
    if (!inquiry.trim()) return;
    const { error } = await supabase.from("inquiries").insert({ service_id: id!, user_id: user.id, provider_id: service!.provider_id, message: inquiry });
    if (!error) { toast({ title: "Inquiry sent!" }); setInquiry(""); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "N/A";

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!service) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Service not found</p></div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.image_url && (
              <div className="mb-6 overflow-hidden rounded-xl">
                <img src={service.image_url} alt={service.name} className="h-64 w-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{service.category}</span>
              <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-medium">{avgRating}</span><span className="text-sm text-muted-foreground">({reviews.length} reviews)</span></div>
              {service.location && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{service.location}</div>}
            </div>
            {service.price && <p className="mt-3 text-xl font-bold text-primary">{service.price}</p>}
            {service.description && <p className="mt-4 text-muted-foreground">{service.description}</p>}

            <div className="mt-6 flex gap-3">
              {service.phone && (
                <>
                  <Button asChild><a href={`tel:${service.phone}`}><Phone className="mr-2 h-4 w-4" />Call</a></Button>
                  <Button variant="outline" asChild><a href={`https://wa.me/91${service.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></Button>
                </>
              )}
            </div>

            {/* Reviews Section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-foreground">Reviews ({reviews.length})</h2>
              {user && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-foreground mb-2">Leave a Review</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setRating(s)}>
                          <Star className={`h-6 w-6 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." className="mb-3" />
                    <Button onClick={handleReview}>Submit Review</Button>
                  </CardContent>
                </Card>
              )}
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-foreground">{r.rating}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.user_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{r.comment || "No comment"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
              </div>
            </div>
          </div>

          {/* Inquiry Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Send Inquiry</h3>
                <Textarea value={inquiry} onChange={(e) => setInquiry(e.target.value)} placeholder="Describe what you need..." rows={4} className="mb-3" />
                <Button className="w-full" onClick={handleInquiry}><Send className="mr-2 h-4 w-4" />Send Inquiry</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
