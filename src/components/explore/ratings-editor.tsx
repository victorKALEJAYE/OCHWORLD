"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveDistrictRatings, type RatingsFormState } from "@/lib/explore/actions";
import { RATING_CATEGORIES } from "@/lib/explore/constants";
import type { DistrictRatings } from "@/lib/explore/queries";

/** Shown to platform admins only (and enforced by RLS): edit the team's scores for a district. */
export function RatingsEditor({ districtId, slug, ratings }: { districtId: number; slug: string; ratings: DistrictRatings }) {
  const [state, formAction, pending] = useActionState<RatingsFormState, FormData>(saveDistrictRatings, { status: "idle" });
  return (
    <details className="rounded-lg border border-dashed bg-background p-5">
      <summary className="cursor-pointer text-sm font-semibold">Edit ratings (OCHWORLD team only)</summary>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="districtId" value={districtId} />
        <input type="hidden" name="slug" value={slug} />
        {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}
        {state.status === "saved" && <FormAlert state={{ type: "success", message: "Ratings saved." }} />}
        {RATING_CATEGORIES.map(({ value, label }) => (
          <div key={value} className="grid gap-2 sm:grid-cols-[12rem_6rem_1fr] sm:items-center">
            <label htmlFor={`score_${value}`} className="text-sm font-medium">
              {label}
            </label>
            <Select id={`score_${value}`} name={`score_${value}`} defaultValue={ratings[value]?.score ?? ""}>
              <option value="">Not rated</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <Input name={`note_${value}`} maxLength={300} placeholder="Short note (shown publicly)" defaultValue={ratings[value]?.note} aria-label={`${label} note`} />
          </div>
        ))}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Save ratings
        </Button>
      </form>
    </details>
  );
}
