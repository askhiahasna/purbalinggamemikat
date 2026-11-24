import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/dal";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");
  return <LoginForm />;
}
