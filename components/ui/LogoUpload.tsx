"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast-context";
import type { ApiResult } from "@/lib/api-client";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

export function LogoUpload<TData extends { logoUrl: string | null }>({
  currentLogoUrl,
  upload,
  onUploaded,
}: {
  currentLogoUrl: string | null;
  upload: UseMutationResult<ApiResult<TData>, Error, File>;
  onUploaded?: (logoUrl: string, file: File) => void;
}) {
  const { notify } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      notify("error", "Logo must be a PNG, JPEG, SVG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      notify("error", "Logo must be 2MB or smaller.");
      return;
    }
    upload.mutate(file, {
      onSuccess: (result) => {
        notify("success", "Logo uploaded.");
        onUploaded?.(result.data.logoUrl ?? "", file);
      },
      onError: (error: Error) => notify("error", error.message),
    });
  };

  return (
    <div className="flex items-center gap-3">
      {currentLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentLogoUrl} alt="" className="h-12 w-12 rounded-lg border border-surface-border object-contain p-1.5" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-surface-border text-ink-500">
          <Upload className="h-4 w-4" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <Button type="button" variant="secondary" className="h-9 px-3 text-xs" loading={upload.isPending} onClick={() => inputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5" />
        {currentLogoUrl ? "Replace logo" : "Upload logo"}
      </Button>
    </div>
  );
}
