import type { UserProfile } from "@/hooks/useTransfer";
import { useRecipientSearch } from "@/hooks/useTransfer";
import { cn } from "@/lib/utils";
import { Check, Loader2, Search, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RecipientSearchProps {
  selected: UserProfile | null;
  onSelect: (profile: UserProfile | null) => void;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AvatarFallback({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
      {getInitials(name) || <User className="w-4 h-4" />}
    </div>
  );
}

function UserResultRow({
  profile,
  onSelect,
  isFocused,
}: {
  profile: UserProfile;
  onSelect: () => void;
  isFocused: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left",
        isFocused && "bg-muted/60",
      )}
    >
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={profile.displayName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      ) : (
        <AvatarFallback name={profile.displayName} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {profile.displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          @{profile.username}
        </p>
      </div>
      <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md shrink-0">
        #{profile.userId.slice(-8).toUpperCase()}
      </span>
    </button>
  );
}

export function RecipientSearch({
  selected,
  onSelect,
  className,
}: RecipientSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useRecipientSearch(inputValue);

  // Reset focus index when results change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on result identity change
  useEffect(() => {
    setFocusIndex(0);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const match = results[focusIndex];
      if (match) handleSelect(match);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelect(profile: UserProfile) {
    onSelect(profile);
    setInputValue("");
    setOpen(false);
  }

  function handleRemove() {
    onSelect(null);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const showDropdown = open && inputValue.trim().length >= 2;

  if (selected) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/30 rounded-xl",
          className,
        )}
        data-ocid="recipient_search.selected_chip"
      >
        {selected.photoUrl ? (
          <img
            src={selected.photoUrl}
            alt={selected.displayName}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
            {getInitials(selected.displayName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {selected.displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{selected.username} ·{" "}
            <span className="font-mono">
              #{selected.userId.slice(-8).toUpperCase()}
            </span>
          </p>
        </div>
        <Check className="w-4 h-4 text-primary shrink-0" />
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove recipient"
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
          data-ocid="recipient_search.remove_button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {isLoading && inputValue.trim().length >= 2 ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : null}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by username, user ID, email, or phone"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-9 h-10 rounded-xl bg-muted/40 border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-smooth"
          data-ocid="recipient_search.input"
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden">
          {results.length === 0 && !isLoading ? (
            <div
              className="px-4 py-6 text-center text-sm text-muted-foreground"
              data-ocid="recipient_search.empty_state"
            >
              No users found for "{inputValue}"
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-border/50">
              {results.map((profile, idx) => (
                <UserResultRow
                  key={profile.userId}
                  profile={profile}
                  onSelect={() => handleSelect(profile)}
                  isFocused={idx === focusIndex}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
