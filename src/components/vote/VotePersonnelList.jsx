"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getDeviceId } from "@/lib/deviceId";
import {
  TrashIcon,
  AlertTriangleIcon,
  FilterIcon,
  XIcon,
  UploadIcon,
} from "lucide-react";
import {
  getScoreGrade,
  getGradeDetails,
  validateGradeDistribution,
  getGradeDistributionSuggestions,
} from "@/data/evaluationCriteria";
import { getPersonnelByDepartment } from "@/data/personnelData";
import { toast } from "sonner";

export function VotePersonnelList({ department, role = "employee", onBack }) {
  const router = useRouter();
  const [personnel, setPersonnel] = useState([]);
  const [userEvaluations, setUserEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  // 提交所有评价到服务器
  const submitAllEvaluations = async () => {
    const currentDeviceId = userId || initializeDeviceId();
    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    if (!localEvaluations[currentDeviceId]) {
      toast.error("没有需要提交的评价");
      return;
    }

    const userData = localEvaluations[currentDeviceId];
    const evaluations = userData.evaluations;
    const evaluationIds = Object.keys(evaluations);

    if (evaluationIds.length === 0) {
      toast.error("没有需要提交的评价");
      return;
    }

    // 验证等级分布
    const validation = validateGradeDistribution(userEvaluations, department);
    if (!validation.valid) {
      toast.error(`等级分布不符合要求！${validation.message}`);
      return;
    }

    setSubmitting(true);
    try {
      // 准备批量提交的数据
      const batchEvaluations = Object.entries(evaluations).map(
        ([personnelId, evaluation]) => ({
          userId: currentDeviceId,
          personnelId: personnelId,
          department: evaluation.department,
          role: evaluation.role,
          scores: evaluation.scores,
          totalScore: evaluation.totalScore,
          comments: evaluation.comments || null,
        })
      );

      // 批量提交评价到服务器
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch: true,
          evaluations: batchEvaluations,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 提交成功后清空本地存储
        localStorage.removeItem("localEvaluations");

        toast.success(
          result.message ||
            `所有评价提交成功！共提交 ${result.results?.length || 0} 个评价`
        );
        // 跳转到成功页面
        router.push("/vote/success");
      } else {
        toast.error(result.message || "批量提交失败");
        if (result.errors && result.errors.length > 0) {
          console.error("提交错误:", result.errors);
        }
      }
    } catch (error) {
      console.error("批量提交失败:", error);
      toast.error("批量提交失败");
    } finally {
      setSubmitting(false);
    }
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
      // 使用本地人员数据
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

  // 使用useMemo计算过滤后的人员列表
  const filteredPersonnel = useMemo(() => {
    if (selectedGrade) {
      return personnel.filter((person) => {
        const evaluation = userEvaluations[person.id];
        if (!evaluation) return false;

        const grade = getScoreGrade(evaluation.totalScore);
        return grade.letter === selectedGrade;
      });
    }
    return personnel;
  }, [personnel, userEvaluations, selectedGrade]);

  // 清除等级过滤
  const clearGradeFilter = () => {
    setSelectedGrade(null);
  };

  // 获取等级统计
  const getGradeStatistics = () => {
    const stats = {};
    const gradeDetails = getGradeDetails();

    // 初始化统计
    gradeDetails.forEach((grade) => {
      stats[grade.letter] = {
        ...grade,
        count: 0,
        evaluatedCount: 0,
      };
    });

    // 统计已评价人员的等级
    Object.values(userEvaluations).forEach((evaluation) => {
      const grade = getScoreGrade(evaluation.totalScore);
      if (stats[grade.letter]) {
        stats[grade.letter].count++;
        stats[grade.letter].evaluatedCount++;
      }
    });

    return stats;
  };

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
    <div className="flex-1 flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1 w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-6">
          {/* 标题和导航 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {getDepartmentName()} - 2025年度员工绩效考核
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

          {/* 人员统计和等级分布状态 */}
          <div className="space-y-4">
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

            {/* 等级分布状态 - 仅对经控贸易部门显示 */}
            {(department === "jingkong" || department === "kaitou") && (
              <Card
                className={(() => {
                  const validation = validateGradeDistribution(
                    userEvaluations,
                    department
                  );
                  return validation.valid
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50";
                })()}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      等级分布状态
                      {(() => {
                        const validation = validateGradeDistribution(
                          userEvaluations,
                          department
                        );
                        return validation.valid ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ 符合要求
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠ 需要调整
                          </span>
                        );
                      })()}
                    </CardTitle>
                    {(() => {
                      const validation = validateGradeDistribution(
                        userEvaluations,
                        department
                      );
                      return (
                        validation.valid &&
                        Object.keys(userEvaluations).length > 0 && (
                          <Button
                            onClick={submitAllEvaluations}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {submitting ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <UploadIcon className="w-4 h-4 mr-2" />
                                提交评价
                              </>
                            )}
                          </Button>
                        )
                      );
                    })()}
                  </div>
                  <CardDescription>
                    <div className="space-y-1">
                      <div>
                        {department === "jingkong"
                          ? "经控贸易部门等级分布要求：A优秀≤11人，B良好=23-26人，C合格=18-21人，D基本合格+E不合格=3-6人"
                          : "开投贸易部门等级分布要求：A优秀≤3人，B良好=9-11人，C合格=6-8人，D基本合格+E不合格=1-3人"}
                      </div>
                      {department === "jingkong" && (
                        <div className="text-blue-600 font-medium">
                          绩效考核最终成绩＝部门负责人评估成绩×70%＋其他员工评估成绩×30%
                        </div>
                      )}
                      {department === "kaitou" && (
                        <div className="text-green-600 font-medium">
                          绩效考核最终成绩＝部门负责人评估成绩（业务板块负责人、职能部门负责人）×70%＋其他员工评估成绩×30%
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* 当前分布统计 */}
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {getGradeDetails().map((grade) => {
                        const stats = getGradeStatistics();
                        const gradeStats = stats[grade.letter];
                        return (
                          <div
                            key={grade.letter}
                            className="bg-white p-2 rounded border"
                          >
                            <div className={`font-bold text-lg ${grade.color}`}>
                              {grade.letter}
                            </div>
                            <div className="text-sm text-gray-600">
                              {gradeStats.count}人
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 分布要求对比 */}
                    <div className="bg-white p-3 rounded border text-sm">
                      <div className="font-medium mb-2">分布要求对比：</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>A等级（优秀）：</span>
                          <span
                            className={(() => {
                              const stats = getGradeStatistics();
                              const limit = department === "jingkong" ? 11 : 3;
                              return stats.A.count <= limit
                                ? "text-green-600"
                                : "text-red-600";
                            })()}
                          >
                            {getGradeStatistics().A.count}人 /{" "}
                            {department === "jingkong" ? "≤11人" : "≤3人"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>B等级（良好）：</span>
                          <span
                            className={(() => {
                              const stats = getGradeStatistics();
                              const bCount = stats.B.count;
                              const isValid =
                                department === "jingkong"
                                  ? bCount >= 23 && bCount <= 26
                                  : bCount >= 9 && bCount <= 11;
                              return isValid
                                ? "text-green-600"
                                : "text-red-600";
                            })()}
                          >
                            {getGradeStatistics().B.count}人 /{" "}
                            {department === "jingkong" ? "23-26人" : "9-11人"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>C等级（合格）：</span>
                          <span
                            className={(() => {
                              const stats = getGradeStatistics();
                              const cCount = stats.C.count;
                              const isValid =
                                department === "jingkong"
                                  ? cCount >= 18 && cCount <= 21
                                  : cCount >= 6 && cCount <= 8;
                              return isValid
                                ? "text-green-600"
                                : "text-red-600";
                            })()}
                          >
                            {getGradeStatistics().C.count}人 /{" "}
                            {department === "jingkong" ? "18-21人" : "6-8人"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>D+E等级（基本合格+不合格）：</span>
                          <span
                            className={(() => {
                              const stats = getGradeStatistics();
                              const deCount = stats.D.count + stats.E.count;
                              const isValid =
                                department === "jingkong"
                                  ? deCount >= 3 && deCount <= 6
                                  : deCount >= 1 && deCount <= 3;
                              return isValid
                                ? "text-green-600"
                                : "text-red-600";
                            })()}
                          >
                            {getGradeStatistics().D.count +
                              getGradeStatistics().E.count}
                            人 / {department === "jingkong" ? "3-6人" : "1-3人"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 调整建议 */}
                    {(() => {
                      const validation = validateGradeDistribution(
                        userEvaluations,
                        department
                      );
                      if (!validation.valid) {
                        const suggestions = getGradeDistributionSuggestions(
                          userEvaluations,
                          department
                        );
                        return (
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <div className="font-medium text-yellow-800 mb-2">
                              调整建议：
                            </div>
                            <div className="space-y-1 text-sm text-yellow-700">
                              {suggestions.map((suggestion, index) => (
                                <div key={index}>• {suggestion.message}</div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 等级过滤器 */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                等级过滤:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {getGradeDetails().map((grade) => {
                  const stats = getGradeStatistics();
                  const gradeStats = stats[grade.letter];
                  const isSelected = selectedGrade === grade.letter;

                  return (
                    <Button
                      key={grade.letter}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedGrade(isSelected ? null : grade.letter)
                      }
                      className={`h-8 px-3 text-xs ${
                        isSelected ? "" : grade.color
                      }`}
                    >
                      {grade.letter}({gradeStats.count})
                    </Button>
                  );
                })}
              </div>
              {selectedGrade && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    当前: {selectedGrade}等级 ({filteredPersonnel.length}人)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearGradeFilter}
                    className="h-6 px-2 text-xs"
                  >
                    <XIcon className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 人员列表 */}
          {filteredPersonnel.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">
                  {selectedGrade
                    ? `没有找到 ${selectedGrade} 等级的人员`
                    : "暂无人员数据"}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {selectedGrade
                    ? "请尝试选择其他等级或清除过滤"
                    : "请检查人员数据配置"}
                </div>
                {selectedGrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearGradeFilter}
                    className="mt-4"
                  >
                    清除过滤
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonnel.map((person) => {
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
                            person.department
                          )}`}
                        >
                          {person.department}
                        </span>
                      </div>
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
                        {hasEvaluated && (
                          <div className="text-blue-700 font-medium">
                            等级:{" "}
                            {(() => {
                              const grade = getScoreGrade(
                                evaluation.totalScore
                              );
                              return (
                                <span className={grade.color}>
                                  {grade.grade} ({grade.letter})
                                </span>
                              );
                            })()}
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

      {/* 全屏提交loading */}
      {submitting && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center flex flex-col items-center justify-center shadow-lg">
            <LoadingSpinner size="lg" />
            <h3 className="text-xl font-semibold mt-4 mb-2">正在提交</h3>
            <p className="text-gray-600">请不要操作，正在保存所有评价数据...</p>
          </div>
        </div>
      )}
    </div>
  );
}
