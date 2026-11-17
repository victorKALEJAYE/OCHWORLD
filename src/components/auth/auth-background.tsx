/** Decorative backdrop: gold light orbs, a faint grid and an Abuja skyline. */
export function AuthBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-gold-500/25 blur-[120px] animate-float-slow" />
      <div className="absolute -bottom-48 -right-32 size-[38rem] rounded-full bg-gold-700/25 blur-[140px] animate-float-slower" />
      <div className="absolute left-1/2 top-1/3 size-[22rem] -translate-x-1/2 rounded-full bg-amber-200/[0.06] blur-[100px]" />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(246,210,122,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(246,210,122,.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <svg className="absolute bottom-0 left-0 h-40 w-full text-gold-500/[0.08]" viewBox="0 0 1440 160" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 160V118h60v-20h40v20h50V70h30v-24h20v24h30v90h40V96h60v-30h18v30h52V40l26-26 26 26v120h50V86h70v-22h30v22h40v74h46V58h22V28h14v30h22v102h60V92h50V72h40v20h40v68h60v-50h80v-30h20v30h50v50h60V82h40v-20h30v20h30v78h70v-60h50v60h50z" />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(11,10,8,.6)_70%)]" />
    </div>
  );
}
