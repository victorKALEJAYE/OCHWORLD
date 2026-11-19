"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setFavourite } from "@/lib/properties/actions";
import { cn } from "@/lib/utils";

type FavouriteButtonProps = {
  propertyId: string;
  initialFavourite: boolean;
  /** "icon": round heart on property cards. "full": labelled button on the property page. */
  variant?: "icon" | "full";
  className?: string;
};

/**
 * Heart toggle for favourites. Updates instantly (optimistic) and rolls back if
 * the server refuses. Signed-out visitors are taken to sign in and brought back
 * to the page they were on.
 */
export function FavouriteButton({ propertyId, initialFavourite, variant = "icon", className }: FavouriteButtonProps) {
  const [favourite, setFavouriteState] = useState(initialFavourite);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  function toggle(event: React.MouseEvent) {
    // Cards are links; the heart must not open the property.
    event.preventDefault();
    event.stopPropagation();

    const next = !favourite;
    setFavouriteState(next);
    startTransition(async () => {
      const result = await setFavourite(propertyId, next);
      if (result.status === "ok") {
        setMessage(next ? "Added to favourites" : "Removed from favourites");
        return;
      }
      setFavouriteState(!next);
      if (result.status === "signed-out") {
        const back = window.location.pathname + window.location.search;
        router.push(`/sign-in?next=${encodeURIComponent(back)}`);
      } else {
        setMessage("Couldn't update favourites. Please try again.");
      }
    });
  }

  const label = favourite ? "Remove from favourites" : "Add to favourites";
  const heart = (
    <Heart
      aria-hidden="true"
      className={cn("transition-colors", favourite ? "fill-primary text-primary" : "text-foreground")}
    />
  );

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-pressed={favourite}
          aria-label={label}
          title={label}
          className={cn("size-9 rounded-full border-0 bg-background/95 shadow-card hover:bg-background", className)}
        >
          {heart}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={toggle}
          aria-pressed={favourite}
          disabled={pending}
          className={cn("w-full", className)}
        >
          {heart}
          {favourite ? "In your favourites" : "Add to favourites"}
        </Button>
      )}
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
