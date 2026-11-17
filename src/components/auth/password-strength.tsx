import { passwordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const colors = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-gold-400", "bg-emerald-400"];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrength(password);
  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-1 rounded-full transition-colors", i <= score ? colors[score] : "bg-white/10")}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium text-foreground/90">{labels[score]}</span>
      </p>
    </div>
  );
}
