import { useState } from "react";
import { Store, Link as LinkIcon, Package, Truck, ShoppingBag, Plus, ExternalLink, CheckCircle2, Clock, XCircle, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockOrders = [
  { id: "ORD-001", product: "Premium Hoodie", customer: "Ahmed K.", status: "fulfilled", amount: "$49.99", date: "2 hours ago" },
  { id: "ORD-002", product: "Snap Merch Tee", customer: "Sara M.", status: "pending", amount: "$29.99", date: "5 hours ago" },
  { id: "ORD-003", product: "Creator Cap", customer: "Ali R.", status: "shipped", amount: "$24.99", date: "1 day ago" },
  { id: "ORD-004", product: "Premium Hoodie", customer: "Fatima Z.", status: "cancelled", amount: "$49.99", date: "2 days ago" },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  fulfilled: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  shipped: { icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function StoreManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchOrders, setSearchOrders] = useState("");

  const filteredOrders = mockOrders.filter(o => 
    o.product.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.id.toLowerCase().includes(searchOrders.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Store Management</h1>
          <Store className="h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="w-full justify-around border-b border-border bg-transparent h-12 rounded-none px-2">
          <TabsTrigger value="overview" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="connect" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs sm:text-sm">
            Connect
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-0 px-4 py-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Sales", value: "$1,249", icon: ShoppingBag, color: "text-green-500" },
              { label: "Orders", value: "32", icon: Package, color: "text-blue-500" },
              { label: "Products", value: "8", icon: Store, color: "text-purple-500" },
              { label: "Pending", value: "5", icon: Clock, color: "text-amber-500" },
            ].map((s) => (
              <Card key={s.label} className="border-0 shadow-lg animate-fade-in-up">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-secondary", s.color)}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-bold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Plus, label: "Add New Product", desc: "List a product in your store" },
                { icon: Truck, label: "Fulfillment Center", desc: "Manage shipping & tracking" },
                { icon: LinkIcon, label: "Connect Store", desc: "Link your Shopify or create new", action: () => setActiveTab("connect") },
              ].map((a) => (
                <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors press-effect text-left">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <a.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="mt-0 px-4 py-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={searchOrders} onChange={(e) => setSearchOrders(e.target.value)} className="pl-10 rounded-xl" />
          </div>

          <div className="space-y-2">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              return (
                <Card key={order.id} className="border-0 shadow-md press-effect cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                      <StatusIcon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{order.product}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{order.id}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.customer} · {order.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{order.amount}</p>
                      <p className={cn("text-[10px] font-medium capitalize", config.color)}>{order.status}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Connect Store */}
        <TabsContent value="connect" className="mt-0 px-4 py-5 space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Connect Your Store</h3>
            <p className="text-sm text-muted-foreground">Create a new store or connect an existing Shopify store.</p>
          </div>

          {/* Create New */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-primary p-0.5 rounded-xl">
              <CardContent className="p-5 bg-card rounded-[10px] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">Create New Store</p>
                    <p className="text-xs text-muted-foreground">Set up a brand new Shopify store</p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Free sandbox for development</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 30-day trial when you go live</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Full Shopify integration</li>
                </ul>
                <Button className="w-full bg-gradient-primary hover:opacity-90 rounded-xl h-11 font-semibold" onClick={() => toast.info("Ask in chat to create a Shopify store!")}>
                  <Plus className="mr-2 h-4 w-4" /> Create Store
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Connect Existing */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Connect Existing Store</p>
                  <p className="text-xs text-muted-foreground">Link your existing Shopify store</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Sync products automatically</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Manage orders from one place</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Live shopping integration</li>
              </ul>
              <Button variant="outline" className="w-full rounded-xl h-11 font-semibold" onClick={() => toast.info("Ask in chat to connect your Shopify store!")}>
                <ExternalLink className="mr-2 h-4 w-4" /> Connect Store
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
