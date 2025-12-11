"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FunctionalSelectDepartmentPage() {
  const router = useRouter();
  const [completedDepartments, setCompletedDepartments] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // 设置客户端渲染标志
  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
  }, []);

  // 页面加载时检查是否有userid
  useEffect(() => {
    // 检查是否已经有userid
    const userId = localStorage.getItem("userId");

    // 如果没有userid，返回首页
    if (!userId) {
      router.push("/");
      return;
    }

    // 检查已完成的部门
    const checkCompletedDepartments = () => {
      // 使用单独的存储来跟踪已完成的部门
      const completedDepts = JSON.parse(
        localStorage.getItem("completedDepartments") || "[]"
      );

      console.log("已完成的部门:", completedDepts); // 调试日志
      setCompletedDepartments(completedDepts);
    };

    // 使用setTimeout避免同步状态设置
    setTimeout(checkCompletedDepartments, 0);
  }, []);

  // 添加一个监听器，当页面重新获得焦点时刷新已完成部门列表
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const completedDepts = JSON.parse(
          localStorage.getItem("completedDepartments") || "[]"
        );
        console.log("页面重新获得焦点，已完成的部门:", completedDepts); // 调试日志
        setCompletedDepartments(completedDepts);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleDepartmentSelect = (department) => {
    // 跳转到对应部门的负责人评价页面
    // 职能部门用户使用 "functional" 作为 role 参数
    router.push(`/vote/${department}/functional`);
  };

  const handleBack = () => {
    router.push("/");
  };

  const isDepartmentCompleted = (department) => {
    return completedDepartments.includes(department);
    // return false;
  };

  return (
    <div className="flex  items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <h1 className="text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
              选择评价部门
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              作为职能部门负责人，请选择要评价的部门。
            </p>
            <div className="text-sm text-gray-500 mt-1">
              用户ID:{" "}
              {isClient
                ? localStorage.getItem("userId") || "未生成"
                : "加载中..."}{" "}
              (职能部门)
            </div>
          </div>

          {/* 部门选择卡片 */}
          <div className="mt-12 max-w-2xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className={`${
                  isDepartmentCompleted("jingkong")
                    ? "border-green-200 bg-green-50 opacity-75"
                    : "border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                }`}
                onClick={() =>
                  !isDepartmentCompleted("jingkong") &&
                  handleDepartmentSelect("jingkong")
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4" />
                    {isDepartmentCompleted("jingkong") && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ 已完成
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">经控贸易</CardTitle>
                  <CardDescription>
                    评价经控贸易部门人员（55人）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={
                      isDepartmentCompleted("jingkong") ? "outline" : "default"
                    }
                    disabled={isDepartmentCompleted("jingkong")}
                  >
                    {isDepartmentCompleted("jingkong")
                      ? "已完成评价"
                      : "进入评价"}
                  </Button>
                </CardContent>
              </Card>

              <Card
                className={`${
                  isDepartmentCompleted("kaitou")
                    ? "border-green-200 bg-green-50 opacity-75"
                    : "border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
                }`}
                onClick={() =>
                  !isDepartmentCompleted("kaitou") &&
                  handleDepartmentSelect("kaitou")
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mb-4" />
                    {isDepartmentCompleted("kaitou") && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ 已完成
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">开投贸易</CardTitle>
                  <CardDescription>
                    评价开投贸易部门人员（21人）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={
                      isDepartmentCompleted("kaitou") ? "outline" : "default"
                    }
                    disabled={isDepartmentCompleted("kaitou")}
                  >
                    {isDepartmentCompleted("kaitou")
                      ? "已完成评价"
                      : "进入评价"}
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
