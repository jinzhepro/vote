"use client";

import { VotePersonnelList } from "@/components/vote/VotePersonnelList";
import { useRouter } from "next/navigation";

export default function JingkongEmployeeVotePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <VotePersonnelList
      department="jingkong"
      role="employee"
      onBack={handleBack}
    />
  );
}
