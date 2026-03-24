import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, MessageSquare, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const categories = ["Electrician", "Plumber", "Tutor", "Delivery", "Painter", "Carpenter", "Salon", "Security"];

type Service = Tables<"services">;
type Inquiry = Tables<"inquiries">;
type Review = Tables<"reviews">;

const emptyService = { name: "", category: "Electrician", description: "", price: "", location: "", phone: "", image_url: "" };

const Dashboard = () => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [inquiries, setInquiries] = useState<(Inquiry & { service_name?: string; user_name?: string })[]>([]);
  const [reviews, setReviews] = useState<(Review & { service_name?: string; user_name?: string })[]>([]);
  const [formData, setFormData] = useState(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !hasRole("provider"))) navigate("/");
  }, [user, loading, hasRole]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setFetching(true);
    const [sRes, iRes] = await Promise.all([
      supabase.from("services").select("*").eq("provider_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("inquiries").select("*").eq("provider_id", user!.id).order("created_at", { ascending: false }),
    ]);
    const svc = sRes.data || [];
    setServices(svc);

    // fetch reviews for provider's services
    if (svc.length > 0) {
      const ids = svc.map((s) => s.id);
      const rRes = await supabase.from("reviews").select("*").in("service_id", ids).order("created_at", { ascending: false });
      const revs = (rRes.data || []).map((r) => ({
        ...r,
        service_name: svc.find((s) => s.id === r.service_id)?.name || "Unknown",
      }));
      setReviews(revs);
    }

    // enrich inquiries with service names
    const enriched = (iRes.data || []).map((inq) => ({
      ...inq,
      service_name: svc.find((s) => s.id === inq.service_id)?.name || "Unknown",
    }));
    setInquiries(enriched);
    setFetching(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast({ title: "Name and category are required", variant: "destructive" });
      return;
    }
    const payload = { ...formData, provider_id: user!.id };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("services").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("services").insert(payload));
    }
    if (error) {
      toast({ title: "Error saving service", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Service updated" : "Service added" });
      setDialogOpen(false);
      setFormData(emptyService);
      setEditingId(null);
      fetchAll();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      toast({ title: "Service deleted" });
      fetchAll();
    }
  };

  const handleEdit = (s: Service) => {
    setFormData({
      name: s.name,
      category: s.category,
      description: s.description || "",
      price: s.price || "",
      location: s.location || "",
      phone: s.phone || "",
      image_url: s.image_url || "",
    });
    setEditingId(s.id);
    setDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    fetchAll();
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "N/A";

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your services and inquiries</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setFormData(emptyService); setEditingId(null); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Service" : "Add New Service"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price</Label><Input value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="₹200/hr" /></div>
                  <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                </div>
                <div><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
                <div><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} /></div>
                <Button onClick={handleSave}>{editingId ? "Update" : "Add"} Service</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Services</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Package className="h-5 w-5 text-primary" />{services.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inquiries</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{inquiries.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Star className="h-5 w-5 text-amber-400" />{avgRating}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries ({inquiries.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4">
            {services.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No services yet. Click "Add Service" to get started.</CardContent></Card>
            ) : (
              <div className="rounded-lg border border-border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                        <TableCell>{s.price || "—"}</TableCell>
                        <TableCell>{s.location || "—"}</TableCell>
                        <TableCell><Badge variant={s.is_active ? "default" : "outline"}>{s.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="mt-4">
            {inquiries.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No inquiries yet.</CardContent></Card>
            ) : (
              <div className="rounded-lg border border-border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {inquiries.map((inq) => (
                      <TableRow key={inq.id}>
                        <TableCell className="font-medium">{inq.service_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{inq.message}</TableCell>
                        <TableCell><Badge variant={inq.status === "pending" ? "outline" : inq.status === "accepted" ? "default" : "destructive"}>{inq.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(inq.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={inq.status || "pending"} onValueChange={(v) => handleStatusChange(inq.id, v)}>
                            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            {reviews.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-start gap-4 py-4">
                      <div className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-foreground">{r.rating}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{r.service_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{r.comment || "No comment"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
