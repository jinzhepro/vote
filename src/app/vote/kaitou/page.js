"use client";

import { EvaluationVote } from "@/components/vote/EvaluationVote";
import { useRouter } from "next/navigation";

export default function KaitouVotePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <EvaluationVote department="kaitou" onBack={handleBack} />
      </main>
    </div>
  );
}
