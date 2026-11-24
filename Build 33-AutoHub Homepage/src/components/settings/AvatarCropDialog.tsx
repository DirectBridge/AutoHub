import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Circular crop preview with zoom. Produces a 320px square JPEG data URL. */
export function AvatarCropDialog({
  src,
  onApply,
  onClose,
}: {
  src: string;
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const image = useRef<HTMLImageElement>(null);

  const apply = () => {
    const img = image.current;
    if (!img) return;
    const size = 320;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const side = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    canvas.getContext("2d")?.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    onApply(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <Dialog label="Crop your photo" onClose={onClose} className="max-w-[26rem]">
      <div className="p-6">
        <h2 className="pr-10 text-xl font-semibold leading-7">Crop your photo</h2>
        <p className="mt-1 text-sm text-text-secondary">Zoom to frame your face in the circle.</p>
        <div className="mt-6 flex justify-center">
          <div className="relative size-56 overflow-hidden rounded-full border bg-muted-soft">
            <img
              ref={image}
              src={src}
              alt="Crop preview"
              className="size-full object-cover"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>
        <label className="mt-6 grid gap-2 text-sm font-semibold text-text-primary">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            aria-valuetext={`${Math.round(zoom * 100)}%`}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-accent"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={apply}>Apply</Button>
        </div>
      </div>
    </Dialog>
  );
}
