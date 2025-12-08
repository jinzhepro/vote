"use client";

import { PersonnelManager } from "@/components/personnel/PersonnelManager";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function PersonnelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline" size="sm">
                ← 返回首页
              </Button>
            </Link>
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
          </div>

          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full mt-8">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              人员管理系统
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              管理经控贸易、开投贸易和开投贸易派遣人员信息。
            </p>
          </div>
        </div>

        <div className="w-full max-w-7xl">
          <PersonnelManager />
        </div>
      </main>
    </div>
  );
}
