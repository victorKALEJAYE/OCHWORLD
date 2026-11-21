/**
 * OpenStreetMap of the area around a district's approximate centre. An iframe
 * keeps it free of API keys and JavaScript; "View larger map" opens OSM.
 */
export function DistrictMap({ name, centre }: { name: string; centre: [number, number] }) {
  const [lat, lng] = centre;
  const d = 0.018;
  const bbox = [lng - d * 1.4, lat - d, lng + d * 1.4, lat + d].map((n) => n.toFixed(4)).join(",");
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const full = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-lg border bg-muted">
        <iframe
          title={`Map of ${name}`}
          src={embed}
          loading="lazy"
          className="block aspect-[16/10] w-full"
          referrerPolicy="no-referrer"
        />
      </div>
      <figcaption className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>Approximate area. Map data © OpenStreetMap contributors.</span>
        <a href={full} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
          View larger map
        </a>
      </figcaption>
    </figure>
  );
}
