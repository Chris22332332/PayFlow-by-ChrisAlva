import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface QRCodeCardProps {
  userId: string;
  displayName: string;
  username: string;
  className?: string;
}

// Lightweight QR code renderer using a public QR API endpoint
// Encodes "payflow:userid:{userId}" as the QR data
function buildQRUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=10&format=png`;
}

export function QRCodeCard({
  userId,
  displayName,
  username,
  className,
}: QRCodeCardProps) {
  const qrData = `payflow:userid:${userId}`;
  const qrUrl = buildQRUrl(qrData, 240);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pre-load QR image into canvas for download
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrUrl;
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [qrUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // Fallback: open the image URL directly
      window.open(qrUrl, "_blank");
      return;
    }
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `payflow-${userId}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR code downloaded");
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Send money to ${displayName} on PayFlow`,
      text: `Pay @${username} instantly on PayFlow — User ID: #${userId}`,
      url: `${window.location.origin}?pay=${userId}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Profile link copied to clipboard");
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border bg-card shadow-elevated",
        className,
      )}
      data-ocid="profile.qr_card"
    >
      <CardContent className="p-0">
        {/* QR header */}
        <div className="px-5 pt-5 pb-4 text-center">
          <p className="text-xs text-label text-muted-foreground mb-4">
            Scan to send money
          </p>

          {/* QR image container */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-border bg-white flex items-center justify-center">
              <img
                src={qrUrl}
                alt={`QR code for ${displayName}`}
                className="w-44 h-44 object-contain"
                loading="lazy"
              />
            </div>
            {/* PayFlow logo overlay in center */}
            <div className="absolute w-10 h-10 rounded-xl bg-primary flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-primary-foreground font-display font-bold text-xs">
                PF
              </span>
            </div>
          </div>

          {/* Hidden canvas for download */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Identity */}
          <div className="mt-4 space-y-1">
            <p className="font-display font-semibold text-foreground">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground">@{username}</p>
            <p className="text-xs font-mono text-primary/80 bg-primary/10 rounded-lg px-3 py-1 inline-block mt-1">
              #{userId}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-border">
          <Button
            variant="ghost"
            className="flex-1 rounded-none rounded-bl-lg h-11 gap-2 text-sm font-medium"
            onClick={handleDownload}
            data-ocid="profile.qr_download_button"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <div className="w-px bg-border" />
          <Button
            variant="ghost"
            className="flex-1 rounded-none rounded-br-lg h-11 gap-2 text-sm font-medium"
            onClick={handleShare}
            data-ocid="profile.qr_share_button"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
