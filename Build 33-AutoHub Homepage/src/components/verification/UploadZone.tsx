import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  /** Small JPEG thumbnail for images. */
  preview?: string;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];

export const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function thumbnail(file: File): Promise<string | undefined> {
  if (!file.type.startsWith("image/")) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
}

/** Document upload zone backed by a real file input (keyboard: focus it and press Enter/Space). */
export function UploadZone({
  label,
  value,
  onChange,
}: {
  label: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(undefined);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => () => window.clearInterval(timer.current), []);

  const start = (file?: File) => {
    setError("");
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file type. Use JPG, PNG or PDF.");
      setAnnouncement("Upload failed: unsupported file type.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      setAnnouncement("Upload failed: file is too large.");
      return;
    }
    setUploading({ name: file.name, progress: 0 });
    setAnnouncement(`Uploading ${file.name}`);
    const preview = thumbnail(file);
    let progress = 0;
    timer.current = window.setInterval(() => {
      progress = Math.min(100, progress + 12);
      setUploading({ name: file.name, progress });
      if (progress === 100) {
        window.clearInterval(timer.current);
        preview.then((thumb) => {
          setUploading(null);
          onChange({ name: file.name, size: file.size, type: file.type, preview: thumb });
          setAnnouncement(`${file.name} uploaded`);
        });
      }
    }, 110);
  };

  const cancel = () => {
    window.clearInterval(timer.current);
    setUploading(null);
    setAnnouncement("Upload cancelled");
  };

  const describedBy = error ? `${id}-error` : `${id}-hint`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-text-primary">{label}</p>
      <input
        ref={input}
        id={id}
        type="file"
        accept={ACCEPTED.join(",")}
        aria-label={`${label}: upload a JPG, PNG or PDF file`}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="peer sr-only"
        onChange={(event) => {
          start(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center gap-4 rounded-card border bg-surface p-4">
          {value.preview ? (
            <img
              src={value.preview}
              alt={`${label} preview`}
              className="h-16 w-24 shrink-0 rounded-button border object-cover"
            />
          ) : (
            <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-button border bg-muted-soft text-primary">
              <FileText aria-hidden className="size-7" strokeWidth={1.5} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-text-primary">
              <CheckCircle2 aria-hidden className="size-4 shrink-0 text-success" />
              <span className="truncate">{value.name}</span>
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">{formatSize(value.size)}</p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => input.current?.click()}
              >
                Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : uploading ? (
        <div className="flex h-45 flex-col justify-center rounded-card border-2 border-dashed border-accent bg-surface px-6">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-text-primary">{uploading.name}</span>
            <button
              type="button"
              onClick={cancel}
              aria-label="Cancel upload"
              className="flex size-8 items-center justify-center rounded-md text-secondary hover:bg-muted-soft"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            role="progressbar"
            aria-label={`Uploading ${uploading.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploading.progress}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted-soft"
          >
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${uploading.progress}%` }}
            />
          </div>
          <p className="price mt-2 text-xs text-text-secondary">{uploading.progress}%</p>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            start(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex h-45 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-secondary/40 bg-surface px-6 text-center hover:border-secondary peer-focus-visible:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/20",
            dragOver && "border-accent bg-accent-soft",
            error && "border-danger",
          )}
        >
          <UploadCloud
            aria-hidden
            className={cn("size-8", dragOver ? "text-accent-hover" : "text-secondary")}
            strokeWidth={1.5}
          />
          <span className="text-sm font-medium text-text-primary">
            Drag and drop or <span className="font-semibold text-accent">browse</span>
          </span>
          <span id={`${id}-hint`} className="text-xs text-text-secondary">
            JPG, PNG or PDF · max 5 MB
          </span>
        </label>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-danger"
        >
          <AlertCircle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
