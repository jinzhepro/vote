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
      routes: {
        leader: "/vote/jingkong/leader",
        employee: "/vote/jingkong/employee",
      },
    },
    {
      id: "kaitou",
      name: "开投贸易",
      description: "开投贸易部门人员评价系统",
      color: "bg-green-500",
      routes: {
        leader: "/vote/kaitou/leader",
        employee: "/vote/kaitou/employee",
      },
    },
  ];

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

        {/* 部门入口卡片 */}
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${dept.color} rounded-lg mb-4`} />
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full" variant="default">
                    <Link href={dept.routes.leader}>部门负责人入口</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={dept.routes.employee}>员工入口</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
