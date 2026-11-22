import Image from "next/image";

/**
 * Full-bleed background for a dark hero: a photo, optionally with a muted,
 * looping video on top, plus an even black tint (no gradient) so white text
 * stays readable. The parent must be `relative isolate overflow-hidden`.
 *
 * The photo shows while the video loads and instead of it for visitors who
 * prefer reduced motion.
 */
export function MediaBackground({
  photo,
  video,
  tint = "bg-black/50",
  priority = false,
}: {
  photo?: string | null;
  video?: string | null;
  tint?: string;
  priority?: boolean;
}) {
  return (
    <>
      {photo && <Image src={photo} alt="" fill priority={priority} sizes="100vw" className="-z-20 object-cover" />}
      {video && (
        <video
          className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
          src={video}
          poster={photo ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${tint}`} />
    </>
  );
}
