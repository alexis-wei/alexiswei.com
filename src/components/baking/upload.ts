"use client";

import type { UploadPurpose } from "@/lib/baking/types";

const GUESSED_TYPES: Record<string, string> = {
  mov: "video/quicktime",
  mp4: "video/mp4",
  heic: "image/heic",
  heif: "image/heif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function contentTypeOf(blob: Blob, filename?: string) {
  if (blob.type) return blob.type;
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  return GUESSED_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Uploads a file straight to storage and returns its key. Uses XHR rather
 * than fetch because fetch can't report upload progress.
 */
export async function uploadFile(
  blob: Blob,
  options: {
    purpose: UploadPurpose;
    logId?: string;
    recipeId?: string;
    filename?: string;
  },
  onProgress?: (fraction: number) => void,
) {
  const contentType = contentTypeOf(blob, options.filename);
  const response = await fetch("/api/baking/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...options, contentType }),
  });
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: null }));
    throw new Error(error ?? "Upload failed");
  }
  const { key, uploadUrl } = (await response.json()) as {
    key: string;
    uploadUrl: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    // Keys are unique, so files can be cached forever.
    xhr.setRequestHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () =>
      reject(new Error("Upload failed — check your connection"));
    xhr.send(blob);
  });

  return key;
}
