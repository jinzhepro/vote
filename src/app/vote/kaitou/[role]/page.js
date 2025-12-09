"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function KaitouVotePage({ params }) {
  const router = useRouter();
  const { role } = use(params);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <VotePersonnelList department="kaitou" role={role} onBack={handleBack} />
  );
}
