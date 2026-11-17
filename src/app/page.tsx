import { redirect } from "next/navigation";

// The landing page comes later; for now the site opens on sign in.
export default function Home() {
  redirect("/sign-in");
}
