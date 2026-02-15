import { useState, useEffect } from "react";
import { ShopifyProduct, fetchProducts } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Loader2, ShoppingBag, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  query?: string;
  limit?: number;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ query, limit = 20, className, columns = 2 }: ProductGridProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProducts(limit, query);
        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [query, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ShoppingBag className="h-12 w-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <PackageSearch className="h-16 w-16 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-sm text-center max-w-xs">
          Create products by telling me what you want to sell!
        </p>
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
}
