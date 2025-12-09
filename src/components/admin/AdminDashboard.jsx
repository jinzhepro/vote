"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jingkongPersonnel, kaitouPersonnel } from "@/data/personnelData";
import { LoadingSpinner } from "@/components/ui/loading";

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/evaluations?stats=true");
      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
      } else {
        console.error("获取统计数据失败:", result.error);
      }
    } catch (error) {
      console.error("加载统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 检查认证状态
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus !== "true") {
      router.push("/admin");
      return;
    }

    // 加载评价数据
    loadEvaluations();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    router.push("/admin");
  };

  const clearAllData = async () => {
    if (confirm("确定要清除所有评价数据吗？此操作不可恢复。")) {
      try {
        // 这里可以添加清除数据库的 API 调用
        // const response = await fetch('/api/evaluations', { method: 'DELETE' });
        alert("功能开发中，请联系系统管理员清除数据库数据");
        loadEvaluations();
      } catch (error) {
        console.error("清除数据失败:", error);
        alert("清除数据失败，请联系系统管理员");
      }
    }
  };

  const getDepartmentStats = (department, personnel) => {
    if (!stats || !stats.departments[department]) {
      return {
        totalPersonnel: personnel.length,
        evaluatedCount: 0,
        totalEvaluations: 0,
        averageScore: 0,
      };
    }

    const deptStats = stats.departments[department];
    const evaluatedPersonnel = new Set(
      deptStats.evaluations.map((e) => e.personnel_id)
    );

    return {
      totalPersonnel: personnel.length,
      evaluatedCount: evaluatedPersonnel.size,
      totalEvaluations: deptStats.count,
      averageScore: deptStats.averageScore,
    };
  };

  const getPersonnelEvaluations = (department, personnelId) => {
    if (!stats || !stats.personnel[personnelId]) {
      return null;
    }
    return stats.personnel[personnelId];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const jingkongStats = getDepartmentStats("jingkong", jingkongPersonnel);
  const kaitouStats = getDepartmentStats("kaitou", kaitouPersonnel);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-6">
          {/* 标题和操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">管理面板</h1>
              <p className="text-gray-600 mt-2">系统评价数据统计与管理</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={loadEvaluations}>
                刷新数据
              </Button>
              <Button variant="destructive" onClick={clearAllData}>
                清除所有数据
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 经控贸易统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">经控贸易</CardTitle>
                <CardDescription>部门评价统计详情</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {jingkongStats.totalPersonnel}
                    </div>
                    <div className="text-gray-600">总人数</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {jingkongStats.evaluatedCount}
                    </div>
                    <div className="text-gray-600">已评价人数</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {jingkongStats.averageScore}
                  </div>
                  <div className="text-gray-600">平均分数</div>
                </div>
              </CardContent>
            </Card>

            {/* 开投贸易统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">开投贸易</CardTitle>
                <CardDescription>部门评价统计详情</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {kaitouStats.totalPersonnel}
                    </div>
                    <div className="text-gray-600">总人数</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {kaitouStats.evaluatedCount}
                    </div>
                    <div className="text-gray-600">已评价人数</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {kaitouStats.averageScore}
                  </div>
                  <div className="text-gray-600">平均分数</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 用户统计 - 按部门分开显示 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户投票统计</CardTitle>
                <CardDescription>
                  所有用户的投票详情，按部门分开显示
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* 经控贸易用户统计 */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">
                      经控贸易 - 用户投票详情
                    </h3>

                    {/* Leader 统计 */}
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-3 text-blue-600">
                        部门负责人 (Leader)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "leader" &&
                          user.department === "jingkong"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  用户ID
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  部门
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  投票次数
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  最近投票时间
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "leader" &&
                                      user.department === "jingkong"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr
                                      key={userId}
                                      className="hover:bg-blue-50"
                                    >
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        {userId}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        经控贸易
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
                                        {userStats.count}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无经控贸易部门负责人投票数据
                        </div>
                      )}
                    </div>

                    {/* 员工统计 */}
                    <div>
                      <h4 className="font-medium text-lg mb-3 text-green-600">
                        普通员工 (Employee)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "employee" &&
                          user.department === "jingkong"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  用户ID
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  部门
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  投票次数
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  最近投票时间
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "employee" &&
                                      user.department === "jingkong"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr
                                      key={userId}
                                      className="hover:bg-green-50"
                                    >
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        {userId}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        经控贸易
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
                                        {userStats.count}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无经控贸易员工投票数据
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 开投贸易用户统计 */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-600">
                      开投贸易 - 用户投票详情
                    </h3>

                    {/* Leader 统计 */}
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-3 text-blue-600">
                        部门负责人 (Leader)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "leader" && user.department === "kaitou"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  用户ID
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  部门
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  投票次数
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  最近投票时间
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "leader" &&
                                      user.department === "kaitou"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr
                                      key={userId}
                                      className="hover:bg-blue-50"
                                    >
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        {userId}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        开投贸易
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
                                        {userStats.count}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无开投贸易部门负责人投票数据
                        </div>
                      )}
                    </div>

                    {/* 员工统计 */}
                    <div>
                      <h4 className="font-medium text-lg mb-3 text-green-600">
                        普通员工 (Employee)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "employee" &&
                          user.department === "kaitou"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  用户ID
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  部门
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  投票次数
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  最近投票时间
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "employee" &&
                                      user.department === "kaitou"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr
                                      key={userId}
                                      className="hover:bg-green-50"
                                    >
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        {userId}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        开投贸易
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
                                        {userStats.count}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无开投贸易员工投票数据
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详细评价数据 */}
          <Card>
            <CardHeader>
              <CardTitle>被评价人员统计</CardTitle>
              <CardDescription>所有被评价人员的详细评价信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 经控贸易详细数据 */}
                <div>
                  <h4 className="font-medium text-lg mb-2">经控贸易</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jingkongPersonnel.map((person) => {
                      const evaluation = getPersonnelEvaluations(
                        "jingkong",
                        person.id
                      );
                      return (
                        <div
                          key={person.id}
                          className={`p-3 border rounded-lg ${
                            evaluation
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {person.id}
                          </div>
                          {evaluation && (
                            <>
                              <div className="text-sm text-green-700 mt-1">
                                被评价次数: {evaluation.count}
                              </div>
                              <div className="text-sm text-green-700">
                                平均分: {evaluation.averageScore}分
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                最近评价:{" "}
                                {new Date(
                                  evaluation.evaluations[0].timestamp
                                ).toLocaleString("zh-CN")}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 开投贸易详细数据 */}
                <div>
                  <h4 className="font-medium text-lg mb-2">开投贸易</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kaitouPersonnel.map((person) => {
                      const evaluation = getPersonnelEvaluations(
                        "kaitou",
                        person.id
                      );
                      return (
                        <div
                          key={person.id}
                          className={`p-3 border rounded-lg ${
                            evaluation
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="font-medium">{person.name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {person.id}
                          </div>
                          {evaluation && (
                            <>
                              <div className="text-sm text-green-700 mt-1">
                                被评价次数: {evaluation.count}
                              </div>
                              <div className="text-sm text-green-700">
                                平均分: {evaluation.averageScore}分
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                最近评价:{" "}
                                {new Date(
                                  evaluation.evaluations[0].timestamp
                                ).toLocaleString("zh-CN")}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
