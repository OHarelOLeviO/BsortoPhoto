import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createPost, MAX_IMAGE_BYTES, uploadImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
};

/** Upload flow: pick an image → preview → confirm → storage + post row. */
export function UploadDialog({ open, onOpenChange, memberId }: UploadDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setUploading(false);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function handleFileChosen(chosen: File | undefined) {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) {
      toast.error("הקובץ שנבחר אינו תמונה.");
      return;
    }
    if (chosen.size > MAX_IMAGE_BYTES) {
      toast.error("התמונה גדולה מדי. הגודל המרבי הוא 10MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(chosen);
    setPreviewUrl(URL.createObjectURL(chosen));
  }

  async function handleConfirm() {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const path = await uploadImage(memberId, file);
      await createPost(memberId, path);
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", memberId] });
      toast.success("התמונה עלתה בהצלחה 🎉");
      handleClose(false);
    } catch {
      toast.error("ההעלאה נכשלה. נסה שוב.");
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>העלאת תמונה</DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileChosen(event.target.files?.[0])}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImagePlus className="size-10" />
            <span className="font-medium">בחרו תמונה מהמכשיר</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="תצוגה מקדימה"
                className="max-h-80 w-full rounded-2xl object-contain bg-muted"
              />
              <button
                type="button"
                onClick={reset}
                aria-label="הסרת התמונה"
                className="absolute end-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                החלפת תמונה
              </Button>
              <Button className="h-11 flex-1 rounded-xl" disabled={uploading} onClick={handleConfirm}>
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> מעלה…
                  </>
                ) : (
                  "אישור והעלאה"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
