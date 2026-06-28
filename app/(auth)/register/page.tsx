import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registrieren",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Konto erstellen</h1>
        <RegisterForm />
      </div>
    </main>
  );
}
