import { Heart } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { toggleSavedProperty } from "@/lib/properties/actions";
import { cn } from "@/lib/utils";

/**
 * Save / unsave a listing. Works as a plain form post: signed-out visitors are
 * redirected to sign in by the server action and returned here afterwards.
 */
export function SaveButton({ propertyId, slug, saved }: { propertyId: string; slug: string; saved: boolean }) {
  return (
    <form action={toggleSavedProperty}>
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="saved" value={String(saved)} />
      <SubmitButton variant="outline" className="w-full" aria-pressed={saved}>
        <Heart className={cn(saved && "fill-primary text-primary")} aria-hidden="true" />
        {saved ? "Saved" : "Save property"}
      </SubmitButton>
    </form>
  );
}
