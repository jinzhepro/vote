"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  const departments = [
    {
      id: "jingkong",
      name: "经控贸易",
      description: "经控贸易部门人员评价系统",
      color: "bg-blue-500",
      route: "/vote/jingkong",
    },
    {
      id: "kaitou",
      name: "开投贸易",
      description: "开投贸易部门人员评价系统",
      color: "bg-green-500",
      route: "/vote/kaitou",
    },
    {
      id: "kaitou-dispatch",
      name: "开投贸易派遣",
      description: "开投贸易派遣人员评价系统",
      color: "bg-purple-500",
      route: "/vote/kaitou-dispatch",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />

          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full mt-8">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              人员评价系统
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              选择部门进入对应的人员评价投票系统。
            </p>
          </div>
        </div>

        {/* 部门入口卡片 */}
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card
                key={dept.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${dept.color} rounded-lg mb-4`} />
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={dept.route}>进入评价系统</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 人员管理入口 */}
        <div className="w-full max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>系统管理</CardTitle>
              <CardDescription>管理人员信息和系统设置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/personnel">人员管理</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button asChild>
            <a
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="dark:invert mr-2"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              部署到 Vercel
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              文档
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
