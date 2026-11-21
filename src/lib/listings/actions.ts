"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LISTING_PHOTO_RULES, PROPERTY_TYPE_CATEGORY, listingSchema } from "@/lib/validations/listing";

/**
 * Listing management for organization members. Every write runs as the
 * signed-in user, so RLS decides what is allowed:
 *   - members create and edit their organization's listings and photos
 *   - only owners/admins delete listings
 *   - only platform admins can feature (database trigger)
 * The checks here exist to give clear messages, not for security.
 */

const BUCKET = "property-images";
const uuid = z.string().uuid();

export type ListingFormState =
  | { status: "idle" }
  | { status: "saved"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

export type ActionResult = { ok: true } | { ok: false; message: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** Readable and unique: "4-bedroom-terrace-duplex-k3x9q2". Never changes after creation, so shared links keep working. */
function newSlug(title: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `${slugify(title) || "listing"}-${suffix}`;
}

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/properties");
  if (slug) revalidatePath(`/properties/${slug}`);
  revalidatePath("/dashboard", "layout");
}

function friendlyError(error: { code?: string; message?: string }) {
  console.error("listing action failed", error);
  if (error.code === "42501") return "You don't have permission to do that for this organization.";
  if (error.code === "23514") return "Some details don't meet the listing rules. Check the form and try again.";
  return "Something went wrong saving your changes. Please try again.";
}

/** Create (no `propertyId`) or update a listing. The submit button's `intent` decides draft vs publish. */
export async function saveListing(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const rawId = formData.get("propertyId");
  const propertyId = typeof rawId === "string" && rawId ? rawId : undefined;
  const intent = formData.get("intent");

  const parsed = listingSchema.safeParse({
    organizationId: formData.get("organizationId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    listingType: formData.get("listingType"),
    propertyType: formData.get("propertyType"),
    districtId: formData.get("districtId"),
    price: formData.get("price"),
    rentPeriod: formData.get("rentPeriod") || undefined,
    address: formData.get("address") || undefined,
    bedrooms: formData.get("bedrooms"),
    bathrooms: formData.get("bathrooms"),
    areaSqm: formData.get("areaSqm"),
    isFurnished: formData.get("isFurnished") === "on",
    features: formData.get("features") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
    );
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }
  if (propertyId !== undefined && !uuid.safeParse(propertyId).success) {
    return { status: "error", message: "This listing can't be found." };
  }

  const v = parsed.data;
  const fields = {
    title: v.title,
    description: v.description || null,
    listing_type: v.listingType,
    category: PROPERTY_TYPE_CATEGORY[v.propertyType],
    property_type: v.propertyType,
    district_id: v.districtId,
    price: v.price,
    rent_period: v.listingType === "rent" ? (v.rentPeriod ?? "year") : null,
    address: v.address || null,
    bedrooms: v.bedrooms ?? null,
    bathrooms: v.bathrooms ?? null,
    area_sqm: v.areaSqm ?? null,
    is_furnished: v.isFurnished,
    features: v.features,
  };

  const supabase = await createClient();

  if (!propertyId) {
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...fields,
        organization_id: v.organizationId,
        slug: newSlug(v.title),
        status: intent === "publish" ? "published" : "draft",
      })
      .select("id, slug")
      .single();
    if (error) return { status: "error", message: friendlyError(error) };
    refreshPublicPages(data.slug);
    // Straight on to photos.
    redirect(`/dashboard/listings/${data.id}/edit?created=1`);
  }

  const update = intent === "publish" ? { ...fields, status: "published" as const } : fields;
  const { data, error } = await supabase
    .from("properties")
    .update(update)
    .eq("id", propertyId)
    .select("slug, status")
    .maybeSingle();
  if (error) return { status: "error", message: friendlyError(error) };
  if (!data) return { status: "error", message: "You can't edit this listing." };

  refreshPublicPages(data.slug);
  return {
    status: "saved",
    message: intent === "publish" ? "Published. The listing is now live." : "Changes saved.",
  };
}

const STATUSES = ["draft", "published", "archived"] as const;

/** Publish, unpublish (back to draft) or archive. Used by plain form buttons. */
export async function setListingStatus(formData: FormData): Promise<void> {
  const id = uuid.safeParse(formData.get("propertyId"));
  const status = z.enum(STATUSES).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ status: status.data })
    .eq("id", id.data)
    .select("slug")
    .maybeSingle();
  if (error) console.error("setListingStatus failed", error);
  refreshPublicPages(data?.slug);
}

/** Deletes a listing and its photo files. Owners and admins only (RLS). */
export async function deleteListing(formData: FormData): Promise<void> {
  const id = uuid.safeParse(formData.get("propertyId"));
  const org = formData.get("organizationId");
  if (!id.success) return;

  const supabase = await createClient();
  const { data: photos } = await supabase.from("property_images").select("storage_path").eq("property_id", id.data);

  const { data: deleted, error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id.data)
    .select("slug")
    .maybeSingle();
  if (error) console.error("deleteListing failed", error);

  if (deleted) {
    const paths = (photos ?? []).flatMap((p) => (p.storage_path ? [p.storage_path] : []));
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
      if (storageError) console.error("deleteListing: photo files not removed", storageError);
    }
    refreshPublicPages(deleted.slug);
  }
  redirect(`/dashboard/listings?org=${typeof org === "string" ? encodeURIComponent(org) : ""}&${deleted ? "deleted=1" : "error=delete"}`);
}

/**
 * Records a photo the browser has just uploaded to Storage. The path must sit
 * in this listing's folder: <organization_id>/<property_id>/<file>.
 */
export async function addListingPhoto(propertyId: string, storagePath: string): Promise<ActionResult> {
  if (!uuid.safeParse(propertyId).success) return { ok: false, message: "Listing not found." };

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("organization_id, title, slug, property_images(position)")
    .eq("id", propertyId)
    .maybeSingle();
  if (!property) return { ok: false, message: "Listing not found." };

  const expected = new RegExp(`^${property.organization_id}/${propertyId}/[a-z0-9-]+\\.(jpg|jpeg|png|webp)$`);
  if (!expected.test(storagePath)) return { ok: false, message: "That upload doesn't belong to this listing." };

  const images = (property as unknown as { property_images: { position: number }[] }).property_images;
  if (images.length >= LISTING_PHOTO_RULES.maxPhotos) {
    return { ok: false, message: `A listing can have up to ${LISTING_PHOTO_RULES.maxPhotos} photos.` };
  }

  const url = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const position = images.reduce((max, i) => Math.max(max, i.position + 1), 0);
  const { error } = await supabase
    .from("property_images")
    .insert({ property_id: propertyId, url, storage_path: storagePath, alt: property.title, position });
  if (error) return { ok: false, message: friendlyError(error) };

  refreshPublicPages(property.slug);
  return { ok: true };
}

export async function removeListingPhoto(imageId: string): Promise<ActionResult> {
  if (!uuid.safeParse(imageId).success) return { ok: false, message: "Photo not found." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .select("storage_path, property:properties(slug)")
    .maybeSingle();
  if (error) return { ok: false, message: friendlyError(error) };
  if (!data) return { ok: false, message: "Photo not found." };

  if (data.storage_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([data.storage_path]);
    if (storageError) console.error("removeListingPhoto: file not removed", storageError);
  }
  refreshPublicPages((data as unknown as { property: { slug: string } | null }).property?.slug);
  return { ok: true };
}

/** Moves a photo to the front. The first photo is the one shown on cards. */
export async function setCoverPhoto(propertyId: string, imageId: string): Promise<ActionResult> {
  if (!uuid.safeParse(propertyId).success || !uuid.safeParse(imageId).success) {
    return { ok: false, message: "Photo not found." };
  }
  const supabase = await createClient();
  const { data: photos, error } = await supabase
    .from("property_images")
    .select("id, position")
    .eq("property_id", propertyId)
    .order("position");
  if (error) return { ok: false, message: friendlyError(error) };
  if (!photos.some((p) => p.id === imageId)) return { ok: false, message: "Photo not found." };

  const ordered = [imageId, ...photos.map((p) => p.id).filter((id) => id !== imageId)];
  const results = await Promise.all(
    ordered.map((id, position) => supabase.from("property_images").update({ position }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, message: friendlyError(failed.error) };

  const { data: property } = await supabase.from("properties").select("slug").eq("id", propertyId).maybeSingle();
  refreshPublicPages(property?.slug);
  return { ok: true };
}
