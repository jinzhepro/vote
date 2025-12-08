"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/department-vote", {
        method: "PATCH",
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleBack = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-6">
          {/* 标题和导航 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">系统统计</h1>
              <p className="text-gray-600 mt-2">查看所有系统的评价统计数据</p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              ← 返回首页
            </Button>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(stats).map(([dept, deptStats]) => (
              <Card key={dept} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {deptStats.departmentName}
                  </CardTitle>
                  <CardDescription>部门评价统计详情</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {deptStats.totalVotes}
                      </div>
                      <div className="text-gray-600">总评价数</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {deptStats.totalEvaluations}
                      </div>
                      <div className="text-gray-600">参与人数</div>
                    </div>
                  </div>

                  {/* 人员评价统计 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">人员评价统计</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {Object.entries(deptStats.personStats).map(
                        ([personId, personStat]) => (
                          <div
                            key={personId}
                            className="p-2 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                ID: {personId}
                              </span>
                              <span className="text-gray-500">
                                {personStat.count}次评价
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-600">平均分</span>
                              <span className="font-bold text-blue-600">
                                {personStat.averageScore.toFixed(1)}分
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/vote/${dept}`)}
                  >
                    进入系统
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 刷新按钮 */}
          <div className="flex justify-center">
            <Button onClick={fetchStats} variant="outline">
              刷新数据
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
