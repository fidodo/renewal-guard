// components/ReloginPrompt.tsx
import { AlertCircle, LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReloginPromptProps {
  isOpen: boolean;
  onRelogin: () => void;
  onDismiss?: () => void;
  message?: string;
}

export const ReloginPrompt = ({
  isOpen,
  onRelogin,
  onDismiss,
  message = "Too many authentication attempts. Please log in again to continue.",
}: ReloginPromptProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Authentication Required
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired due to too many authentication attempts.
              Please log in again to continue using the application.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            {onDismiss && (
              <Button variant="outline" onClick={onDismiss}>
                <X className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            )}
            <Button onClick={onRelogin} className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Log In Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
