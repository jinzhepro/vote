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
  const [evaluations, setEvaluations] = useState({
    jingkong: {},
    kaitou: {},
  });
  const [loading, setLoading] = useState(true);

  const loadEvaluations = () => {
    const allEvaluations = {
      jingkong: {},
      kaitou: {},
    };

    // 获取所有设备的评价数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("evaluations_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const [_, department, deviceId] = key.split("_");

          if (!allEvaluations[department]) {
            allEvaluations[department] = {};
          }

          Object.assign(allEvaluations[department], data);
        } catch (error) {
          console.error("解析评价数据失败:", error);
        }
      }
    }

    setEvaluations(allEvaluations);
    setLoading(false);
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

  const clearAllData = () => {
    if (confirm("确定要清除所有评价数据吗？此操作不可恢复。")) {
      // 清除所有评价数据
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("evaluations_")) {
          localStorage.removeItem(key);
        }
      }
      loadEvaluations();
      alert("所有评价数据已清除");
    }
  };

  const getDepartmentStats = (department, personnel) => {
    const deptEvaluations = evaluations[department] || {};
    const totalPersonnel = personnel.length;
    const evaluatedCount = Object.keys(deptEvaluations).length;
    const totalEvaluations = Object.values(deptEvaluations).reduce(
      (sum, evaluation) => sum + 1,
      0
    );

    const scores = Object.values(deptEvaluations).map(
      (evaluation) => evaluation.totalScore
    );
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return {
      totalPersonnel,
      evaluatedCount,
      totalEvaluations,
      averageScore: averageScore.toFixed(1),
    };
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

          {/* 详细评价数据 */}
          <Card>
            <CardHeader>
              <CardTitle>详细评价数据</CardTitle>
              <CardDescription>所有人员的评价详情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 经控贸易详细数据 */}
                <div>
                  <h4 className="font-medium text-lg mb-2">经控贸易</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jingkongPersonnel.map((person) => {
                      const evaluation = evaluations.jingkong[person.id];
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
                            <div className="text-sm text-green-700 mt-1">
                              评分: {evaluation.totalScore}分
                            </div>
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
                      const evaluation = evaluations.kaitou[person.id];
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
                            <div className="text-sm text-green-700 mt-1">
                              评分: {evaluation.totalScore}分
                            </div>
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
