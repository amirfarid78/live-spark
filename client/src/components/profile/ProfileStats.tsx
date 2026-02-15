import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  following: number;
  followers: number;
  likes: number;
  className?: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function ProfileStats({ following, followers, likes, className }: ProfileStatsProps) {
  const stats = [
    { label: "Following", value: formatNumber(following) },
    { label: "Followers", value: formatNumber(followers) },
    { label: "Likes", value: formatNumber(likes) },
  ];

  return (
    <div className={cn("flex justify-around py-4 border-y border-border/50", className)}>
      {stats.map((stat, index) => (
        <button 
          key={stat.label} 
          className={cn(
            "text-center press-effect animate-fade-in-up flex-1",
            `stagger-${index + 1}`
          )}
        >
          <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
        </button>
      ))}
    </div>
  );
}
