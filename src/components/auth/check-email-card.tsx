import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/** Confirmation shown after sign-up or a password-reset request sends an email. */
export function CheckEmailCard({ email, title = "Check your email" }: { email: string; title?: string }) {
  return (
    <Card className="text-center">
      <CardHeader className="items-center">
        <span className="mb-2 grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <CardTitle as="h1">{title}</CardTitle>
        <CardDescription>
          We sent a link to <span className="font-semibold text-foreground">{email}</span>. Open it on this device to
          continue.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
