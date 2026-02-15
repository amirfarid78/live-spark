import { useState } from "react";
import { ShoppingBag, X, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface LiveShoppingProduct {
  product: ShopifyProduct;
  discountPercent?: number;
  flashSale?: boolean;
  endsAt?: Date;
}

interface LiveShoppingPanelProps {
  products: LiveShoppingProduct[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LiveShoppingPanel({ products, isOpen, onOpenChange }: LiveShoppingPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const addItem = useCartStore(state => state.addItem);
  const getCheckoutUrl = useCartStore(state => state.getCheckoutUrl);

  const handleBuyNow = async (item: LiveShoppingProduct) => {
    const variant = item.product.node.variants?.edges?.[0]?.node;
    if (!variant) return;
    
    setLoadingId(item.product.node.id);
    try {
      await addItem({
        product: item.product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });
      
      // Open checkout
      setTimeout(() => {
        const checkoutUrl = getCheckoutUrl();
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank');
        }
      }, 500);
      
      toast.success("Added to cart!", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Live Shopping
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(60vh-100px)]">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
              <p>No products pinned yet</p>
            </div>
          ) : (
            products.map((item) => {
              const { node } = item.product;
              const image = node.images?.edges?.[0]?.node;
              const price = node.priceRange?.minVariantPrice;
              const discountedPrice = item.discountPercent 
                ? parseFloat(price?.amount || "0") * (1 - item.discountPercent / 100)
                : null;

              return (
                <div key={node.id} className="flex gap-3 p-3 rounded-xl bg-secondary/30 relative overflow-hidden">
                  {item.flashSale && (
                    <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-br-lg">
                      ⚡ FLASH SALE
                    </div>
                  )}
                  
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/50">
                    {image && (
                      <img src={image.url} alt={node.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{node.title}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      {discountedPrice ? (
                        <>
                          <span className="text-lg font-bold text-destructive">
                            {price?.currencyCode} {discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {price?.currencyCode} {parseFloat(price?.amount || "0").toFixed(2)}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            -{item.discountPercent}%
                          </Badge>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {price?.currencyCode} {parseFloat(price?.amount || "0").toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className="self-center shrink-0"
                    onClick={() => handleBuyNow(item)}
                    disabled={loadingId === node.id}
                  >
                    {loadingId === node.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Buy"
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Floating Product Pin for Live Stream
interface LiveProductPinProps {
  product: ShopifyProduct;
  discountPercent?: number;
  onTap: () => void;
}

export function LiveProductPin({ product, discountPercent, onTap }: LiveProductPinProps) {
  const { node } = product;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange?.minVariantPrice;

  return (
    <button
      onClick={onTap}
      className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 shadow-lg border animate-in slide-in-from-bottom-2"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
        {image && <img src={image.url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium line-clamp-1 max-w-[120px]">{node.title}</p>
        <p className="text-xs font-bold text-primary">
          {price?.currencyCode} {parseFloat(price?.amount || "0").toFixed(2)}
          {discountPercent && (
            <span className="text-destructive ml-1">-{discountPercent}%</span>
          )}
        </p>
      </div>
      <ShoppingBag className="h-4 w-4 text-primary" />
    </button>
  );
}
