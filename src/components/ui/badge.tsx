import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-foreground",
        brand: "bg-primary text-primary-foreground",
        solid: "bg-foreground text-background",
        outline: "border border-border text-foreground",
        success: "bg-success/10 text-success",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
