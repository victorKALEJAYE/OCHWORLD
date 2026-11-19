import { passwordStrength } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
// Weak = destructive, fair/good = brand gold, strong = success. No extra colours.
const colors = ["bg-destructive", "bg-destructive", "bg-primary", "bg-primary", "bg-success"];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrength(password);
  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-1 rounded-full transition-colors", i <= score ? colors[score] : "bg-muted")}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium text-foreground">{labels[score]}</span>
      </p>
    </div>
  );
}
