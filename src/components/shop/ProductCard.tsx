import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: ShopifyProduct;
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  
  const { node } = product;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange?.minVariantPrice;
  const firstVariant = node.variants?.edges?.[0]?.node;
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product,
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: firstVariant.price,
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions || []
      });
      toast.success("Added to cart", {
        description: node.title,
        position: "top-center"
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link to={`/shop/product/${node.handle}`}>
      <Card className="group overflow-hidden border-0 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || node.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {showAddToCart && firstVariant?.availableForSale && (
            <Button
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {!firstVariant?.availableForSale && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Sold Out
            </Badge>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {node.title}
          </h3>
          {price && (
            <p className="text-primary font-bold">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
