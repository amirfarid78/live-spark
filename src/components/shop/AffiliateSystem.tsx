import { useState } from "react";
import { Link, Share2, Copy, TrendingUp, DollarSign, Users, Package, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ShopifyProduct } from "@/lib/shopify";

interface AffiliateLink {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  link: string;
  clicks: number;
  conversions: number;
  earnings: number;
  commissionRate: number;
}

interface AffiliateDashboardProps {
  affiliateLinks: AffiliateLink[];
  totalEarnings: number;
  pendingPayout: number;
}

export function AffiliateDashboard({ affiliateLinks, totalEarnings, pendingPayout }: AffiliateDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = affiliateLinks.reduce((sum, link) => sum + link.conversions, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">${pendingPayout.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
                <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Affiliate Links</h3>
          <Button variant="outline" size="sm">
            <Link className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </div>
        
        <div className="space-y-3">
          {affiliateLinks.map((link) => (
            <AffiliateProductCard key={link.id} affiliateLink={link} />
          ))}
          
          {affiliateLinks.length === 0 && (
            <Card className="p-6 text-center">
              <Link className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No affiliate links yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Create links to products you want to promote
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function AffiliateProductCard({ affiliateLink }: { affiliateLink: AffiliateLink }) {
  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink.link);
    toast.success("Link copied!");
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            <img 
              src={affiliateLink.productImage} 
              alt={affiliateLink.productTitle}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1">{affiliateLink.productTitle}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {affiliateLink.commissionRate}% commission
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{affiliateLink.clicks} clicks</span>
              <span>{affiliateLink.conversions} sales</span>
              <span className="text-green-500 font-medium">${affiliateLink.earnings.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={affiliateLink.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Affiliate Link Sheet
interface CreateAffiliateLinkSheetProps {
  product: ShopifyProduct;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLink: (productId: string) => void;
}

export function CreateAffiliateLinkSheet({ product, isOpen, onOpenChange, onCreateLink }: CreateAffiliateLinkSheetProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreate = async () => {
    setIsCreating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onCreateLink(product.node.id);
    setIsCreating(false);
    onOpenChange(false);
    toast.success("Affiliate link created!");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Create Affiliate Link</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex gap-3 p-3 rounded-lg bg-secondary/30">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
              {product.node.images?.edges?.[0]?.node && (
                <img 
                  src={product.node.images.edges[0].node.url} 
                  alt={product.node.title}
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            <div>
              <h4 className="font-medium">{product.node.title}</h4>
              <p className="text-sm text-muted-foreground">
                {product.node.priceRange.minVariantPrice.currencyCode}{' '}
                {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
              <Badge className="mt-1">10% commission</Badge>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              You'll earn <strong>10%</strong> of every sale made through your link!
            </p>
          </div>
          
          <Button className="w-full" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Affiliate Link"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
