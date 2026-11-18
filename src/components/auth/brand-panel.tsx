import { Building2, MapPinned, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const highlights = [
  { icon: MapPinned, title: "Every district, rated", text: "Security, power, roads and water scores for Maitama to Lugbe." },
  { icon: ShieldCheck, title: "Verified listings", text: "Titles and agents checked before a property goes live." },
  { icon: Building2, title: "Buy, rent or mortgage", text: "One account for homes, apartments and commercial spaces." },
];

/** Left-hand story panel shown on large screens. */
export function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between p-12 lg:flex xl:p-16">
      <Logo />

      <div className="max-w-md space-y-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Abuja property, simplified</p>
          <h2 className="text-4xl font-extrabold leading-[1.1] xl:text-5xl">
            Find your place in the <span className="text-gold-gradient">capital city.</span>
          </h2>
        </div>

        <ul className="space-y-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="glass-soft flex gap-4 rounded-2xl p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} OCHWORLD · Federal Capital Territory, Nigeria</p>
    </aside>
  );
}
