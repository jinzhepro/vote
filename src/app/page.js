"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <h1 className="text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
              2025年度员工绩效考核
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              选择部门和身份进入对应的人员评价系统。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
