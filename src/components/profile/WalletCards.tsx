import { Coins, Gem, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WalletCardsProps {
  coinsBalance: number;
  diamondsBalance: number;
  onTopUp?: () => void;
  onWithdraw?: () => void;
  className?: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function WalletCards({ 
  coinsBalance, 
  diamondsBalance, 
  onTopUp, 
  onWithdraw, 
  className 
}: WalletCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4", className)}>
      {/* Coins Card */}
      <Card className="border-0 shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-primary p-0.5 rounded-xl">
          <CardContent className="p-4 sm:p-5 bg-card rounded-[10px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg">
                  <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Coins Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gradient">
                    {formatNumber(coinsBalance)}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={onTopUp}
              size="sm" 
              className="w-full bg-gradient-primary hover:opacity-90 rounded-lg font-semibold shadow-lg shadow-primary/20 h-10"
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Top Up
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Diamonds Card */}
      <Card className="border-0 shadow-xl overflow-hidden animate-fade-in-up stagger-2">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-0.5 rounded-xl">
          <CardContent className="p-4 sm:p-5 bg-card rounded-[10px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg">
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Diamond Earnings</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    {formatNumber(diamondsBalance)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onWithdraw}
                size="sm" 
                variant="outline"
                className="flex-1 rounded-lg font-semibold h-10 border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="rounded-lg font-semibold h-10"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
