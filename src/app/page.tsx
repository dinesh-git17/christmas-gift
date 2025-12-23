import { AuthFlow } from "@/components/features/auth";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center overscroll-none">
      <AuthFlow />
    </main>
  );
}
