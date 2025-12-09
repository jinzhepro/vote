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
import { LoadingSpinner } from "@/components/ui/loading";

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jingkongPersonnel, setJingkongPersonnel] = useState([]);
  const [kaitouPersonnel, setKaitouPersonnel] = useState([]);

  const loadPersonnelData = async () => {
    try {
      const jingkongResponse = await fetch(
        "/api/personnel?department=jingkong"
      );
      const kaitouResponse = await fetch("/api/personnel?department=kaitou");

      if (jingkongResponse.ok) {
        const jingkongResult = await jingkongResponse.json();
        if (jingkongResult.success) {
          setJingkongPersonnel(jingkongResult.data || []);
        } else {
          console.error("获取经控贸易人员数据失败:", jingkongResult.error);
        }
      } else {
        console.error("获取经控贸易人员数据失败");
      }

      if (kaitouResponse.ok) {
        const kaitouResult = await kaitouResponse.json();
        if (kaitouResult.success) {
          setKaitouPersonnel(kaitouResult.data || []);
        } else {
          console.error("获取开投贸易人员数据失败:", kaitouResult.error);
        }
      } else {
        console.error("获取开投贸易人员数据失败");
      }
    } catch (error) {
      console.error("加载人员数据失败:", error);
    }
  };

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      // 同时加载评价数据和人员数据
      const [evaluationsResponse] = await Promise.all([
        fetch("/api/evaluations?stats=true"),
        loadPersonnelData(),
      ]);

      const result = await evaluationsResponse.json();

      if (evaluationsResponse.ok && result.success) {
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

  const getPersonnelEvaluations = (personnel) => {
    if (!stats || !stats.personnel) {
      console.log("No stats or personnel data available");
      return null;
    }

    // personnel 可能是字符串（名称）或对象（包含 id 和 name）
    const personnelId =
      typeof personnel === "string" ? personnel : personnel.id;
    const personnelName =
      typeof personnel === "string" ? personnel : personnel.name;

    console.log(
      `Looking for evaluations for: ${personnelName} (ID: ${personnelId})`
    );
    console.log("Available personnel keys:", Object.keys(stats.personnel));

    // 尝试直接用 ID 查找
    if (stats.personnel[personnelId]) {
      console.log(`Found direct match for ${personnelId}`);
      return stats.personnel[personnelId];
    }

    // 尝试用名称查找
    if (stats.personnel[personnelName]) {
      console.log(`Found direct match for ${personnelName}`);
      return stats.personnel[personnelName];
    }

    // 如果直接查找失败，遍历所有评价数据，查找匹配的人员
    console.log("No direct match, searching through all evaluations...");

    // 收集所有评价数据，查找匹配的人员
    let allEvaluations = [];
    for (const [key, value] of Object.entries(stats.personnel)) {
      if (value.evaluations && Array.isArray(value.evaluations)) {
        allEvaluations = allEvaluations.concat(value.evaluations);
      }
    }

    console.log(`Total evaluations found: ${allEvaluations.length}`);
    if (allEvaluations.length > 0) {
      console.log("Sample evaluation:", allEvaluations[0]);
      console.log(
        "Unique personnel_ids in evaluations:",
        [...new Set(allEvaluations.map((e) => e.personnel_id))].slice(0, 10)
      );
    }

    // 查找匹配的评价（先尝试匹配 ID，再尝试匹配名称）
    const matchingEvaluations = allEvaluations.filter((evaluation) => {
      return (
        evaluation.personnel_id === personnelId ||
        evaluation.personnel_id === personnelName
      );
    });

    console.log(
      `Matching evaluations for ${personnelName}:`,
      matchingEvaluations.length
    );

    if (matchingEvaluations.length > 0) {
      // 重新计算统计数据
      const totalScore = matchingEvaluations.reduce(
        (sum, e) => sum + e.total_score,
        0
      );
      const averageScore = (totalScore / matchingEvaluations.length).toFixed(1);

      console.log(
        `Calculated average score for ${personnelName}: ${averageScore}`
      );

      return {
        count: matchingEvaluations.length,
        totalScore: totalScore,
        averageScore: averageScore,
        evaluations: matchingEvaluations,
      };
    }

    console.log(`No evaluations found for ${personnelName}`);
    return null;
  };

  // 调试函数，用于查看评价数据的结构
  const debugPersonnelData = () => {
    if (stats && stats.personnel) {
      console.log("Personnel keys:", Object.keys(stats.personnel));
      console.log(
        "Sample personnel data:",
        Object.entries(stats.personnel).slice(0, 3)
      );

      // 查看第一个人员的评价数据
      const firstPersonKey = Object.keys(stats.personnel)[0];
      if (firstPersonKey && stats.personnel[firstPersonKey]) {
        console.log(
          `First person (${firstPersonKey}) evaluations:`,
          stats.personnel[firstPersonKey]
        );
        if (
          stats.personnel[firstPersonKey].evaluations &&
          stats.personnel[firstPersonKey].evaluations.length > 0
        ) {
          console.log(
            "First evaluation sample:",
            stats.personnel[firstPersonKey].evaluations[0]
          );
        }
      }

      // 查看所有评价数据
      let allEvaluations = [];
      for (const [key, value] of Object.entries(stats.personnel)) {
        if (value.evaluations && Array.isArray(value.evaluations)) {
          allEvaluations = allEvaluations.concat(value.evaluations);
        }
      }
      console.log(
        `Total evaluations across all personnel: ${allEvaluations.length}`
      );
      if (allEvaluations.length > 0) {
        console.log("Sample evaluation from all data:", allEvaluations[0]);
        console.log(
          "Unique personnel_ids in evaluations:",
          [...new Set(allEvaluations.map((e) => e.personnel_id))].slice(0, 10)
        );
      }
    }
  };

  // 在开发环境中调用调试函数
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    debugPersonnelData();
  }

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

                      {/* 经控贸易负责人评价的人员平均分 */}
                      <div className="mt-6">
                        <h5 className="font-medium text-md mb-3 text-blue-600">
                          负责人评价的人员平均分
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {jingkongPersonnel.map((person) => {
                            const evaluation = getPersonnelEvaluations(person);
                            const leaderEvaluations =
                              evaluation?.evaluations?.filter(
                                (e) =>
                                  e.role === "leader" &&
                                  e.department === "jingkong"
                              );
                            const averageScore =
                              leaderEvaluations?.length > 0
                                ? (
                                    leaderEvaluations.reduce(
                                      (sum, e) => sum + e.total_score,
                                      0
                                    ) / leaderEvaluations.length
                                  ).toFixed(1)
                                : 0;

                            return (
                              <div
                                key={person.name}
                                className={`p-2 border rounded text-sm ${
                                  averageScore > 0
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-blue-700">
                                  平均分:{" "}
                                  {averageScore > 0
                                    ? `${averageScore}分`
                                    : "暂无评价"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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

                      {/* 经控贸易员工评价的人员平均分 */}
                      <div className="mt-6">
                        <h5 className="font-medium text-md mb-3 text-green-600">
                          员工评价的人员平均分
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {jingkongPersonnel.map((person) => {
                            const evaluation = getPersonnelEvaluations(person);
                            const employeeEvaluations =
                              evaluation?.evaluations?.filter(
                                (e) =>
                                  e.role === "employee" &&
                                  e.department === "jingkong"
                              );
                            const averageScore =
                              employeeEvaluations?.length > 0
                                ? (
                                    employeeEvaluations.reduce(
                                      (sum, e) => sum + e.total_score,
                                      0
                                    ) / employeeEvaluations.length
                                  ).toFixed(1)
                                : 0;

                            return (
                              <div
                                key={person.name}
                                className={`p-2 border rounded text-sm ${
                                  averageScore > 0
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-green-700">
                                  平均分:{" "}
                                  {averageScore > 0
                                    ? `${averageScore}分`
                                    : "暂无评价"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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

                      {/* 开投贸易负责人评价的人员平均分 */}
                      <div className="mt-6">
                        <h5 className="font-medium text-md mb-3 text-blue-600">
                          负责人评价的人员平均分
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {kaitouPersonnel.map((person) => {
                            const evaluation = getPersonnelEvaluations(person);
                            const leaderEvaluations =
                              evaluation?.evaluations?.filter(
                                (e) =>
                                  e.role === "leader" &&
                                  e.department === "kaitou"
                              );
                            const averageScore =
                              leaderEvaluations?.length > 0
                                ? (
                                    leaderEvaluations.reduce(
                                      (sum, e) => sum + e.total_score,
                                      0
                                    ) / leaderEvaluations.length
                                  ).toFixed(1)
                                : 0;

                            return (
                              <div
                                key={person.name}
                                className={`p-2 border rounded text-sm ${
                                  averageScore > 0
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-blue-700">
                                  平均分:{" "}
                                  {averageScore > 0
                                    ? `${averageScore}分`
                                    : "暂无评价"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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

                      {/* 开投贸易员工评价的人员平均分 */}
                      <div className="mt-6">
                        <h5 className="font-medium text-md mb-3 text-green-600">
                          员工评价的人员平均分
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {kaitouPersonnel.map((person) => {
                            const evaluation = getPersonnelEvaluations(person);
                            const employeeEvaluations =
                              evaluation?.evaluations?.filter(
                                (e) =>
                                  e.role === "employee" &&
                                  e.department === "kaitou"
                              );
                            const averageScore =
                              employeeEvaluations?.length > 0
                                ? (
                                    employeeEvaluations.reduce(
                                      (sum, e) => sum + e.total_score,
                                      0
                                    ) / employeeEvaluations.length
                                  ).toFixed(1)
                                : 0;

                            return (
                              <div
                                key={person.name}
                                className={`p-2 border rounded text-sm ${
                                  averageScore > 0
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50"
                                }`}
                              >
                                <div className="font-medium">{person.name}</div>
                                <div className="text-green-700">
                                  平均分:{" "}
                                  {averageScore > 0
                                    ? `${averageScore}分`
                                    : "暂无评价"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
