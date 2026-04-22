"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, FileText } from "lucide-react";

interface AddSubscriptionOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageUpload: () => void;
  onSelectManualForm: () => void;
}

export const AddSubscriptionOptions = ({
  isOpen,
  onClose,
  onSelectImageUpload,
  onSelectManualForm,
}: AddSubscriptionOptionsProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Common options buttons component to avoid duplication
  const OptionsButtons = () => (
    <div className="flex flex-col gap-3">
      <Button
        onClick={onSelectImageUpload}
        className="flex items-center justify-start gap-3 h-auto py-4 px-4 text-base w-full"
        variant="outline"
      >
        <Camera className="w-5 h-5 flex-shrink-0" />
        <div className="flex flex-col items-start text-left flex-1">
          <span className="font-semibold text-sm sm:text-base">
            Upload Receipt/Screenshot
          </span>
          <span className="text-xs text-muted-foreground">
            {isMobile
              ? "AI extracts details from image"
              : "Take a photo or upload image - AI will extract details"}
          </span>
        </div>
      </Button>

      <Button
        onClick={onSelectManualForm}
        className="flex items-center justify-start gap-3 h-auto py-4 px-4 text-base w-full"
        variant="outline"
      >
        <FileText className="w-5 h-5 flex-shrink-0" />
        <div className="flex flex-col items-start text-left flex-1">
          <span className="font-semibold text-sm sm:text-base">
            Manual Entry
          </span>
          <span className="text-xs text-muted-foreground">
            {isMobile
              ? "Enter subscription details"
              : "Fill in subscription details manually"}
          </span>
        </div>
      </Button>
    </div>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0">
          <SheetHeader className="p-4 border-b text-center">
            <SheetTitle>Add New Subscription</SheetTitle>
            <SheetDescription>
              Choose how you want to add your subscription
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <OptionsButtons />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog Modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
          <DialogDescription>
            Choose how you want to add your subscription
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <OptionsButtons />
        </div>
      </DialogContent>
    </Dialog>
  );
};
