import { redirect } from "next/navigation";

export const instant = false;

export default function FristenPage() {
  redirect("/lernen/a-fristen-und-zahlen");
}
