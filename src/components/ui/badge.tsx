import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100",
        accent: "bg-accent-100 text-accent-900 dark:bg-accent-900 dark:text-accent-100",
        outline: "border border-border text-muted-foreground",
        solar: "bg-solar text-white",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
