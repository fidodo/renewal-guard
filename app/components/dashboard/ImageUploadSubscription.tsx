"use client";
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Camera } from "lucide-react";
import { useAppDispatch } from "@/app/hooks/redux";
import { createSubscription } from "@/app/store/slices/subscriptionSlice";

interface ImageUploadSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExtractedData {
  name: string;
  serviceName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  confidence?: number;
}

export const ImageUploadSubscription = ({
  isOpen,
  onClose,
  onSuccess,
}: ImageUploadSubscriptionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Check file type
        if (!file.type.startsWith("image/")) {
          setError("Please select an image file");
          return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Image size should be less than 5MB");
          return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
      }
    },
    [],
  );

  const handleExtractInfo = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/subscriptions/extract-from-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract information");
      }

      const result = await response.json();
      setExtractedData(result.data);
    } catch (err) {
      console.error("Extraction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to extract information",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmSubscription = async () => {
    if (!extractedData) return;

    try {
      const token = localStorage.getItem("token");
      const subscriptionData = {
        name: extractedData.name,
        serviceName: extractedData.serviceName || extractedData.name,
        category: extractedData.category || "other",
        price: {
          amount: extractedData.amount,
          currency: extractedData.currency || "USD",
          billingCycle: extractedData.billingCycle || "monthly",
        },
        billingDate: {
          startDate: new Date().toISOString(),
          nextBillingDate:
            extractedData.nextBillingDate || new Date().toISOString(),
        },
        paymentMethod: "Auto-detected",
        autoRenew: true,
        sendReminders: true,
        status: "active",
      };

      const response = await fetch("/api/v1/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const result = await response.json();
      const savedSubscription = result.data?.subscription || result.data;
      dispatch(createSubscription(savedSubscription));

      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Error creating subscription:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create subscription",
      );
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    onClose();
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Subscription Receipt</DialogTitle>
          <DialogDescription>
            Take a photo or upload a screenshot of your subscription receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!previewUrl && !extractedData && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                capture="environment"
              />
              <Label htmlFor="image-upload">
                <div className="cursor-pointer flex flex-col items-center gap-3">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <Button variant="outline" asChild>
                      <span>Take Photo or Upload Image</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG (Max 5MB)
                  </p>
                </div>
              </Label>
            </div>
          )}

          {previewUrl && !extractedData && (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={256}
                  height={256}
                  className="max-h-64 mx-auto rounded-lg border"
                  unoptimized={true}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRetake}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleExtractInfo}
                disabled={isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Information...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Extract Subscription Details
                  </>
                )}
              </Button>
            </div>
          )}

          {extractedData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-2">
                  ✓ Information Extracted Successfully
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{extractedData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {extractedData.currency} {extractedData.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Billing Cycle:
                    </span>
                    <span className="font-medium capitalize">
                      {extractedData.billingCycle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Billing:</span>
                    <span className="font-medium">
                      {new Date(
                        extractedData.nextBillingDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {extractedData.confidence && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">
                        {(extractedData.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex-1"
                >
                  Retake Photo
                </Button>
                <Button onClick={handleConfirmSubscription} className="flex-1">
                  Confirm & Add
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
