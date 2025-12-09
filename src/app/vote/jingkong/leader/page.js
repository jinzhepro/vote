"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";

export default function JingkongLeaderVotePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <VotePersonnelList
      department="jingkong"
      role="leader"
      onBack={handleBack}
    />
  );
}
