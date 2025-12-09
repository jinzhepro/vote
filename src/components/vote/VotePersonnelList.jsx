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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getPersonnelByDepartment } from "@/data/personnelData";
import { getDeviceId } from "@/lib/deviceId";
import { TrashIcon, AlertTriangleIcon } from "lucide-react";

export function VotePersonnelList({ department, role = "employee", onBack }) {
  const router = useRouter();
  const [personnel, setPersonnel] = useState([]);
  const [userEvaluations, setUserEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // 初始化设备ID
  const initializeDeviceId = () => {
    const isLeader = role === "leader";
    const deviceId = getDeviceId(isLeader);
    setUserId(deviceId);
    return deviceId;
  };

  // 从本地存储加载评价数据
  const loadEvaluationsFromLocal = () => {
    const currentDeviceId = userId || initializeDeviceId();
    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    if (localEvaluations[currentDeviceId]) {
      const userData = localEvaluations[currentDeviceId];
      const evaluationsData = {};

      // 转换数据格式以匹配组件期望的格式
      Object.entries(userData.evaluations).forEach(([personId, evaluation]) => {
        evaluationsData[personId] = {
          evaluations: evaluation.scores,
          totalScore: evaluation.totalScore,
          timestamp: evaluation.timestamp,
          userId: currentDeviceId,
          isFromServer: false, // 标记为本地数据
        };
      });

      return evaluationsData;
    }

    return {};
  };

  // 获取设备评价历史（从本地存储）
  const fetchDeviceEvaluations = async () => {
    const currentDeviceId = userId || initializeDeviceId();

    // 直接从本地存储获取评价数据
    try {
      const localEvaluations = loadEvaluationsFromLocal();
      setUserEvaluations(localEvaluations);
    } catch (error) {
      console.error("获取评价数据失败:", error);
      setUserEvaluations({});
    }
  };

  // 清空所有评价数据
  const clearAllEvaluations = () => {
    const currentDeviceId = userId || initializeDeviceId();
    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    // 创建新的 localEvaluations，删除所有数据
    const newLocalEvaluations = {};

    localStorage.setItem(
      "localEvaluations",
      JSON.stringify(newLocalEvaluations)
    );
    setUserEvaluations({});
    setClearAllDialogOpen(false);
  };

  const getDepartmentName = () => {
    const names = {
      jingkong: "经控贸易",
      kaitou: "开投贸易",
    };
    return names[department] || department;
  };

  // 获取部门人员（从本地数据）
  const fetchPersonnel = async () => {
    try {
      const personnelData = await getPersonnelByDepartment(department);

      // 为每个人员添加额外的属性
      const personnelObjects = personnelData.map((person) => ({
        ...person,
        type: getDepartmentName(),
        department: getDepartmentName(),
      }));

      setPersonnel(personnelObjects);
    } catch (error) {
      console.error("获取人员失败:", error);
      // 如果获取失败，设置为空数组
      setPersonnel([]);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      initializeDeviceId();
      await fetchPersonnel();
      await fetchDeviceEvaluations();
      setLoading(false);
    };
    initializeData();
  }, [department, role]);

  const getTypeColor = (type) => {
    const colors = {
      经控贸易: "bg-blue-100 text-blue-800",
      开投贸易: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // 检查评价是否存在（所有评价都是本地的）
  const hasEvaluation = (personId) => {
    return userEvaluations[personId] !== undefined;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <LoadingSpinner size="lg" />
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
              <h1 className="text-3xl font-semibold">
                {getDepartmentName()} - 人员列表
              </h1>
              <p className="text-gray-600 mt-2">选择人员开始评价</p>
              <div className="text-sm text-gray-500 mt-1">
                用户ID: {userId} ({role === "leader" ? "部门负责人" : "员工"})
              </div>
            </div>
          </div>

          {/* 本地存储状态提示 */}
          {(() => {
            const localEvaluations = loadEvaluationsFromLocal();
            const localCount = Object.keys(localEvaluations).length;
            if (localCount > 0) {
              return (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">本地评价状态</div>
                      <div>已保存 {localCount} 个评价到本地存储</div>
                      <div className="text-xs mt-1">
                        所有评价数据都保存在本地浏览器中
                      </div>
                      <div className="mt-3">
                        <Dialog
                          open={clearAllDialogOpen}
                          onOpenChange={setClearAllDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <TrashIcon className="w-4 h-4 mr-2" />
                              清空所有评价数据
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                                确认清空所有评价数据
                              </DialogTitle>
                              <DialogDescription>
                                此操作将删除您所有的评价记录，且无法恢复。确定要继续吗？
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setClearAllDialogOpen(false)}
                              >
                                取消
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={clearAllEvaluations}
                              >
                                确认清空
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          })()}

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
              onClick={async () => {
                setLoading(true);
                await fetchPersonnel();
                await fetchDeviceEvaluations();
                setLoading(false);
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
                  请检查人员数据配置
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personnel.map((person) => {
                const evaluation = userEvaluations[person.id];
                const hasEvaluated = hasEvaluation(person.id);
                return (
                  <Card
                    key={person.id}
                    className={`hover:shadow-md transition-shadow ${
                      hasEvaluated ? "border-blue-200 bg-blue-50" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {person.name}
                          {hasEvaluated && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                        {hasEvaluated && (
                          <div className="text-blue-700 font-medium">
                            评价时间:{" "}
                            {new Date(evaluation.timestamp).toLocaleString(
                              "zh-CN"
                            )}
                          </div>
                        )}
                        {hasEvaluated && (
                          <div className="text-blue-700 font-medium">
                            我的评分: {evaluation.totalScore}分
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className={`flex-1 ${
                            hasEvaluated ? "bg-blue-600 hover:bg-blue-700" : ""
                          }`}
                          onClick={() =>
                            router.push(
                              `/vote/${department}/${role}/${person.id}`
                            )
                          }
                        >
                          {hasEvaluated ? "继续编辑" : "开始评价"}
                        </Button>
                      </div>
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
