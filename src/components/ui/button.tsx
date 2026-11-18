import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        gold:
          "group bg-gradient-to-b from-gold-300 to-gold-500 text-ink ring-1 ring-inset ring-gold-200/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_24px_-10px_rgba(215,163,40,0.55)] hover:-translate-y-px hover:from-gold-200 hover:to-gold-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_28px_-10px_rgba(215,163,40,0.65)] [&_svg]:transition-transform hover:[&_svg:last-child]:translate-x-0.5",
        glass:
          "border border-white/10 bg-white/[0.06] text-foreground backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.1]",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-white/5",
        link: "h-auto px-0 text-gold-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
