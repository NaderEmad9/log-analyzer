import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "inline-flex items-center rounded-full border border-border bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800",
  destructive:
    "inline-flex items-center rounded-full border border-destructive bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 dark:bg-red-900 dark:text-red-200 dark:border-red-800",
  outline:
    "inline-flex items-center rounded-full border border-border bg-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants[variant], className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
