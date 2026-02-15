import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Minus, Plus, Loader2, Share2, Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { SimilarProducts } from "@/components/shop/SimilarProducts";
import { SellerInfo } from "@/components/shop/SellerInfo";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  
  const addItem = useCartStore(state => state.addItem);
  const getCheckoutUrl = useCartStore(state => state.getCheckoutUrl);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      setLoading(true);
      try {
        const data = await fetchProductByHandle(handle);
        setProduct(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Product not found</h1>
        <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  const selectedVariant = product.variants?.edges?.[selectedVariantIndex]?.node;
  const images = product.images?.edges || [];
  const currentImage = images[selectedImageIndex]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product: { node: product },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity,
        selectedOptions: selectedVariant.selectedOptions || []
      });
      toast.success("Added to cart!", {
        description: `${quantity}x ${product.title}`,
        position: "top-center"
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      await addItem({
        product: { node: product },
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity,
        selectedOptions: selectedVariant.selectedOptions || []
      });
      
      // Wait for cart to update then open checkout
      setTimeout(() => {
        const checkoutUrl = getCheckoutUrl();
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank');
        }
      }, 500);
    } catch (error) {
      toast.error("Failed to process");
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Product Details</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={currentImage.altText || product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
            </div>
          )}
        </div>
        
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                  selectedImageIndex === idx ? "border-primary scale-110" : "border-transparent opacity-70"
                )}
              >
                <img 
                  src={img.node.url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Like button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Price & Title */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-primary">
              {selectedVariant?.price.currencyCode} {parseFloat(selectedVariant?.price.amount || "0").toFixed(2)}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{product.title}</h2>
        </div>

        {/* Availability */}
        {selectedVariant && (
          <Badge variant={selectedVariant.availableForSale ? "default" : "secondary"}>
            {selectedVariant.availableForSale ? "In Stock" : "Sold Out"}
          </Badge>
        )}

        {/* Shipping & Returns Info */}
        <div className="flex gap-4 py-3 border-y">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4 text-primary" />
            <span>7 Days Return</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Secure</span>
          </div>
        </div>

        {/* Variant Options */}
        {product.options?.map((option, optIdx) => (
          <div key={optIdx} className="space-y-2">
            <h3 className="font-medium text-sm">{option.name}</h3>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value, valIdx) => {
                const variant = product.variants.edges.find(v => 
                  v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                );
                const variantIndex = product.variants.edges.indexOf(variant!);
                const isSelected = selectedVariant?.selectedOptions.some(
                  o => o.name === option.name && o.value === value
                );
                
                return (
                  <Button
                    key={valIdx}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => variantIndex >= 0 && setSelectedVariantIndex(variantIndex)}
                    className="min-w-[60px]"
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Quantity</h3>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Seller Info */}
        <SellerInfo />

        {/* Tabs for Description, Reviews */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            {product.description ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                No description available for this product.
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-4">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>

        {/* Similar Products */}
        <div className="pt-6">
          <SimilarProducts 
            currentProductId={product.id} 
            currentProductTitle={product.title}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-area-inset-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!selectedVariant?.availableForSale || isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleBuyNow}
            disabled={!selectedVariant?.availableForSale || isAdding}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
