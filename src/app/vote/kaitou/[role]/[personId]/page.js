"use client";

import { EvaluationVote } from "@/components/vote/EvaluationVote";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function KaitouPersonVotePage({ params }) {
  const router = useRouter();
  const { role, personId } = use(params);

  const handleBack = () => {
    router.push(`/vote/kaitou/${role}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <EvaluationVote
          department="kaitou"
          onBack={handleBack}
          initialPersonId={personId}
        />
      </main>
    </div>
  );
}
