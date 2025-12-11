"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateDeviceId } from "@/lib/deviceId";

export default function FunctionalSelectDepartmentPage() {
  const router = useRouter();

  // 页面加载时生成以职能部门开头的userid
  useEffect(() => {
    // 生成以"functional"开头的用户ID
    generateDeviceId(false, true); // 传递false表示不是leader，true表示是职能部门
  }, []);

  const handleDepartmentSelect = (department) => {
    // 跳转到对应部门的负责人评价页面
    router.push(`/vote/${department}/leader`);
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <h1 className="text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
              选择评价部门
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              作为职能部门负责人，请选择要评价的部门。
            </p>
          </div>

          {/* 部门选择卡片 */}
          <div className="mt-12 max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
                onClick={() => handleDepartmentSelect("jingkong")}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4" />
                  <CardTitle className="text-xl">经控贸易</CardTitle>
                  <CardDescription>
                    评价经控贸易部门人员（55人）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="default">
                    进入评价
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
                onClick={() => handleDepartmentSelect("kaitou")}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500 rounded-lg mb-4" />
                  <CardTitle className="text-xl">开投贸易</CardTitle>
                  <CardDescription>
                    评价开投贸易部门人员（21人）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="default">
                    进入评价
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={handleBack}>
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
