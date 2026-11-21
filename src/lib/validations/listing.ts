import { z } from "zod";
import type { PropertyCategory, PropertyType } from "@/lib/properties/types";

/** The category follows from the property type, so agents pick one thing, not two. */
export const PROPERTY_TYPE_CATEGORY: Record<PropertyType, PropertyCategory> = {
  apartment: "residential",
  duplex: "residential",
  detached_house: "residential",
  semi_detached_house: "residential",
  terrace: "residential",
  bungalow: "residential",
  penthouse: "residential",
  land: "land",
  office: "commercial",
  shop: "commercial",
  warehouse: "commercial",
};

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_CATEGORY) as [PropertyType, ...PropertyType[]];

/** Empty form fields arrive as "", which means "not given". */
const optionalCount = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number({ invalid_type_error: "Enter a number" }).int("Whole numbers only").min(0).max(50).optional()
);

/** Accepts "650,000,000" or "650000000". */
const naira = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/[,\s₦]/g, "") : v),
  z.coerce
    .number({ invalid_type_error: "Enter the price in naira" })
    .int("Whole naira only")
    .positive("Enter the price in naira")
    .max(1_000_000_000_000, "That price looks too high")
);

/** Shared by the listing form and the server action. Mirrors the database checks. */
export const listingSchema = z
  .object({
    organizationId: z.string().uuid(),
    title: z.string().trim().min(5, "Give the listing a title (at least 5 characters)").max(120),
    description: z.string().trim().max(5000, "Keep the description under 5,000 characters").optional(),
    listingType: z.enum(["sale", "rent"], { message: "Choose sale or rent" }),
    propertyType: z.enum(PROPERTY_TYPES, { message: "Choose a property type" }),
    districtId: z.coerce.number({ invalid_type_error: "Choose a district" }).int().positive("Choose a district"),
    price: naira,
    rentPeriod: z.enum(["year", "month"]).optional(),
    address: z.string().trim().max(200).optional(),
    bedrooms: optionalCount,
    bathrooms: optionalCount,
    areaSqm: z.preprocess(
      (v) => (v === "" || v == null ? undefined : typeof v === "string" ? v.replace(/,/g, "") : v),
      z.coerce.number({ invalid_type_error: "Enter a number" }).int().positive().max(10_000_000).optional()
    ),
    isFurnished: z.boolean(),
    /** One feature per line or comma-separated. */
    features: z
      .string()
      .optional()
      .transform((v) =>
        Array.from(
          new Set(
            (v ?? "")
              .split(/[\n,]/)
              .map((f) => f.trim())
              .filter(Boolean)
          )
        )
      )
      .pipe(
        z
          .array(z.string().max(40, "Keep each feature under 40 characters"))
          .max(20, "List up to 20 features")
      ),
  })
  .refine((v) => v.listingType === "sale" || v.rentPeriod, {
    path: ["rentPeriod"],
    message: "Choose per year or per month",
  });

export type ListingValues = z.infer<typeof listingSchema>;

export const LISTING_PHOTO_RULES = {
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
  maxPhotos: 20,
} as const;
