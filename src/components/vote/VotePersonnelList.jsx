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
import { LoadingPageModern } from "@/components/ui/loading";
import { getPersonnelByDepartment } from "@/data/personnelData";
import { getDeviceId } from "@/lib/deviceId";

export function VotePersonnelList({ department, role = "employee", onBack }) {
  const router = useRouter();
  const [personnel, setPersonnel] = useState([]);
  const [userEvaluations, setUserEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  // 初始化设备ID
  const initializeDeviceId = () => {
    const isLeader = role === "leader";
    const deviceId = getDeviceId(isLeader);
    setUserId(deviceId);
    return deviceId;
  };

  // 获取设备评价历史（从localStorage）
  const fetchDeviceEvaluations = () => {
    const currentDeviceId = userId || initializeDeviceId();
    const storageKey = `evaluations_${department}_${currentDeviceId}`;
    const storedEvaluations = localStorage.getItem(storageKey);
    if (storedEvaluations) {
      try {
        setUserEvaluations(JSON.parse(storedEvaluations));
      } catch (error) {
        console.error("解析评价历史失败:", error);
        setUserEvaluations({});
      }
    } else {
      setUserEvaluations({});
    }
  };

  // 获取部门人员（从 Supabase 或本地数据）
  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const personnelData = await getPersonnelByDepartment(department);

      // 为每个人员添加额外的属性
      const personnelObjects = personnelData.map((person) => ({
        ...person,
        type: getDepartmentName(),
        department: getDepartmentName(),
        createdAt: new Date().toISOString(),
      }));

      setPersonnel(personnelObjects);
    } catch (error) {
      console.error("获取人员失败:", error);
      // 如果获取失败，设置为空数组
      setPersonnel([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDeviceId();
    fetchPersonnel();
    fetchDeviceEvaluations();
  }, [department, role]);

  const getDepartmentName = () => {
    const names = {
      jingkong: "经控贸易",
      kaitou: "开投贸易",
    };
    return names[department] || department;
  };

  const getTypeColor = (type) => {
    const colors = {
      经控贸易: "bg-blue-100 text-blue-800",
      开投贸易: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <LoadingPageModern title="正在加载人员数据" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-6">
          {/* 标题和导航 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {getDepartmentName()} - 人员列表
              </h1>
              <p className="text-gray-600 mt-2">选择人员开始评价</p>
              <div className="text-sm text-gray-500 mt-1">
                用户ID: {userId} ({role === "leader" ? "部门负责人" : "员工"})
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              ← 返回首页
            </Button>
          </div>

          {/* 快速开始投票按钮 */}
          {personnel.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>
                  随机选择一个未评价的人员开始评价
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const unevaluatedPersonnel = personnel.filter(
                      (person) => !userEvaluations[person.id]
                    );

                    if (unevaluatedPersonnel.length > 0) {
                      const randomIndex = Math.floor(
                        Math.random() * unevaluatedPersonnel.length
                      );
                      const randomPerson = unevaluatedPersonnel[randomIndex];
                      router.push(
                        `/vote/${department}/${role}/${randomPerson.id}`
                      );
                    } else {
                      // 如果所有人员都已评价，随机选择一个
                      const randomIndex = Math.floor(
                        Math.random() * personnel.length
                      );
                      const randomPerson = personnel[randomIndex];
                      router.push(
                        `/vote/${department}/${role}/${randomPerson.id}`
                      );
                    }
                  }}
                >
                  随机开始评价
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 人员统计 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>共 {personnel.length} 人</span>
            <span>已评价 {Object.keys(userEvaluations).length} 人</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchPersonnel();
                fetchDeviceEvaluations();
              }}
            >
              刷新
            </Button>
          </div>

          {/* 人员列表 */}
          {personnel.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">暂无人员数据</div>
                <div className="text-sm text-gray-400 mt-2">
                  请检查数据库连接或联系管理员
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personnel.map((person) => {
                const hasEvaluated = userEvaluations[person.id];
                const evaluation = userEvaluations[person.id];
                return (
                  <Card
                    key={person.id}
                    className={`hover:shadow-md transition-shadow ${
                      hasEvaluated ? "border-green-200 bg-green-50" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {person.name}
                          {hasEvaluated && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ 已评价
                            </span>
                          )}
                        </CardTitle>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            person.type
                          )}`}
                        >
                          {person.type}
                        </span>
                      </div>
                      <CardDescription className="text-sm">
                        {person.department}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs text-gray-500 mb-4">
                        <div>ID: {person.id}</div>
                        <div>
                          创建时间:{" "}
                          {new Date(person.createdAt).toLocaleString("zh-CN")}
                        </div>
                        {hasEvaluated && (
                          <div className="text-green-700 font-medium">
                            评价时间:{" "}
                            {new Date(evaluation.timestamp).toLocaleString(
                              "zh-CN"
                            )}
                          </div>
                        )}
                        {hasEvaluated && (
                          <div className="text-green-700 font-medium">
                            我的评分: {evaluation.totalScore}分
                          </div>
                        )}
                      </div>
                      <Button
                        className={`w-full ${
                          hasEvaluated ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() =>
                          router.push(
                            `/vote/${department}/${role}/${person.id}`
                          )
                        }
                      >
                        {hasEvaluated ? "查看评价" : "开始评价"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
