"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateEnquiryStatus } from "@/lib/enquiries/actions";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
] as const;

/** Changes an enquiry's status as soon as a new value is picked. */
export function EnquiryStatusSelect({ enquiryId, status }: { enquiryId: string; status: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={updateEnquiryStatus} className="flex items-center gap-2">
      <input type="hidden" name="enquiryId" value={enquiryId} />
      <StatusField status={status} onPick={() => formRef.current?.requestSubmit()} />
      <noscript>
        <button type="submit" className="text-xs underline">
          Update
        </button>
      </noscript>
    </form>
  );
}

function StatusField({ status, onPick }: { status: string; onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <label className="relative">
      <span className="sr-only">Status</span>
      <select
        name="status"
        defaultValue={status}
        onChange={onPick}
        disabled={pending}
        className={cn(
          "h-8 rounded-sm border bg-background px-2 text-xs font-semibold",
          status === "new" && "border-primary",
          pending && "opacity-60"
        )}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
