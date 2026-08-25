import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
  badge?: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
  badge,
}: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
        <div className="settings-icon-container shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold text-sm flex items-center gap-2">
            {title}
            {badge}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
