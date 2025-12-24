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
import { generateEncryptedUserId } from "@/lib/encryption";
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
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端执行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取已保存的用户ID
  const getUserId = () => {
    if (typeof window === "undefined") return null;

    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      setUserId(savedUserId);
      return savedUserId;
    }

    // 如果没有保存的userId，返回首页
    router.push("/");
    return null;
  };

  // 从本地存储加载评价数据
  const loadEvaluationsFromLocal = () => {
    if (typeof window === "undefined") return {};

    const currentUserId = userId || getUserId();
    if (!currentUserId) return {};

    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    if (localEvaluations[currentUserId]) {
      const userData = localEvaluations[currentUserId];
      const evaluationsData = {};

      // 转换数据格式以匹配组件期望的格式
      Object.entries(userData.evaluations).forEach(([personId, evaluation]) => {
        // 只加载当前部门的评价数据
        if (evaluation.department === department) {
          evaluationsData[personId] = {
            evaluations: evaluation.scores,
            totalScore: evaluation.totalScore,
            timestamp: evaluation.timestamp,
            userId: currentUserId,
            isFromServer: false, // 标记为本地数据
          };
        }
      });

      return evaluationsData;
    }

    return {};
  };

  // 获取用户评价历史（从本地存储）
  const fetchUserEvaluations = async () => {
    if (typeof window === "undefined") return;

    const currentUserId = userId || getUserId();
    if (!currentUserId) return;

    // 直接从本地存储获取评价数据
    try {
      const localEvaluations = loadEvaluationsFromLocal();
      setUserEvaluations(localEvaluations);
    } catch (error) {
      console.error("获取评价数据失败:", error);
      setUserEvaluations({});
    }
  };

  // 清空当前部门的评价数据
  const clearAllEvaluations = () => {
    if (typeof window === "undefined") return;

    const currentUserId = userId || getUserId();
    if (!currentUserId) return;

    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    // 保留其他部门的评价数据，只清空当前部门的数据
    if (localEvaluations[currentUserId]) {
      const userData = localEvaluations[currentUserId];
      const newEvaluations = {};

      // 只保留非当前部门的评价数据
      Object.entries(userData.evaluations).forEach(([personId, evaluation]) => {
        if (evaluation.department !== department) {
          newEvaluations[personId] = evaluation;
        }
      });

      // 更新用户数据
      localEvaluations[currentUserId].evaluations = newEvaluations;
    }

    localStorage.setItem("localEvaluations", JSON.stringify(localEvaluations));

    // 重新加载当前部门的评价数据
    const updatedEvaluations = loadEvaluationsFromLocal();
    setUserEvaluations(updatedEvaluations);
    setClearAllDialogOpen(false);
  };

  // 提交当前部门的评价到服务器
  const submitAllEvaluations = async () => {
    if (typeof window === "undefined") return;

    const currentUserId = userId || getUserId();
    if (!currentUserId) return;

    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    if (!localEvaluations[currentUserId]) {
      toast.error("没有需要提交的评价");
      return;
    }

    const userData = localEvaluations[currentUserId];

    // 只获取当前部门的评价数据
    const currentDepartmentEvaluations = {};
    Object.entries(userData.evaluations).forEach(([personId, evaluation]) => {
      if (evaluation.department === department) {
        currentDepartmentEvaluations[personId] = evaluation;
      }
    });

    const evaluationIds = Object.keys(currentDepartmentEvaluations);

    if (evaluationIds.length === 0) {
      toast.error(`没有需要提交的${getDepartmentName()}评价`);
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
      // 获取用户信息
      const userName = userData.userName || currentUserId;
      const completedDepartments = JSON.parse(
        localStorage.getItem("completedDepartments") || "[]"
      );

      // 准备基于用户存储的数据 - 只包含当前部门的评价
      const userEvaluationData = {
        userId: currentUserId,
        userName: userName,
        userRole:
          role === "functional" ? "functional" : userData.role || "employee",
        userDepartment: department,
        evaluations: currentDepartmentEvaluations,
        completedDepartments: completedDepartments,
        totalEvaluations: evaluationIds.length,
        isSubmitted: true,
      };

      // 提交用户评价数据到服务器
      const response = await fetch("/api/user-evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userEvaluationData),
      });

      const result = await response.json();

      if (result.success) {
        // 记录已完成的部门（仅对职能部门用户）
        if (role === "functional") {
          if (!completedDepartments.includes(department)) {
            completedDepartments.push(department);
            localStorage.setItem(
              "completedDepartments",
              JSON.stringify(completedDepartments)
            );
          }
        }

        // 提交成功后只清空当前部门的本地评价数据
        if (localEvaluations[currentUserId]) {
          const newEvaluations = {};
          Object.entries(userData.evaluations).forEach(
            ([personId, evaluation]) => {
              if (evaluation.department !== department) {
                newEvaluations[personId] = evaluation;
              }
            }
          );
          localEvaluations[currentUserId].evaluations = newEvaluations;
          localStorage.setItem(
            "localEvaluations",
            JSON.stringify(localEvaluations)
          );
        }

        toast.success(result.message || `${getDepartmentName()}评价提交成功！`);
        // 跳转到成功页面
        router.push("/vote/success");
      } else {
        toast.error(result.message || "提交失败");
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
      functional: "职能部门",
    };
    return names[department] || department;
  };

  // 获取部门人员（从本地数据）
  const fetchPersonnel = () => {
    try {
      // 使用本地人员数据
      const personnelData = getPersonnelByDepartment(department);
      const departmentName = getDepartmentName();

      // 为每个人员添加额外的属性
      const personnelObjects = personnelData.map((person) => ({
        ...person,
        type: departmentName,
        department: departmentName,
      }));

      setPersonnel(personnelObjects);
    } catch (error) {
      console.error("获取人员失败:", error);
      // 如果获取失败，设置为空数组
      setPersonnel([]);
    }
  };

  useEffect(() => {
    if (!isClient) return;

    const initializeData = () => {
      setLoading(true);
      getUserId();
      fetchPersonnel();
      fetchUserEvaluations();
      setLoading(false);
    };
    initializeData();
  }, [department, role, isClient]);

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

  // 使用useMemo缓存等级统计
  const gradeStatistics = useMemo(() => {
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

    // 统计已评价人员的等级 - 只统计当前部门的人员
    Object.entries(userEvaluations).forEach(([personId, evaluation]) => {
      // 确保只统计当前部门的人员
      const person = personnel.find((p) => p.id === personId);
      if (person) {
        const grade = getScoreGrade(evaluation.totalScore);
        if (stats[grade.letter]) {
          stats[grade.letter].count++;
          stats[grade.letter].evaluatedCount++;
        }
      }
    });

    return stats;
  }, [userEvaluations, personnel]);

  // 使用useMemo缓存等级分布验证
  const gradeValidation = useMemo(() => {
    return validateGradeDistribution(userEvaluations, department);
  }, [userEvaluations, department]);

  // 动态获取部门等级分布要求文案
  const getDepartmentDistributionText = (dept) => {
    if (dept === "jingkong") {
      return "经控贸易部门等级分布要求：A优秀≤11人，B良好=23-26人，C合格=18-21人，D基本合格+E不合格=3-6人";
    } else if (dept === "kaitou") {
      return "开投贸易部门等级分布要求：A优秀≤4人，B良好=9-11人，C合格=6-8人，D基本合格+E不合格=1-3人";
    } else {
      return "职能部门无等级分布要求";
    }
  };

  // 动态获取部门等级分布限制
  const getDepartmentDistributionLimits = (dept) => {
    if (dept === "jingkong") {
      return {
        A: { max: 11, text: "≤11人" },
        B: { min: 23, max: 26, text: "23-26人" },
        C: { min: 18, max: 21, text: "18-21人" },
        DE: { min: 3, max: 6, text: "3-6人" },
      };
    } else if (dept === "kaitou") {
      return {
        A: { max: 4, text: "≤4人" },
        B: { min: 9, max: 11, text: "9-11人" },
        C: { min: 6, max: 8, text: "6-8人" },
        DE: { min: 1, max: 3, text: "1-3人" },
      };
    } else {
      // 职能部门无等级分布要求，返回空对象
      return {};
    }
  };

  // 使用useMemo缓存部门分布限制
  const departmentLimits = useMemo(() => {
    return getDepartmentDistributionLimits(department);
  }, [department]);

  // 清除等级过滤
  const clearGradeFilter = () => {
    setSelectedGrade(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      经控贸易: "bg-blue-100 text-blue-800",
      开投贸易: "bg-green-100 text-green-800",
      职能部门: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // 检查评价是否存在（所有评价都是本地的）
  const hasEvaluation = (personId) => {
    return userEvaluations[personId] !== undefined;
  };

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

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
                用户ID: {userId} (
                {role === "functional"
                  ? "职能部门"
                  : role === "leader"
                  ? "部门负责人"
                  : "员工"}
                )
              </div>
            </div>
          </div>

          {/* 本地存储状态提示 */}
          {Object.keys(userEvaluations).length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">本地评价状态</div>
                  <div>
                    已保存 {Object.keys(userEvaluations).length}{" "}
                    个评价到本地存储
                  </div>
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
                          清空本部门评价数据
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                            确认清空本部门评价数据
                          </DialogTitle>
                          <DialogDescription>
                            此操作将删除您在{getDepartmentName()}
                            的所有评价记录，其他部门的评价数据将保留。确定要继续吗？
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
          )}

          {/* 人员统计和等级分布状态 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>共 {personnel.length} 人</span>
              <span>已评价 {Object.keys(userEvaluations).length} 人</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  fetchPersonnel();
                  fetchUserEvaluations();
                  setLoading(false);
                }}
              >
                刷新
              </Button>
            </div>

            {/* 等级分布状态 - 仅对经控贸易和开投贸易显示 */}
            {(department === "jingkong" || department === "kaitou") && (
              <Card
                className={
                  gradeValidation.valid
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      等级分布状态
                      {gradeValidation.valid ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ 符合要求
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠ 需要调整
                        </span>
                      )}
                    </CardTitle>
                    {gradeValidation.valid &&
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
                      )}
                  </div>
                  <CardDescription>
                    <div className="space-y-1">
                      <div>{getDepartmentDistributionText(department)}</div>
                      {department === "jingkong" && (
                        <div className="text-blue-600 font-medium">
                          绩效考核最终成绩＝部门负责人评估成绩×70%＋其他员工评估成绩×30%
                        </div>
                      )}
                      {(department === "kaitou" ||
                        department === "functional") && (
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
                        const gradeStats = gradeStatistics[grade.letter];
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
                    {departmentLimits.A && (
                      <div className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium mb-2">分布要求对比：</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>A等级（优秀）：</span>
                            <span
                              className={
                                gradeStatistics.A.count <=
                                departmentLimits.A.max
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {gradeStatistics.A.count}人 /{" "}
                              {departmentLimits.A.text}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>B等级（良好）：</span>
                            <span
                              className={
                                gradeStatistics.B.count >=
                                  departmentLimits.B.min &&
                                gradeStatistics.B.count <=
                                  departmentLimits.B.max
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {gradeStatistics.B.count}人 /{" "}
                              {departmentLimits.B.text}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>C等级（合格）：</span>
                            <span
                              className={
                                gradeStatistics.C.count >=
                                  departmentLimits.C.min &&
                                gradeStatistics.C.count <=
                                  departmentLimits.C.max
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {gradeStatistics.C.count}人 /{" "}
                              {departmentLimits.C.text}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>D+E等级（基本合格+不合格）：</span>
                            <span
                              className={
                                gradeStatistics.D.count +
                                  gradeStatistics.E.count >=
                                  departmentLimits.DE.min &&
                                gradeStatistics.D.count +
                                  gradeStatistics.E.count <=
                                  departmentLimits.DE.max
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {gradeStatistics.D.count +
                                gradeStatistics.E.count}
                              人 / {departmentLimits.DE.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 调整建议 */}
                    {!gradeValidation.valid && (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <div className="font-medium text-yellow-800 mb-2">
                          调整建议：
                        </div>
                        <div className="space-y-1 text-sm text-yellow-700">
                          {getGradeDistributionSuggestions(
                            userEvaluations,
                            department
                          ).map((suggestion, index) => (
                            <div key={index}>• {suggestion.message}</div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  const gradeStats = gradeStatistics[grade.letter];
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
