"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, FileText } from "lucide-react";

interface MobileAddOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageUpload: () => void;
  onSelectManualForm: () => void;
}

export const MobileAddOptions = ({
  isOpen,
  onClose,
  onSelectImageUpload,
  onSelectManualForm,
}: MobileAddOptionsProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Add New Subscription</SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-3">
          <Button
            onClick={onSelectImageUpload}
            className="flex items-center justify-start gap-3 h-auto py-3 w-full"
            variant="outline"
          >
            <Camera className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Upload Receipt/Screenshot</span>
              <span className="text-xs text-muted-foreground">
                AI extracts details from image
              </span>
            </div>
          </Button>

          <Button
            onClick={onSelectManualForm}
            className="flex items-center justify-start gap-3 h-auto py-3 w-full"
            variant="outline"
          >
            <FileText className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Manual Entry</span>
              <span className="text-xs text-muted-foreground">
                Enter details manually
              </span>
            </div>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
