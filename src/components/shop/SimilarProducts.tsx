import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, fetchProducts } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SimilarProductsProps {
  currentProductId: string;
  currentProductTitle?: string;
}

export function SimilarProducts({ currentProductId, currentProductTitle }: SimilarProductsProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Fetch products (in real implementation would filter by category/tags)
        const data = await fetchProducts(10);
        // Filter out current product
        const filtered = data.filter(p => p.node.id !== currentProductId);
        setProducts(filtered.slice(0, 6));
      } catch (err) {
        console.error("Failed to load similar products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [currentProductId]);

  const handleAddToCart = async (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variant = product.node.variants?.edges?.[0]?.node;
    if (!variant) return;
    
    setAddingId(product.node.id);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });
      toast.success("Added to cart", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">You May Also Like</h3>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">You May Also Like</h3>
      
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {products.map((product) => {
            const { node } = product;
            const image = node.images?.edges?.[0]?.node;
            const price = node.priceRange?.minVariantPrice;
            const variant = node.variants?.edges?.[0]?.node;
            
            return (
              <Link 
                key={node.id} 
                to={`/shop/product/${node.handle}`}
                className="shrink-0 w-[140px]"
              >
                <Card className="overflow-hidden border-0 bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                  <div className="relative aspect-square">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || node.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {variant?.availableForSale && (
                      <Button
                        size="icon"
                        className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={addingId === node.id}
                      >
                        {addingId === node.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <CardContent className="p-2">
                    <h4 className="text-xs font-medium line-clamp-2 mb-1">
                      {node.title}
                    </h4>
                    {price && (
                      <p className="text-xs font-bold text-primary">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
