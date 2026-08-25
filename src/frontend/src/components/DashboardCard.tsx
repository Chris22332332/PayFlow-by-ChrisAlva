import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  "data-ocid"?: string;
  noPadding?: boolean;
  accent?: "primary" | "accent" | "success" | "warning" | "destructive";
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className,
  delay = 0,
  "data-ocid": dataOcid,
  noPadding = false,
  accent,
}: DashboardCardProps) {
  const accentGlow: Record<string, string> = {
    primary: "from-primary/8 via-transparent to-transparent",
    accent: "from-accent/8 via-transparent to-transparent",
    success: "from-success/8 via-transparent to-transparent",
    warning: "from-warning/8 via-transparent to-transparent",
    destructive: "from-destructive/8 via-transparent to-transparent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-border",
        !noPadding && "p-5",
        className,
      )}
      data-ocid={dataOcid}
    >
      {accent && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br rounded-2xl",
            accentGlow[accent],
          )}
        />
      )}
      <div className="relative">
        {(title || headerAction) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {icon && (
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    accent ? `bg-${accent}/10` : "bg-muted/60",
                  )}
                >
                  {icon}
                </div>
              )}
              {(title || subtitle) && (
                <div>
                  {title && (
                    <h2 className="font-display font-semibold text-base leading-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
