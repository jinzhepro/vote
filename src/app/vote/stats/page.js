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
import { LoadingSpinner } from "@/components/ui/loading";
import { useRouter } from "next/navigation";
import { jingkongPersonnel, kaitouPersonnel } from "@/data/personnelData";

export default function StatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jingkong: {
      departmentName: "经控贸易",
      totalVotes: 0,
      totalEvaluations: jingkongPersonnel.length,
      personStats: {},
    },
    kaitou: {
      departmentName: "开投贸易",
      totalVotes: 0,
      totalEvaluations: kaitouPersonnel.length,
      personStats: {},
    },
  });

  const handleBack = () => {
    router.push("/");
  };

  // 从API获取统计数据
  const fetchStats = async () => {
    setLoading(true);
    try {
      const departments = ["jingkong", "kaitou"];
      const newStats = { ...stats };

      for (const dept of departments) {
        try {
          // 获取该部门的所有评价数据
          const response = await fetch(`/api/evaluations?department=${dept}`);
          const result = await response.json();

          if (response.ok && result.success) {
            // 统计每个人员的评价数据
            const personStats = {};
            let totalVotes = 0;

            result.data.forEach((evaluation) => {
              totalVotes++;
              const personId = evaluation.personnel_id;

              if (!personStats[personId]) {
                personStats[personId] = {
                  count: 0,
                  totalScore: 0,
                  averageScore: 0,
                };
              }

              personStats[personId].count++;
              personStats[personId].totalScore += evaluation.total_score;
              personStats[personId].averageScore =
                personStats[personId].totalScore / personStats[personId].count;
            });

            newStats[dept] = {
              ...newStats[dept],
              totalVotes,
              personStats,
            };
          }
        } catch (error) {
          console.error(`获取${dept}部门统计数据失败:`, error);
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchStats}>
                刷新数据
              </Button>
              <Button variant="outline" onClick={handleBack}>
                ← 返回首页
              </Button>
            </div>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* 统计数据 */}
          {!loading && (
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
                        {Object.keys(deptStats.personStats).length === 0 ? (
                          <div className="text-center text-gray-500 py-4 text-sm">
                            暂无评价数据
                          </div>
                        ) : (
                          Object.entries(deptStats.personStats).map(
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
          )}
        </div>
      </main>
    </div>
  );
}
