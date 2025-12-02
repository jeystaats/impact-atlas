"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
            <Icon name="globe" className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[var(--foreground)]">
            Impact Atlas
          </span>
        </Link>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Create your account
            </h1>
            <p className="text-[var(--foreground-secondary)]">
              Start discovering climate wins for your city
            </p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
              },
            }}
          />
        </div>
      </main>
    </div>
  );
}
