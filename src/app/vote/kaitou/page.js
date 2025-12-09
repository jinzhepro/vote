"use client";

import { Suspense } from "react";
import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

function KaitouVotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "employee";

  const handleBack = () => {
    router.push("/");
  };

  return (
    <VotePersonnelList department="kaitou" role={role} onBack={handleBack} />
  );
}

export default function KaitouVotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          加载中...
        </div>
      }
    >
      <KaitouVotePageContent />
    </Suspense>
  );
}
