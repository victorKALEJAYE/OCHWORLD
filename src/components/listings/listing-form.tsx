"use client";

import { startTransition, useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input, fieldClasses } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/format";
import { saveListing, type ListingFormState } from "@/lib/listings/actions";
import type { DistrictOption, EditableListing } from "@/lib/listings/queries";
import { PROPERTY_TYPE_LABELS } from "@/lib/properties/constants";
import type { PropertyType } from "@/lib/properties/types";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_CATEGORY } from "@/lib/validations/listing";

type ListingFormProps = {
  organizationId: string;
  districts: DistrictOption[];
  /** Omit to create a new listing. */
  listing?: EditableListing;
};

const GROUPS: { label: string; category: string }[] = [
  { label: "Homes", category: "residential" },
  { label: "Commercial", category: "commercial" },
  { label: "Land", category: "land" },
];

/**
 * Create / edit form for a listing. The server action validates again
 * (lib/validations/listing.ts) and RLS decides whether the user may save.
 *
 * Submitted through onSubmit (not `action=`) so React doesn't clear the form
 * when the server sends back validation errors.
 */
export function ListingForm({ organizationId, districts, listing }: ListingFormProps) {
  const [state, formAction, pending] = useActionState<ListingFormState, FormData>(saveListing, { status: "idle" });
  const [listingType, setListingType] = useState(listing?.listingType ?? "sale");
  const [propertyType, setPropertyType] = useState<PropertyType | "">(listing?.propertyType ?? "");
  const [price, setPrice] = useState(listing ? String(listing.price) : "");

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const isLand = propertyType === "land";
  const isCommercial = propertyType !== "" && PROPERTY_TYPE_CATEGORY[propertyType] === "commercial";
  const priceNumber = Number(price.replace(/[,\s₦]/g, ""));
  const isNew = !listing;
  const isPublished = listing?.status === "published";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <input type="hidden" name="organizationId" value={organizationId} />
      {listing && <input type="hidden" name="propertyId" value={listing.id} />}

      {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}
      {state.status === "saved" && <FormAlert state={{ type: "success", message: state.message }} />}

      <Fieldset title="The basics">
        <FormField id="title" label="Listing title" error={errors.title} hint="e.g. 4-bedroom terrace duplex with BQ">
          <Input id="title" name="title" defaultValue={listing?.title} maxLength={120} aria-invalid={!!errors.title} required />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="listingType" label="For" error={errors.listingType}>
            <Select
              id="listingType"
              name="listingType"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as "sale" | "rent")}
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </Select>
          </FormField>
          <FormField id="propertyType" label="Property type" error={errors.propertyType}>
            <Select
              id="propertyType"
              name="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              aria-invalid={!!errors.propertyType}
              required
            >
              <option value="" disabled>
                Choose…
              </option>
              {GROUPS.map((group) => (
                <optgroup key={group.category} label={group.label}>
                  {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[])
                    .filter((t) => PROPERTY_TYPE_CATEGORY[t] === group.category)
                    .map((t) => (
                      <option key={t} value={t}>
                        {PROPERTY_TYPE_LABELS[t]}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="price"
            label={listingType === "rent" ? "Rent (₦)" : "Price (₦)"}
            error={errors.price}
            hint={priceNumber > 0 ? formatNaira(priceNumber) : "Whole naira, e.g. 150,000,000"}
          >
            <Input
              id="price"
              name="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={!!errors.price}
              required
            />
          </FormField>
          {listingType === "rent" && (
            <FormField id="rentPeriod" label="Rent is paid" error={errors.rentPeriod}>
              <Select id="rentPeriod" name="rentPeriod" defaultValue={listing?.rentPeriod ?? "year"}>
                <option value="year">Per year</option>
                <option value="month">Per month</option>
              </Select>
            </FormField>
          )}
        </div>
      </Fieldset>

      <Fieldset title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="districtId" label="District" error={errors.districtId}>
            <Select
              id="districtId"
              name="districtId"
              defaultValue={listing?.districtId ?? ""}
              aria-invalid={!!errors.districtId}
              required
            >
              <option value="" disabled>
                Choose a district…
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="address" label="Street or area (optional)" error={errors.address} hint="Shown publicly. Leave out the house number if you prefer.">
            <Input id="address" name="address" defaultValue={listing?.address} maxLength={200} />
          </FormField>
        </div>
      </Fieldset>

      <Fieldset title="Details">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {!isLand && !isCommercial && (
            <FormField id="bedrooms" label="Bedrooms" error={errors.bedrooms}>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} max={50} inputMode="numeric" defaultValue={listing?.bedrooms} />
            </FormField>
          )}
          {!isLand && (
            <FormField id="bathrooms" label={isCommercial ? "Toilets" : "Bathrooms"} error={errors.bathrooms}>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} max={50} inputMode="numeric" defaultValue={listing?.bathrooms} />
            </FormField>
          )}
          <FormField id="areaSqm" label={isLand ? "Plot size (m²)" : "Floor area (m²)"} error={errors.areaSqm}>
            <Input id="areaSqm" name="areaSqm" inputMode="numeric" defaultValue={listing?.areaSqm} />
          </FormField>
        </div>

        {!isLand && (
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="isFurnished"
              defaultChecked={listing?.isFurnished}
              className="size-4 rounded border-input accent-primary"
            />
            Furnished
          </label>
        )}

        <FormField id="description" label="Description" error={errors.description}>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={listing?.description}
            className={cn(fieldClasses, "h-auto resize-y py-2.5")}
          />
        </FormField>

        <FormField
          id="features"
          label="Features"
          error={errors.features}
          hint="One per line or separated by commas: Boys' quarters, Swimming pool, Prepaid meter…"
        >
          <textarea
            id="features"
            name="features"
            rows={3}
            defaultValue={listing?.features.join("\n")}
            className={cn(fieldClasses, "h-auto resize-y py-2.5")}
          />
        </FormField>
      </Fieldset>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />}
        {isNew ? (
          // New listings start as drafts; the agent adds photos, then publishes.
          <Button type="submit" name="intent" value="draft" disabled={pending}>
            Save and add photos
          </Button>
        ) : (
          <>
            <Button type="submit" name="intent" value="save" variant={isPublished ? "primary" : "outline"} disabled={pending}>
              Save changes
            </Button>
            {!isPublished && (
              <Button type="submit" name="intent" value="publish" disabled={pending}>
                Save and publish
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border bg-background p-4 shadow-card sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden="true" className="text-base font-bold">
        {title}
      </h2>
      {children}
    </fieldset>
  );
}
