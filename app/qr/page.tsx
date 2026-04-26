"use client";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
// Dynamically import to avoid SSR issues with canvas
const QRCode = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  { ssr: false },
);

export default function QRPage() {
  const [url, setUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "my-qr-code.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Generate QR Code
        </h1>

        <div ref={qrRef} className="flex justify-center mb-6">
          {url ? (
            <QRCode value={url} size={200} level="H" includeMargin />
          ) : (
            <div className="w-[200px] h-[200px] bg-muted flex items-center justify-center text-muted-foreground">
              Enter URL to see preview
            </div>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="url"
            placeholder="Enter your URL (e.g., https://renewal-guard.vercel.app)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
          <button
            onClick={downloadQR}
            disabled={!url}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
