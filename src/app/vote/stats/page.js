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
      // 获取完整的统计数据
      const response = await fetch("/api/evaluations?stats=true");
      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        const newStats = {
          jingkong: {
            departmentName: "经控贸易",
            totalVotes: data.departments.jingkong?.count || 0,
            totalEvaluations: jingkongPersonnel.length,
            personStats: {},
            userStats: {},
            averageScore: data.departments.jingkong?.averageScore || 0,
          },
          kaitou: {
            departmentName: "开投贸易",
            totalVotes: data.departments.kaitou?.count || 0,
            totalEvaluations: kaitouPersonnel.length,
            personStats: {},
            userStats: {},
            averageScore: data.departments.kaitou?.averageScore || 0,
          },
        };

        // 处理人员统计数据
        if (data.personnel) {
          Object.entries(data.personnel).forEach(([personId, personData]) => {
            // 确定人员属于哪个部门
            const isInJingkong = jingkongPersonnel.some(
              (p) => p.id === personId
            );
            const dept = isInJingkong ? "jingkong" : "kaitou";

            newStats[dept].personStats[personId] = {
              count: personData.count,
              totalScore: personData.totalScore,
              averageScore: personData.averageScore,
            };
          });
        }

        // 处理用户统计数据
        if (data.users) {
          Object.entries(data.users).forEach(([userId, userData]) => {
            const dept = userData.department;
            if (newStats[dept]) {
              if (!newStats[dept].userStats) {
                newStats[dept].userStats = {};
              }
              newStats[dept].userStats[userId] = {
                count: userData.count,
                role: userData.role,
                lastVote: userData.evaluations[0]?.timestamp || null,
              };
            }
          });
        }

        setStats(newStats);
      } else {
        console.error("获取统计数据失败:", result.error);
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
            <div className="space-y-8">
              {/* 总体统计卡片 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(stats).map(([dept, deptStats]) => (
                  <Card
                    key={dept}
                    className="hover:shadow-md transition-shadow"
                  >
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
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {deptStats.averageScore}
                        </div>
                        <div className="text-gray-600">平均分数</div>
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

              {/* 用户投票详情 - 按部门分开显示 */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">用户投票统计</h3>

                {/* 经控贸易用户统计 */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-600">
                      经控贸易 - 用户投票详情
                    </CardTitle>
                    <CardDescription>
                      经控贸易部门负责人和员工投票统计
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Leader 统计 */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-blue-600">
                          部门负责人 (Leader)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.jingkong.userStats &&
                          Object.entries(stats.jingkong.userStats).filter(
                            ([_, user]) => user.role === "leader"
                          ).length > 0 ? (
                            Object.entries(stats.jingkong.userStats)
                              .filter(([_, user]) => user.role === "leader")
                              .map(([userId, userStat]) => (
                                <div
                                  key={userId}
                                  className="p-3 bg-blue-50 rounded text-sm"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {userId}
                                    </span>
                                    <span className="text-blue-600">
                                      {userStat.count}次投票
                                    </span>
                                  </div>
                                  {userStat.lastVote && (
                                    <div className="text-gray-500 mt-1 text-xs">
                                      最近:{" "}
                                      {new Date(
                                        userStat.lastVote
                                      ).toLocaleString("zh-CN")}
                                    </div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-gray-500 py-4 text-sm">
                              暂无部门负责人投票数据
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 员工统计 */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-green-600">
                          普通员工 (Employee)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.jingkong.userStats &&
                          Object.entries(stats.jingkong.userStats).filter(
                            ([_, user]) => user.role === "employee"
                          ).length > 0 ? (
                            Object.entries(stats.jingkong.userStats)
                              .filter(([_, user]) => user.role === "employee")
                              .map(([userId, userStat]) => (
                                <div
                                  key={userId}
                                  className="p-3 bg-green-50 rounded text-sm"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-800">
                                      {userId}
                                    </span>
                                    <span className="text-green-600">
                                      {userStat.count}次投票
                                    </span>
                                  </div>
                                  {userStat.lastVote && (
                                    <div className="text-gray-500 mt-1 text-xs">
                                      最近:{" "}
                                      {new Date(
                                        userStat.lastVote
                                      ).toLocaleString("zh-CN")}
                                    </div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-gray-500 py-4 text-sm">
                              暂无员工投票数据
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 开投贸易用户统计 */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-600">
                      开投贸易 - 用户投票详情
                    </CardTitle>
                    <CardDescription>
                      开投贸易部门负责人和员工投票统计
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Leader 统计 */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-blue-600">
                          部门负责人 (Leader)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.kaitou.userStats &&
                          Object.entries(stats.kaitou.userStats).filter(
                            ([_, user]) => user.role === "leader"
                          ).length > 0 ? (
                            Object.entries(stats.kaitou.userStats)
                              .filter(([_, user]) => user.role === "leader")
                              .map(([userId, userStat]) => (
                                <div
                                  key={userId}
                                  className="p-3 bg-blue-50 rounded text-sm"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">
                                      {userId}
                                    </span>
                                    <span className="text-blue-600">
                                      {userStat.count}次投票
                                    </span>
                                  </div>
                                  {userStat.lastVote && (
                                    <div className="text-gray-500 mt-1 text-xs">
                                      最近:{" "}
                                      {new Date(
                                        userStat.lastVote
                                      ).toLocaleString("zh-CN")}
                                    </div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-gray-500 py-4 text-sm">
                              暂无部门负责人投票数据
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 员工统计 */}
                      <div>
                        <h4 className="font-medium text-sm mb-3 text-green-600">
                          普通员工 (Employee)
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {stats.kaitou.userStats &&
                          Object.entries(stats.kaitou.userStats).filter(
                            ([_, user]) => user.role === "employee"
                          ).length > 0 ? (
                            Object.entries(stats.kaitou.userStats)
                              .filter(([_, user]) => user.role === "employee")
                              .map(([userId, userStat]) => (
                                <div
                                  key={userId}
                                  className="p-3 bg-green-50 rounded text-sm"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-800">
                                      {userId}
                                    </span>
                                    <span className="text-green-600">
                                      {userStat.count}次投票
                                    </span>
                                  </div>
                                  {userStat.lastVote && (
                                    <div className="text-gray-500 mt-1 text-xs">
                                      最近:{" "}
                                      {new Date(
                                        userStat.lastVote
                                      ).toLocaleString("zh-CN")}
                                    </div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-gray-500 py-4 text-sm">
                              暂无员工投票数据
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 被评价人员详情 */}
              <Card>
                <CardHeader>
                  <CardTitle>被评价人员详情</CardTitle>
                  <CardDescription>所有人员的被评价统计信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(stats).map(([dept, deptStats]) => (
                      <div key={`${dept}-personnel`}>
                        <h4 className="font-medium text-lg mb-3">
                          {deptStats.departmentName}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(dept === "jingkong"
                            ? jingkongPersonnel
                            : kaitouPersonnel
                          ).map((person) => {
                            const personStat = deptStats.personStats[person.id];
                            return (
                              <div
                                key={person.id}
                                className={`p-3 border rounded-lg ${
                                  personStat
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-sm text-gray-600">
                                  ID: {person.id}
                                </div>
                                {personStat && (
                                  <>
                                    <div className="text-sm text-green-700 mt-1">
                                      被评价次数: {personStat.count}
                                    </div>
                                    <div className="text-sm text-green-700">
                                      平均分: {personStat.averageScore}分
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
