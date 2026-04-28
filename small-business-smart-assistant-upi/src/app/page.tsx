import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
