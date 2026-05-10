import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginClient } from "./_components/LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[var(--gradient-void-dark)] p-4">
      <Suspense fallback={null}>
        <LoginClient />
      </Suspense>
    </div>
  );
}
