"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { FormAlert, type AlertState } from "@/components/auth/form-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addListingPhoto, removeListingPhoto, setCoverPhoto } from "@/lib/listings/actions";
import type { ListingPhoto } from "@/lib/listings/queries";
import { createClient } from "@/lib/supabase/client";
import { LISTING_PHOTO_RULES } from "@/lib/validations/listing";

type PhotoManagerProps = {
  organizationId: string;
  propertyId: string;
  photos: ListingPhoto[];
};

const MAX_EDGE = 2000; // px; plenty for a full-width gallery, a fraction of a phone photo's size

/**
 * Uploads go straight from the browser to Supabase Storage (the file never
 * passes through our server), into <organization_id>/<property_id>/. Storage
 * policies only allow members of that organization to write there. The server
 * action then records the photo against the listing.
 */
export function PhotoManager({ organizationId, propertyId, photos }: PhotoManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const remaining = LISTING_PHOTO_RULES.maxPhotos - photos.length;

  async function upload(files: File[]) {
    setAlert(null);
    const batch = files.slice(0, Math.max(remaining, 0));
    if (batch.length === 0) {
      setAlert({ type: "error", message: `A listing can have up to ${LISTING_PHOTO_RULES.maxPhotos} photos.` });
      return;
    }

    const supabase = createClient();
    const failures: string[] = [];
    setProgress({ done: 0, total: batch.length });

    for (const [index, file] of batch.entries()) {
      try {
        const blob = await prepareImage(file);
        const path = `${organizationId}/${propertyId}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("property-images")
          .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
        if (error) throw new Error(error.message);
        const result = await addListingPhoto(propertyId, path);
        if (!result.ok) {
          await supabase.storage.from("property-images").remove([path]);
          throw new Error(result.message);
        }
      } catch (error) {
        console.error(error);
        failures.push(file.name);
      }
      setProgress({ done: index + 1, total: batch.length });
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    if (failures.length) {
      setAlert({
        type: "error",
        message: `${failures.length} photo${failures.length > 1 ? "s" : ""} couldn't be uploaded (${failures.join(", ")}). Use JPG, PNG or WebP files and try again.`,
      });
    } else if (files.length > batch.length) {
      setAlert({ type: "error", message: `Only the first ${batch.length} were added: the limit is ${LISTING_PHOTO_RULES.maxPhotos} photos.` });
    }
    startTransition(() => router.refresh());
  }

  async function run(id: string, action: () => Promise<{ ok: boolean; message?: string }>) {
    setBusyId(id);
    setAlert(null);
    const result = await action();
    if (!result.ok) setAlert({ type: "error", message: result.message ?? "Something went wrong." });
    startTransition(() => router.refresh());
    setBusyId(null);
  }

  return (
    <section className="space-y-4 rounded-lg border bg-background p-4 shadow-card sm:p-6" aria-labelledby="photos-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="photos-heading" className="text-base font-bold">
            Photos
          </h2>
          <p className="text-sm text-muted-foreground">
            The first photo is the cover. Up to {LISTING_PHOTO_RULES.maxPhotos}; large photos are resized automatically.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={!!progress || remaining <= 0}>
          {progress ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {progress ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…` : "Add photos"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => e.target.files && upload(Array.from(e.target.files))}
        />
      </div>

      <FormAlert state={alert} />

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <ImagePlus className="size-6" aria-hidden="true" />
          <span className="font-semibold text-foreground">Add photos</span>
          Listings with good photos get far more enquiries.
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <li key={photo.id} className="group relative overflow-hidden rounded-md border bg-muted">
              <div className="relative aspect-[4/3]">
                <Image src={photo.url} alt={`Photo ${index + 1}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>
              {index === 0 && (
                <Badge variant="gold" className="absolute left-2 top-2">
                  Cover
                </Badge>
              )}
              <div className="flex items-center justify-between gap-1 border-t bg-background p-1.5">
                {index === 0 ? (
                  <span className="px-2 text-xs text-muted-foreground">Shown on cards</span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busyId !== null}
                    onClick={() => run(photo.id, () => setCoverPhoto(propertyId, photo.id))}
                  >
                    <Star /> Make cover
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete photo ${index + 1}`}
                  disabled={busyId !== null}
                  onClick={() => run(photo.id, () => removeListingPhoto(photo.id))}
                >
                  {busyId === photo.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Downscales to MAX_EDGE and re-encodes as JPEG. Also strips location data embedded by phones. */
async function prepareImage(file: File): Promise<Blob> {
  if (!(LISTING_PHOTO_RULES.types as readonly string[]).includes(file.type)) {
    throw new Error(`${file.name}: unsupported type ${file.type || "unknown"}`);
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not available");
  context.fillStyle = "#ffffff"; // transparent PNGs get a white background
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Couldn't process the image");
  if (blob.size > LISTING_PHOTO_RULES.maxBytes) throw new Error(`${file.name} is too large`);
  return blob;
}
