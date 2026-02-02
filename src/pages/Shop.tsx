import { useState } from "react";
import { Search, Filter, ShoppingBag, Tag, Flame, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { id: "all", label: "All", icon: ShoppingBag },
  { id: "hot", label: "Hot Deals", icon: Flame },
  { id: "new", label: "New Arrivals", icon: Sparkles },
  { id: "sale", label: "On Sale", icon: Tag },
];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const getProductQuery = () => {
    if (searchQuery) {
      return `title:*${searchQuery}*`;
    }
    switch (activeCategory) {
      case "hot":
        return "tag:hot OR tag:trending";
      case "new":
        return "";  // Would use created_at sorting in real implementation
      case "sale":
        return "tag:sale OR tag:discount";
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Shop</h1>
          </div>
          <CartDrawer />
        </div>
        
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/30"
            />
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "secondary"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Products */}
      <div className="p-4">
        <ProductGrid 
          query={getProductQuery()} 
          limit={50}
          columns={2}
        />
      </div>
    </div>
  );
}
