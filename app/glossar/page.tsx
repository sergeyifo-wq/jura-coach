import { redirect } from "next/navigation";

export const instant = false;

export default function GlossarPage() {
  redirect("/lernen/c-glossar");
}
