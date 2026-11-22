import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDetailView } from "@/components/property/property-detail-view";
import { getViewer } from "@/lib/auth/viewer";
import { formatPrice } from "@/lib/format";
import { getFavouriteIds, getPropertyBySlug, getSimilarProperties, isPropertySaved } from "@/lib/properties/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug).catch(() => null);
  if (!property) return { title: "Property not found" };

  const description = `${formatPrice(property.price, property.rentPeriod)} · ${property.district}, Abuja. ${
    property.description?.slice(0, 140) ?? ""
  }`.trim();
  return {
    title: `${property.title} in ${property.district}`,
    description,
    openGraph: { title: property.title, description, images: property.images.slice(0, 1).map((i) => i.url) },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug); // cached: shared with generateMetadata
  if (!property) notFound();

  const viewer = await getViewer();
  const [similar, saved] = await Promise.all([
    getSimilarProperties(property.districtSlug, property.id).catch(() => []),
    viewer ? isPropertySaved(property.id).catch(() => false) : false,
  ]);

  const similarFavouriteIds = await getFavouriteIds(similar.map((p) => p.id));

  return (
    <>
      <PropertyDetailView
        property={property}
        similar={similar}
        viewer={viewer}
        saved={saved}
        similarFavouriteIds={similarFavouriteIds}
      />
    </>
  );
}
