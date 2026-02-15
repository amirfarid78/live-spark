import { cn } from "@/lib/utils";

interface ProfileStatsProps {
  following: number;
  followers: number;
  likes: number;
  className?: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function ProfileStats({ following, followers, likes, className, onFollowersClick, onFollowingClick }: ProfileStatsProps) {
  const stats = [
    { label: "Following", value: formatNumber(following), onClick: onFollowingClick },
    { label: "Followers", value: formatNumber(followers), onClick: onFollowersClick },
    { label: "Likes", value: formatNumber(likes), onClick: undefined },
  ];

  return (
    <div className={cn("flex justify-around py-4 border-y border-border/50", className)}>
      {stats.map((stat, index) => (
        <button 
          key={stat.label} 
          onClick={stat.onClick}
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
