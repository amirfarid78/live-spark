import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Settings, Package, TrendingUp, Users, ChevronRight, ShoppingBag, Plus, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "@/components/shop/ProductGrid";

interface CreatorStorefrontProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  isOwner?: boolean;
}

export function CreatorStorefront({ creatorId, creatorName, creatorAvatar, isOwner = false }: CreatorStorefrontProps) {
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();

  // Mock stats - in real app would fetch from database
  const stats = {
    totalProducts: 24,
    totalSales: 156,
    revenue: 12450,
    views: 3420
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Storefront Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20" />
        <div className="px-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary overflow-hidden">
              {creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{creatorName}'s Shop</h1>
                <Badge variant="secondary">Verified Seller</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{stats.totalProducts} products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Dashboard */}
      {isOwner && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-2">
            <Card className="p-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </Card>
            <Card className="p-3 text-center">
              <ShoppingBag className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{stats.totalSales}</p>
              <p className="text-xs text-muted-foreground">Sales</p>
            </Card>
            <Card className="p-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-lg font-bold">${stats.revenue}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </Card>
            <Card className="p-3 text-center">
              <Eye className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{stats.views}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </Card>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={() => navigate("/creator-studio")}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Shop
            </Button>
            <Button variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
          <TabsTrigger value="bestsellers" className="flex-1">Bestsellers</TabsTrigger>
          <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-4">
          <ProductGrid limit={50} columns={2} />
        </TabsContent>
        
        <TabsContent value="bestsellers" className="mt-4">
          <ProductGrid query="tag:bestseller OR tag:popular" limit={20} columns={2} />
        </TabsContent>
        
        <TabsContent value="new" className="mt-4">
          <ProductGrid limit={20} columns={2} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mini Creator Shop Card for Feed/Discovery
interface CreatorShopCardProps {
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  productCount: number;
  previewProducts: Array<{ imageUrl: string }>;
}

export function CreatorShopCard({ creatorId, creatorName, creatorAvatar, productCount, previewProducts }: CreatorShopCardProps) {
  return (
    <Link to={`/shop/creator/${creatorId}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
              {creatorAvatar ? (
                <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{creatorName}</h3>
              <p className="text-xs text-muted-foreground">{productCount} products</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Product Preview Grid */}
          <div className="grid grid-cols-3 gap-1">
            {previewProducts.slice(0, 3).map((product, idx) => (
              <div key={idx} className="aspect-square rounded-md overflow-hidden bg-secondary/50">
                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
