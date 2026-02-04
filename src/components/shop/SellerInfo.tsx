import { Link } from "react-router-dom";
import { Store, Star, Package, MessageCircle, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerInfoProps {
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  isVerified?: boolean;
}

export function SellerInfo({ 
  sellerId = "store", 
  sellerName = "Snap Live Shop",
  sellerAvatar,
  isVerified = true 
}: SellerInfoProps) {
  // Mock seller stats - would come from database in real implementation
  const sellerStats = {
    rating: 4.8,
    totalProducts: 24,
    responseRate: 98,
    responseTime: "Within hours"
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Seller Information</h3>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Seller Header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
              {sellerAvatar ? (
                <AvatarImage src={sellerAvatar} alt={sellerName} />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <Store className="h-6 w-6 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{sellerName}</h4>
                {isVerified && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  {sellerStats.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {sellerStats.totalProducts} Products
                </span>
              </div>
            </div>
            
            <Link to={`/shop/creator/${sellerId}`}>
              <Button variant="outline" size="sm">
                Visit
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Seller Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-green-500">{sellerStats.responseRate}%</p>
              <p className="text-xs text-muted-foreground">Response Rate</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold">{sellerStats.responseTime}</p>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Now
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <Store className="h-4 w-4 mr-2" />
              View Shop
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Buyer Protection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-blue-500" />
              <span>Fast Shipping</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
