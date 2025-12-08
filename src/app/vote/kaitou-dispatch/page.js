"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";

export default function KaitouDispatchVotePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <VotePersonnelList department="kaitou-dispatch" onBack={handleBack} />;
}
