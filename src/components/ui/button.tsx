import * as React from "react";
import { buttonVariants, ButtonVariants } from "./button-variants";
import { cn } from "@/lib/utils";

// Button now accepts variant and size props with correct types
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
));

Button.displayName = "Button";

export { buttonVariants };
