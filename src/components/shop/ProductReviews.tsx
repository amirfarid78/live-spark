import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  // Empty reviews - following policy to not generate fake reviews
  const reviews: never[] = [];
  const averageRating = 0;
  const totalReviews = 0;

  const ratingDistribution = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Customer Reviews</h3>
        <Button variant="outline" size="sm">
          Write a Review
        </Button>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 text-muted-foreground/30"
                    fill="none"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1.5">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{item.stars}</span>
                  <Star className="h-3 w-3 text-muted-foreground/50" />
                  <Progress value={item.percentage} className="h-2 flex-1" />
                  <span className="w-8 text-right text-muted-foreground text-xs">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h4 className="font-medium text-muted-foreground mb-1">No reviews yet</h4>
            <p className="text-sm text-muted-foreground/70">
              Be the first to review this product
            </p>
            <Button variant="outline" className="mt-4">
              Write a Review
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
