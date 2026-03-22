"use client";

import { cn } from "@/lib/utils";

interface RibbonGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function RibbonGroup({ label, children, className }: RibbonGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 px-3 border-r border-border/30 last:border-r-0",
        className
      )}
    >
      <div className="flex items-center gap-1 flex-1">{children}</div>
      <span className="text-[9px] font-medium text-muted-foreground/70 tracking-wide uppercase whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

interface RibbonButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: "default" | "large";
  title?: string;
  className?: string;
}

export function RibbonButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  variant = "default",
  title,
  className,
}: RibbonButtonProps) {
  if (variant === "large") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title ?? label}
        className={cn(
          "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all text-muted-foreground",
          "hover:bg-accent/10 hover:text-accent-foreground",
          active && "bg-accent/15 text-primary shadow-sm",
          disabled && "opacity-40 pointer-events-none",
          className
        )}
      >
        <span className="h-6 w-6 flex items-center justify-center">{icon}</span>
        {label && (
          <span className="text-[10px] font-medium leading-tight whitespace-nowrap">
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md transition-all text-muted-foreground",
        "hover:bg-accent/10 hover:text-accent-foreground",
        active && "bg-accent/15 text-primary",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      {icon}
    </button>
  );
}
