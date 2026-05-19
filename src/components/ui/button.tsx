"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";
    
    const variants = {
      primary: "bg-neutral-900 text-white neon-box neon-box-hover",
      secondary: "glass text-white hover:bg-white/10",
      ghost: "hover:bg-white/5 text-neutral-300 hover:text-white",
      danger: "bg-red-950/50 text-red-400 border border-red-500/30 hover:border-red-500/80 hover:bg-red-900/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-6 py-2",
      lg: "h-14 px-8 text-lg",
      icon: "h-10 w-10",
    };

    // Usamos motion.button internamente para mantener las props estándar pero darle animación
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
