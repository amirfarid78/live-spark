import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, TrendingUp, DollarSign, Crown, ChevronRight, Send, Shield, Star, BarChart3, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Agency() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    agency_name: "",
    description: "",
    experience: "",
    creator_count: 0,
    contact_email: "",
    contact_phone: "",
    instagram: "",
    tiktok: "",
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/agencies/stats"],
    queryFn: async () => {
      const res = await api.get("/agencies/stats");
      return res.data;
    },
  });

  const { data: myAgency, isLoading: myAgencyLoading } = useQuery({
    queryKey: ["/api/agencies/mine"],
    queryFn: async () => {
      const res = await api.get("/agencies/mine");
      return res.data;
    },
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await api.post("/agencies", formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted! We'll review it within 24-48 hours.");
      queryClient.invalidateQueries({ queryKey: ["/api/agencies/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agencies/stats"] });
      setActiveTab("overview");
      setForm({
        agency_name: "",
        description: "",
        experience: "",
        creator_count: 0,
        contact_email: "",
        contact_phone: "",
        instagram: "",
        tiktok: "",
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to submit application");
    },
  });

  const handleApply = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!form.agency_name || !form.contact_email) {
      toast.error("Please fill in required fields");
      return;
    }
    applyMutation.mutate(form);
  };

  const benefits = [
    { icon: Users, title: "Recruit Creators", desc: "Build your roster of talented creators", color: "text-blue-500" },
    { icon: DollarSign, title: "Revenue Sharing", desc: "Earn commission from creator earnings", color: "text-green-500" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track performance & payouts in real-time", color: "text-purple-500" },
    { icon: Shield, title: "Contract Management", desc: "Manage creator contracts & splits", color: "text-amber-500" },
    { icon: Crown, title: "Priority Support", desc: "Dedicated agency support team", color: "text-pink-500" },
    { icon: Star, title: "Verified Badge", desc: "Get verified agency status", color: "text-cyan-500" },
  ];

  const stats = statsData
    ? [
        { label: "Active Agencies", value: statsData.activeAgencies?.toString() || "0", icon: Building2 },
        { label: "Managed Creators", value: statsData.managedCreators?.toString() || "0", icon: Users },
        { label: "Total Payouts", value: statsData.totalPayouts ? `$${statsData.totalPayouts}` : "$0", icon: TrendingUp },
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold" data-testid="text-agency-title">Agency Program</h1>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-12 rounded-none px-2">
          <TabsTrigger data-testid="tab-overview" value="overview" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger data-testid="tab-apply" value="apply" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Apply Now
          </TabsTrigger>
          <TabsTrigger data-testid="tab-dashboard" value="dashboard" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 px-4 py-5 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-primary p-6 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <Building2 className="h-10 w-10 mb-3" />
            <h2 className="text-2xl font-bold mb-2">Become an Agency Partner</h2>
            <p className="text-white/80 text-sm mb-4">Manage creators, grow your network, and earn commission on every stream.</p>
            <Button data-testid="button-apply-hero" onClick={() => setActiveTab("apply")} className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl">
              Apply Now <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {statsLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-3 text-center space-y-2">
                      <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                      <Skeleton className="h-5 w-12 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : stats.length > 0 ? (
              stats.map((s) => (
                <Card key={s.label} className="border-0 shadow-lg" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardContent className="p-3 text-center">
                    <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold" data-testid={`text-stat-value-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">
                No stats available yet.
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Why Join?</h3>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <Card key={b.title} className={cn("border-0 shadow-md animate-fade-in-up", `stagger-${(i % 6) + 1}`)}>
                  <CardContent className="p-4">
                    <b.icon className={cn("h-6 w-6 mb-2", b.color)} />
                    <p className="font-semibold text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="apply" className="mt-0 px-4 py-5 space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Agency Application</h3>
            <p className="text-sm text-muted-foreground">Fill out the form below and our team will review your application.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Agency Name *</Label>
              <Input data-testid="input-agency-name" placeholder="Your agency name" value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea data-testid="input-description" placeholder="Tell us about your agency..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 rounded-xl min-h-[100px]" />
            </div>
            <div>
              <Label>Experience</Label>
              <Textarea data-testid="input-experience" placeholder="Your experience managing creators..." value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="mt-1.5 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Creators You Manage</Label>
                <Input data-testid="input-creator-count" type="number" placeholder="0" value={form.creator_count || ""} onChange={(e) => setForm({ ...form, creator_count: parseInt(e.target.value) || 0 })} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label>Contact Email *</Label>
                <Input data-testid="input-contact-email" type="email" placeholder="email@agency.com" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="mt-1.5 rounded-xl" />
              </div>
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input data-testid="input-contact-phone" placeholder="+1 234 567 890" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="mt-1.5 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Instagram</Label>
                <Input data-testid="input-instagram" placeholder="@handle" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label>TikTok</Label>
                <Input data-testid="input-tiktok" placeholder="@handle" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="mt-1.5 rounded-xl" />
              </div>
            </div>
            <Button data-testid="button-submit-application" onClick={handleApply} disabled={applyMutation.isPending} className="w-full bg-gradient-primary hover:opacity-90 rounded-xl h-12 font-semibold text-base">
              <Send className="mr-2 h-4 w-4" />
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0 px-4 py-5">
          {myAgencyLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          ) : myAgency ? (
            <div className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" data-testid="text-agency-name">{myAgency.name || myAgency.agency_name}</h3>
                      <p className="text-xs text-muted-foreground" data-testid="text-agency-status">Status: {myAgency.status || "pending"}</p>
                    </div>
                  </div>
                  {myAgency.description && (
                    <p className="text-sm text-muted-foreground">{myAgency.description}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-bold mb-2">No Agency Account Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-5">Apply for an agency account to access the dashboard with creator management, analytics, and payout tools.</p>
              <Button data-testid="button-apply-dashboard" onClick={() => setActiveTab("apply")} className="bg-gradient-primary hover:opacity-90 rounded-xl font-semibold">
                <UserPlus className="mr-2 h-4 w-4" />
                Apply for Agency
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
