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
        "flex flex-col items-center gap-1 px-3 border-r border-slate-200 last:border-r-0",
        className
      )}
    >
      <div className="flex items-center gap-1 flex-1">{children}</div>
      <span className="text-[9px] font-medium text-slate-400 tracking-wide uppercase whitespace-nowrap">
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
          "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-all text-slate-600 cursor-pointer",
          "hover:bg-slate-100 hover:text-slate-900",
          active && "bg-purple-50 text-purple-600 shadow-sm ring-1 ring-purple-200",
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
        "h-8 w-8 flex items-center justify-center rounded-md transition-all text-slate-500 cursor-pointer",
        "hover:bg-slate-100 hover:text-slate-900",
        active && "bg-purple-50 text-purple-600 ring-1 ring-purple-200",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      {icon}
    </button>
  );
}
