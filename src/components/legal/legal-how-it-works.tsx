import { FileSearch, Handshake, Scale } from "lucide-react";

const STEPS = [
  { icon: FileSearch, title: "Tell us what you need", text: "Choose a service and describe the property or situation. It's free to ask." },
  { icon: Scale, title: "Get a quote", text: "We call you to confirm the details, then a property lawyer quotes before any work starts." },
  { icon: Handshake, title: "Move ahead with confidence", text: "You get the findings or documents, explained in plain English." },
];

/** The three steps for requesting legal help, shared by the legal pages. */
export function LegalHowItWorks() {
  return (
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">How to request help</h2>
      <ol className="mt-8 space-y-6">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">
                {i + 1}. {title}
              </p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 max-w-md text-xs text-muted-foreground">
        OCHWORLD connects you with independent property lawyers; it does not give legal advice itself. Verifications report
        what official records show at the time of the search.
      </p>
    </div>
  );
}
