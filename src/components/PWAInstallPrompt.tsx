import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install, dismiss } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[400px] z-[100] bg-background border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">
            Install Sports Booking App
          </p>
          <p className="text-xs text-muted-foreground">
            Get quick access to booking venues and slots
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={dismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={install}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
