/** Decorative backdrop: warm gold/ember gradient mesh, glowing orbs, faint grid and an Abuja skyline. */
export function AuthBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 70% 55% at 0% 0%, rgba(232,188,79,0.20), transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 100% 0%, rgba(246,210,122,0.07), transparent 60%)",
            "radial-gradient(ellipse 70% 60% at 100% 100%, rgba(215,163,40,0.14), transparent 60%)",
            "radial-gradient(ellipse 60% 55% at 0% 100%, rgba(169,121,15,0.16), transparent 60%)",
            "linear-gradient(160deg, #15110a 0%, #0b0a08 45%, #120c06 100%)",
          ].join(", "),
        }}
      />

      {/* slowly rotating light sweep */}
      <div className="absolute left-1/2 top-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2">
        <div
          className="size-full animate-spin-slower opacity-30 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(246,210,122,0.14) 50deg, transparent 110deg, rgba(232,137,43,0.12) 200deg, transparent 260deg, rgba(215,163,40,0.12) 320deg, transparent 360deg)",
          }}
        />
      </div>

      {/* floating orbs */}
      <div className="absolute -left-40 -top-40 size-[36rem] rounded-full bg-gold-500/20 blur-[130px] animate-float-slow" />
      <div className="absolute -bottom-48 -right-32 size-[40rem] rounded-full bg-gold-700/20 blur-[150px] animate-float-slower" />
      <div className="absolute right-[15%] top-[10%] size-[18rem] rounded-full bg-gold-200/[0.07] blur-[100px] animate-float-slower" />
      <div className="absolute bottom-[20%] left-[30%] size-[16rem] rounded-full bg-gold-600/10 blur-[100px] animate-float-slow" />

      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(246,210,122,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(246,210,122,.55) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* skyline with gold gradient */}
      <svg className="absolute bottom-0 left-0 h-44 w-full" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="och-skyline" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F6D27A" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#D7A328" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#A9790F" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#och-skyline)"
          d="M0 160V118h60v-20h40v20h50V70h30v-24h20v24h30v90h40V96h60v-30h18v30h52V40l26-26 26 26v120h50V86h70v-22h30v22h40v74h46V58h22V28h14v30h22v102h60V92h50V72h40v20h40v68h60v-50h80v-30h20v30h50v50h60V82h40v-20h30v20h30v78h70v-60h50v60h50z"
        />
      </svg>

      {/* light vignette so the card stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,10,8,.6)_100%)]" />
    </div>
  );
}
