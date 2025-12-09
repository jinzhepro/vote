"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function JingkongVotePage({ params }) {
  const router = useRouter();
  const { role } = use(params);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <VotePersonnelList department="jingkong" role={role} onBack={handleBack} />
  );
}
