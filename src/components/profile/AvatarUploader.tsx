"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";

type AvatarUploaderProps = {
  imageUrl?: string | null;
  fallback: string;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
};

export function AvatarUploader({
  imageUrl,
  fallback,
  onUploaded,
  onError,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex items-center gap-6 py-4 border-b border-gray-100 mt-8">
      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Profile"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-semibold text-gray-600">
            {fallback || "U"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3 items-center">
          <UploadButton
            endpoint="avatar"
            className="ut-button"
            appearance={{
              button:
                "h-8 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50",
              allowedContent: "hidden",
            }}
            content={{
              button: isUploading ? "Uploading..." : "Change Photo",
            }}
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={(res) => {
              setIsUploading(false);
              const url = res?.[0]?.url;
              if (!url) {
                onError?.("Upload failed. Please try again.");
                return;
              }
              onUploaded(url);
            }}
            onUploadError={(error) => {
              setIsUploading(false);
              onError?.(error.message || "Upload failed. Please try again.");
            }}
          />
        </div>
        <p className="text-xs text-gray-400">JPG, GIF or PNG. 2MB Max.</p>
      </div>
    </div>
  );
}
