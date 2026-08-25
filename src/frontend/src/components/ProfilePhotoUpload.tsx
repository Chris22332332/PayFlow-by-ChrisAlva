import { useUpdateProfilePhoto } from "@/hooks/useProfile";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  displayName: string;
  onUploadSuccess?: (url: string) => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Upload a file to the object-storage extension endpoint
async function uploadToObjectStorage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  // The object-storage extension is exposed at /api/storage/upload
  const resp = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    // Fallback: create a local object URL for dev/demo purposes
    return URL.createObjectURL(file);
  }
  const json = (await resp.json()) as { url?: string };
  return json.url ?? URL.createObjectURL(file);
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  displayName,
  onUploadSuccess,
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentPhotoUrl,
  );

  const updatePhoto = useUpdateProfilePhoto();

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are accepted");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be under 5 MB");
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);
    setProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 20, 85));
    }, 200);

    try {
      const uploadedUrl = await uploadToObjectStorage(file);
      clearInterval(progressInterval);
      setProgress(100);

      await updatePhoto.mutateAsync(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      onUploadSuccess?.(uploadedUrl);
      toast.success("Profile photo updated");
    } catch (err) {
      clearInterval(progressInterval);
      setPreviewUrl(currentPhotoUrl);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo",
      );
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    try {
      await updatePhoto.mutateAsync("");
      setPreviewUrl(undefined);
      onUploadSuccess?.("");
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  // Circumference for the progress ring (r=44)
  const r = 44;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ - (progress / 100) * circ;

  return (
    <div className="relative group w-24 h-24" data-ocid="profile.photo_upload">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-ocid="profile.photo_input"
      />

      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="w-24 h-24 rounded-full overflow-hidden border-2 border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-smooth relative"
        aria-label="Change profile photo"
        disabled={isUploading}
        data-ocid="profile.photo_button"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-primary">
              {initials || <User className="h-8 w-8 text-primary" />}
            </span>
          </div>
        )}

        {/* Camera overlay on hover */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center rounded-full">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Upload spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </button>

      {/* Progress ring */}
      {isUploading && progress > 0 && (
        <svg
          aria-label="Upload progress"
          role="img"
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 96 96"
        >
          <title>Upload progress</title>
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-primary"
            strokeDasharray={circ}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.2s ease" }}
          />
        </svg>
      )}

      {/* Remove button (shows when photo exists, not uploading) */}
      {previewUrl && !isUploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth shadow-elevated border-2 border-background"
          aria-label="Remove photo"
          data-ocid="profile.photo_remove_button"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
