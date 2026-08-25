import type { DeviceSession } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Apple,
  Globe,
  Laptop,
  LogOut,
  Monitor,
  Smartphone,
} from "lucide-react";

function getOsIcon(os: string) {
  const lower = os.toLowerCase();
  if (
    lower.includes("ios") ||
    lower.includes("iphone") ||
    lower.includes("ipad")
  )
    return Apple;
  if (lower.includes("android")) return Smartphone;
  if (lower.includes("mac") || lower.includes("darwin")) return Apple;
  if (lower.includes("windows")) return Monitor;
  if (lower.includes("linux")) return Laptop;
  return Globe;
}

function relativeTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

interface SessionListProps {
  sessions: DeviceSession[];
  isLoading: boolean;
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
  isRevoking: boolean;
  isRevokingAll: boolean;
}

export function SessionList({
  sessions,
  isLoading,
  onRevoke,
  onRevokeAll,
  isRevoking,
  isRevokingAll,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="space-y-4">
      {/* Sign Out All */}
      {otherSessions.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRevokeAll}
            disabled={isRevokingAll}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            data-ocid="sessions.revoke_all_button"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            {isRevokingAll ? "Signing out..." : "Sign Out All Devices"}
          </Button>
        </div>
      )}

      {sessions.length === 0 && (
        <p
          className="text-sm text-muted-foreground text-center py-6"
          data-ocid="sessions.empty_state"
        >
          No active sessions found.
        </p>
      )}

      <div className="space-y-2" data-ocid="sessions.list">
        {sessions.map((session, idx) => {
          const OsIcon = getOsIcon(session.os);
          return (
            <div
              key={session.session_id}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-smooth"
              data-ocid={`sessions.item.${idx + 1}`}
            >
              <div className="settings-icon-container shrink-0">
                <OsIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="session-device">{session.device_name}</span>
                  {session.is_current && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-primary/40 text-primary bg-primary/10"
                      data-ocid={`sessions.current_badge.${idx + 1}`}
                    >
                      This device
                    </Badge>
                  )}
                </div>
                <p className="session-meta mt-0.5">
                  {session.os} · {session.ip_address} ·{" "}
                  {relativeTime(session.last_active)}
                </p>
              </div>
              {!session.is_current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevoke(session.session_id)}
                  disabled={isRevoking}
                  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  data-ocid={`sessions.revoke_button.${idx + 1}`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
