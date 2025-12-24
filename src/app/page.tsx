import { AuthFlow } from "@/components/features/auth";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="fixed inset-0 overflow-hidden overscroll-none">
      <AuthFlow />
    </main>
  );
}
