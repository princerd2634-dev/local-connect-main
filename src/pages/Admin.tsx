import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Package, Star, MessageSquare, Trash2, Shield, ShieldOff } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Service = Tables<"services">;
type Review = Tables<"reviews">;
type UserRole = Tables<"user_roles">;

const Admin = () => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<(Profile & { roles: string[] })[]>([]);
  const [services, setServices] = useState<(Service & { provider_name?: string })[]>([]);
  const [reviews, setReviews] = useState<(Review & { service_name?: string })[]>([]);
  const [stats, setStats] = useState({ users: 0, providers: 0, services: 0, reviews: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !hasRole("admin"))) navigate("/");
  }, [user, loading, hasRole]);

  useEffect(() => {
    if (user && hasRole("admin")) fetchAll();
  }, [user, loading]);

  const fetchAll = async () => {
    setFetching(true);
    const [pRes, rRes, sRes, revRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);

    const allProfiles = pRes.data || [];
    const allRoles = rRes.data || [];
    const allServices = sRes.data || [];
    const allReviews = revRes.data || [];

    const enrichedProfiles = allProfiles.map((p) => ({
      ...p,
      roles: allRoles.filter((r) => r.user_id === p.user_id).map((r) => r.role),
    }));

    const enrichedServices = allServices.map((s) => ({
      ...s,
      provider_name: allProfiles.find((p) => p.user_id === s.provider_id)?.full_name || "Unknown",
    }));

    const enrichedReviews = allReviews.map((r) => ({
      ...r,
      service_name: allServices.find((s) => s.id === r.service_id)?.name || "Unknown",
    }));

    setProfiles(enrichedProfiles);
    setServices(enrichedServices);
    setReviews(enrichedReviews);
    setStats({
      users: enrichedProfiles.filter((p) => p.roles.includes("user")).length,
      providers: enrichedProfiles.filter((p) => p.roles.includes("provider")).length,
      services: allServices.length,
      reviews: allReviews.length,
    });
    setFetching(false);
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) { toast({ title: "Service removed" }); fetchAll(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleDeleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) { toast({ title: "Review removed" }); fetchAll(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleToggleActive = async (id: string, current: boolean | null) => {
    await supabase.from("services").update({ is_active: !current }).eq("id", id);
    fetchAll();
  };

  const handleToggleRole = async (userId: string, role: string, hasIt: boolean) => {
    if (hasIt) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    }
    toast({ title: hasIt ? `Removed ${role} role` : `Added ${role} role` });
    fetchAll();
  };

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex-1 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, services, and reviews</p>
        </div>

        {/* Analytics Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{stats.users}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Providers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />{stats.providers}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Services</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Package className="h-5 w-5 text-primary" />{stats.services}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Reviews</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground flex items-center gap-2"><Star className="h-5 w-5 text-amber-400" />{stats.reviews}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users & Providers</TabsTrigger>
            <TabsTrigger value="services">All Services ({stats.services})</TabsTrigger>
            <TabsTrigger value="reviews">All Reviews ({stats.reviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="rounded-lg border border-border overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Roles</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                      <TableCell>{p.phone || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.roles.map((r) => (
                            <Badge key={r} variant={r === "admin" ? "default" : r === "provider" ? "secondary" : "outline"}>{r}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {p.user_id !== user?.id && (
                          <>
                            <Button size="sm" variant={p.roles.includes("provider") ? "destructive" : "outline"} onClick={() => handleToggleRole(p.user_id, "provider", p.roles.includes("provider"))}>
                              {p.roles.includes("provider") ? <><ShieldOff className="mr-1 h-3 w-3" />Remove Provider</> : <><Shield className="mr-1 h-3 w-3" />Make Provider</>}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="services" className="mt-4">
            <div className="rounded-lg border border-border overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Provider</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.provider_name}</TableCell>
                      <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                      <TableCell>{s.price || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? "default" : "outline"} className="cursor-pointer" onClick={() => handleToggleActive(s.id, s.is_active)}>
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteService(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="rounded-lg border border-border overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Rating</TableHead><TableHead>Comment</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.service_name}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{r.rating}</div></TableCell>
                      <TableCell className="max-w-[250px] truncate">{r.comment || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteReview(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
