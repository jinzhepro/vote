"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";

export default function JingkongVotePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <VotePersonnelList department="jingkong" onBack={handleBack} />;
}
