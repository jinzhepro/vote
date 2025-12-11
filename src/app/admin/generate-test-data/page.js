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
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  getPersonnelByName,
  jingkongPersonnel,
  kaitouPersonnel,
} from "@/data/personnelData";
import { defaultCriteria, getScoreGrade } from "@/data/evaluationCriteria";
import { generateEncryptedUserId } from "@/lib/encryption";

export default function GenerateTestDataPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(""); // 选择要评价的部门
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [generatedData, setGeneratedData] = useState(null);

  useEffect(() => {
    // 检查认证状态
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus !== "true") {
      router.push("/admin");
      return;
    }
  }, [router]);

  // 生成随机分数的函数
  const generateRandomScore = () => {
    return Math.floor(Math.random() * 3) + 3; // 生成3-5的分数
  };

  // 根据等级分布要求生成分数的函数
  const generateScoreByGrade = (grade) => {
    const maxScore = 100; // 最高可能分数
    let minScore, maxScoreRange;

    switch (grade) {
      case "A": // 优秀：95-100分
        minScore = 95;
        maxScoreRange = 100;
        break;
      case "B": // 良好：85-95分
        minScore = 85;
        maxScoreRange = 94;
        break;
      case "C": // 合格：75-85分
        minScore = 75;
        maxScoreRange = 84;
        break;
      case "D": // 基本合格：65-75分
        minScore = 65;
        maxScoreRange = 74;
        break;
      case "E": // 不合格：0-65分
        minScore = 0;
        maxScoreRange = 64;
        break;
      default:
        minScore = 75;
        maxScoreRange = 84;
    }

    // 生成指定范围内的随机总分
    const totalScore =
      Math.floor(Math.random() * (maxScoreRange - minScore + 1)) + minScore;

    // 根据总分分配各项评分
    const scores = {};
    const criteriaKeys = Object.keys(defaultCriteria);
    let remainingScore = totalScore;

    // 为每个标准分配分数
    criteriaKeys.forEach((criterion, index) => {
      const criterionOptions = defaultCriteria[criterion].options;
      const maxCriterionScore = Math.max(
        ...criterionOptions.map((opt) => opt.value)
      );
      const minCriterionScore = Math.min(
        ...criterionOptions.map((opt) => opt.value)
      );

      if (index === criteriaKeys.length - 1) {
        // 最后一个标准使用剩余分数
        scores[criterion] = Math.max(
          minCriterionScore,
          Math.min(maxCriterionScore, remainingScore)
        );
      } else {
        // 为其他标准分配分数
        const avgScorePerCriterion =
          remainingScore / (criteriaKeys.length - index);
        const score = Math.max(
          minCriterionScore,
          Math.min(
            maxCriterionScore,
            Math.floor(avgScorePerCriterion + (Math.random() - 0.5) * 4)
          )
        );
        scores[criterion] = score;
        remainingScore -= score;
      }
    });

    return { scores, totalScore };
  };

  // 根据部门要求生成等级分布
  const generateGradeDistribution = (department, personnelCount) => {
    let distribution = [];

    if (department === "jingkong") {
      // 经控贸易：A≤11人，B=23-26人，C=18-21人，D+E=3-6人
      const aCount = Math.min(Math.floor(Math.random() * 8) + 1, 11); // 1-11人
      const bCount = Math.floor(Math.random() * 4) + 23; // 23-26人
      const cCount = Math.floor(Math.random() * 4) + 18; // 18-21人
      const deCount = personnelCount - aCount - bCount - cCount; // 剩余人数

      // 确保D+E在3-6人范围内
      const adjustedDE = Math.max(3, Math.min(6, deCount));
      const adjustedC = personnelCount - aCount - bCount - adjustedDE;

      distribution = Array(aCount)
        .fill("A")
        .concat(Array(bCount).fill("B"))
        .concat(Array(adjustedC).fill("C"))
        .concat(Array(adjustedDE).fill("D"));
    } else if (department === "kaitou") {
      // 开投贸易：A≤3人，B=9-11人，C=6-8人，D+E=1-3人
      const aCount = Math.min(Math.floor(Math.random() * 3) + 1, 3); // 1-3人
      const bCount = Math.floor(Math.random() * 3) + 9; // 9-11人
      const cCount = Math.floor(Math.random() * 3) + 6; // 6-8人
      const deCount = personnelCount - aCount - bCount - cCount; // 剩余人数

      // 确保D+E在1-3人范围内
      const adjustedDE = Math.max(1, Math.min(3, deCount));
      const adjustedC = personnelCount - aCount - bCount - adjustedDE;

      distribution = Array(aCount)
        .fill("A")
        .concat(Array(bCount).fill("B"))
        .concat(Array(adjustedC).fill("C"))
        .concat(Array(adjustedDE).fill("D"));
    } else if (department === "functional") {
      // 职能部门：A≤1人，B=2-3人，C=1-2人，D+E=0-1人
      const aCount = Math.min(Math.floor(Math.random() * 2), 1); // 0-1人
      const bCount = Math.floor(Math.random() * 2) + 2; // 2-3人
      const cCount = Math.floor(Math.random() * 2) + 1; // 1-2人
      const deCount = personnelCount - aCount - bCount - cCount; // 剩余人数

      // 确保D+E在0-1人范围内
      const adjustedDE = Math.max(0, Math.min(1, deCount));
      const adjustedC = personnelCount - aCount - bCount - adjustedDE;

      distribution = Array(aCount)
        .fill("A")
        .concat(Array(bCount).fill("B"))
        .concat(Array(adjustedC).fill("C"))
        .concat(Array(adjustedDE).fill("D"));
    }

    // 随机打乱分布
    return distribution.sort(() => Math.random() - 0.5);
  };

  // 生成测试数据的主函数
  const handleGenerateData = async () => {
    if (!name.trim()) {
      setMessage("请输入姓名");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const userName = name.trim();

      // 根据姓名查找用户信息
      const userInfo = await getPersonnelByName(userName);

      if (!userInfo) {
        setMessage(`未找到用户 "${userName}"，请确认姓名是否正确`);
        setMessageType("error");
        return;
      }

      // 使用系统相同的加密方式生成userId
      const userId = generateEncryptedUserId(userName, userInfo.department);
      const userRole = userInfo.role;

      // 根据用户角色确定要评价的部门
      let targetDepartments;
      if (userInfo.department === "functional") {
        // 职能部门需要评价其他部门
        if (!selectedDepartment) {
          setMessage("职能部门用户需要选择要评价的部门");
          setMessageType("error");
          return;
        }
        targetDepartments = [selectedDepartment];
      } else {
        // 经控贸易和开投贸易用户评价自己部门
        targetDepartments = [userInfo.department];
      }

      // 创建符合 localEvaluations 格式的数据结构
      const newLocalEvaluations = {};

      targetDepartments.forEach((dept) => {
        const deptPersonnel =
          dept === "jingkong" ? jingkongPersonnel : kaitouPersonnel;
        const evaluations = {};

        // 根据部门要求生成等级分布
        const gradeDistribution = generateGradeDistribution(
          dept,
          deptPersonnel.length
        );

        // 为该部门的每个人员生成评价
        deptPersonnel.forEach((personnel, index) => {
          const grade = gradeDistribution[index] || "C"; // 默认C等级
          const { scores, totalScore } = generateScoreByGrade(grade);

          evaluations[personnel.id] = {
            personnelId: personnel.id,
            scores: scores,
            totalScore: totalScore,
            timestamp: new Date().toISOString(),
            department: dept,
            role: userRole,
          };
        });

        // 保存到 localEvaluations 格式
        newLocalEvaluations[userId] = {
          department: dept,
          role: userRole,
          evaluations: evaluations,
          userName: userName,
        };
      });

      // 保存到本地存储（使用 localEvaluations 格式）
      // 注意：按照 EvaluationVote.jsx 的逻辑，每次只保留当前用户的数据
      localStorage.setItem(
        "localEvaluations",
        JSON.stringify(newLocalEvaluations)
      );

      // 创建用于显示的测试数据摘要
      const allEvaluations = [];
      Object.values(newLocalEvaluations).forEach((userData) => {
        Object.values(userData.evaluations).forEach((evaluation) => {
          allEvaluations.push(evaluation);
        });
      });

      const testData = {
        userName: userName,
        userRole: userRole,
        userId: userId,
        generatedAt: new Date().toISOString(),
        localEvaluations: newLocalEvaluations,
        summary: {
          totalEvaluations: allEvaluations.length,
          jingkongCount: allEvaluations.filter(
            (e) => e.department === "jingkong"
          ).length,
          kaitouCount: allEvaluations.filter((e) => e.department === "kaitou")
            .length,
          averageScore: (
            allEvaluations.reduce((sum, e) => sum + e.totalScore, 0) /
            allEvaluations.length
          ).toFixed(1),
        },
      };

      setGeneratedData(testData);

      setMessage(
        `成功为 ${userName} 生成测试数据！共生成 ${allEvaluations.length} 条评价记录，已保存到 localEvaluations`
      );
      setMessageType("success");
      setName("");
    } catch (error) {
      console.error("生成测试数据失败:", error);
      setMessage("生成测试数据失败，请重试");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // 导出数据为JSON文件
  const exportData = () => {
    if (!generatedData) return;

    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `test-data-${generatedData.userName}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // 查看本地存储的测试数据
  const viewLocalData = () => {
    const localData = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );
    console.log("本地测试数据:", localData);
    const userCount = Object.keys(localData).length;
    setMessage(`本地共有 ${userCount} 个用户的测试数据，请查看控制台`);
    setMessageType("success");
  };

  // 清除本地测试数据
  const clearLocalData = () => {
    if (confirm("确定要清除所有本地测试数据吗？")) {
      localStorage.removeItem("localEvaluations");
      setGeneratedData(null);
      setMessage("已清除所有本地测试数据");
      setMessageType("success");
    }
  };

  const handleBack = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full space-y-6">
          {/* 标题和返回按钮 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">生成测试数据</h1>
              <p className="text-gray-600 mt-2">
                输入姓名生成对应的投票测试数据（仅保存在本地）
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={viewLocalData}>
                查看本地数据
              </Button>
              <Button variant="outline" onClick={clearLocalData}>
                清除本地数据
              </Button>
              <Button variant="outline" onClick={handleBack}>
                返回管理面板
              </Button>
            </div>
          </div>

          {/* 生成表单 */}
          <Card>
            <CardHeader>
              <CardTitle>测试数据生成</CardTitle>
              <CardDescription>
                输入姓名后，系统将自动生成该用户对应的投票测试数据，数据仅保存在浏览器本地存储中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  姓名
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerateData()}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">
                  评价部门（仅职能部门需要选择）
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={loading}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择要评价的部门（仅职能部门需要）</option>
                  <option value="jingkong">经控贸易</option>
                  <option value="kaitou">开投贸易</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  注：经控贸易和开投贸易用户会自动评价自己部门
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    messageType === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                onClick={handleGenerateData}
                disabled={loading || !name.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    生成中...
                  </>
                ) : (
                  "生成测试数据"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 生成的数据展示 */}
          {generatedData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>生成的测试数据</CardTitle>
                  <Button variant="outline" onClick={exportData}>
                    导出JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">用户姓名:</span>{" "}
                      {generatedData.userName}
                    </div>
                    <div>
                      <span className="font-medium">用户角色:</span>{" "}
                      {generatedData.userRole === "leader"
                        ? "负责人"
                        : generatedData.userRole === "employee"
                        ? "员工"
                        : "职能部门"}
                    </div>
                    <div>
                      <span className="font-medium">用户ID:</span>{" "}
                      {generatedData.userId}
                    </div>
                    <div>
                      <span className="font-medium">总评价数:</span>{" "}
                      {generatedData.summary.totalEvaluations}
                    </div>
                    <div>
                      <span className="font-medium">平均分数:</span>{" "}
                      {generatedData.summary.averageScore}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">评价详情（前5条）</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-2 py-1 text-left">
                              被评价人
                            </th>
                            <th className="border border-gray-200 px-2 py-1 text-left">
                              部门
                            </th>
                            <th className="border border-gray-200 px-2 py-1 text-left">
                              总分
                            </th>
                            <th className="border border-gray-200 px-2 py-1 text-left">
                              详细评分
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const allEvaluations = [];
                            if (
                              generatedData &&
                              generatedData.localEvaluations
                            ) {
                              Object.values(
                                generatedData.localEvaluations
                              ).forEach((userData) => {
                                if (userData && userData.evaluations) {
                                  Object.values(userData.evaluations).forEach(
                                    (evaluation) => {
                                      allEvaluations.push(evaluation);
                                    }
                                  );
                                }
                              });
                            }
                            return allEvaluations
                              .slice(0, 5)
                              .map((evaluation, index) => {
                                const personnel = [
                                  ...jingkongPersonnel,
                                  ...kaitouPersonnel,
                                ].find((p) => p.id === evaluation.personnelId);
                                return (
                                  <tr key={index}>
                                    <td className="border border-gray-200 px-2 py-1">
                                      {personnel?.name ||
                                        evaluation.personnelId}
                                    </td>
                                    <td className="border border-gray-200 px-2 py-1">
                                      {evaluation.department === "jingkong"
                                        ? "经控贸易"
                                        : "开投贸易"}
                                    </td>
                                    <td className="border border-gray-200 px-2 py-1">
                                      {evaluation.totalScore}
                                    </td>
                                    <td className="border border-gray-200 px-2 py-1">
                                      {Object.entries(evaluation.scores).map(
                                        ([criterion, score]) => (
                                          <span
                                            key={criterion}
                                            className="mr-2"
                                          >
                                            {criterion}: {score}
                                          </span>
                                        )
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 说明信息 */}
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 输入姓名后，系统会自动查找该用户的角色和部门信息</p>
                <p>• 根据用户角色自动生成对应的评价数据</p>
                <p>• 职能部门用户需要选择要评价的部门</p>
                <p>• 经控贸易和开投贸易用户会自动评价自己部门</p>
                <p>• 评价分数按照各部门等级分布要求生成：</p>
                <p> - 经控贸易：A≤11人，B=23-26人，C=18-21人，D+E=3-6人</p>
                <p> - 开投贸易：A≤3人，B=9-11人，C=6-8人，D+E=1-3人</p>
                <p> - 职能部门：A≤1人，B=2-3人，C=1-2人，D+E=0-1人</p>
                <p>• 数据仅保存在浏览器本地存储中，不会提交到服务器</p>
                <p>• 可以导出JSON文件或查看控制台中的完整数据</p>
                <p>• 数据格式严格按照 localEvaluations 的标准格式生成</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
