import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isStaff(user.role) ? "/admin" : "/book");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Anmelden</h1>
        <LoginForm />
      </div>
    </main>
  );
}
