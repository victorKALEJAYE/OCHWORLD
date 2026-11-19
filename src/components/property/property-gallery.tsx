import Image from "next/image";
import { Building2 } from "lucide-react";
import type { PropertyImage } from "@/lib/properties/types";
import { cn } from "@/lib/utils";

/**
 * One large photo and up to four smaller ones. With no photos, a neutral
 * placeholder keeps the page layout intact.
 */
export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  if (images.length === 0) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-lg bg-muted text-muted-foreground sm:aspect-[21/9]">
        <div className="flex flex-col items-center gap-2 text-sm">
          <Building2 className="size-10" aria-hidden="true" />
          No photos yet
        </div>
      </div>
    );
  }

  const [main, ...rest] = images;
  const thumbs = rest.slice(0, 4);

  return (
    <div className={cn("grid gap-2 overflow-hidden rounded-lg", thumbs.length > 0 && "md:grid-cols-4 md:grid-rows-2")}>
      <div className={cn("relative aspect-[4/3] bg-muted", thumbs.length > 0 && "md:col-span-2 md:row-span-2 md:aspect-auto")}>
        <Image src={main.url} alt={main.alt || title} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      {thumbs.map((img, i) => (
        <div key={img.url} className="relative hidden aspect-[4/3] bg-muted md:block">
          <Image src={img.url} alt={img.alt || `${title}, photo ${i + 2}`} fill sizes="25vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
