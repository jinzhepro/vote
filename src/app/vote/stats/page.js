"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { jingkongPersonnel, kaitouPersonnel } from "@/data/personnelData";

export default function StatsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  // 静态统计数据
  const staticStats = {
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
  };

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
            {Object.entries(staticStats).map(([dept, deptStats]) => (
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

          {/* 说明信息 */}
          <div className="flex justify-center">
            <div className="text-center text-gray-500 text-sm">
              <p>统计功能暂时不可用</p>
              <p>请联系系统管理员获取详细统计信息</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
