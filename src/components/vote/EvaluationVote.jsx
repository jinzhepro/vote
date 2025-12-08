"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EvaluationVote({ department, onBack, initialPersonId }) {
  const [personnel, setPersonnel] = useState([]);
  const [criteria, setCriteria] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(initialPersonId || "");
  const [evaluations, setEvaluations] = useState({});
  const [votes, setVotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vote"); // "vote" 或 "results"

  // 获取部门人员
  const fetchPersonnel = async () => {
    try {
      const response = await fetch("/api/personnel");
      const data = await response.json();
      if (data.success) {
        // 映射部门代码到实际的人员类型
        const departmentTypeMap = {
          jingkong: "经控贸易",
          kaitou: "开投贸易",
          "kaitou-dispatch": "开投贸易派遣",
        };

        const targetType = departmentTypeMap[department] || department;
        const filteredPersonnel = Object.values(data.personnel).filter(
          (person) => person.type === targetType
        );
        setPersonnel(filteredPersonnel);
      }
    } catch (error) {
      console.error("获取人员失败:", error);
    }
  };

  // 获取投票结果和评分标准
  const fetchVotes = async () => {
    try {
      const response = await fetch(
        `/api/department-vote?department=${department}`
      );
      const data = await response.json();
      if (data.success) {
        setVotes(data.votes || {});
        setCriteria(data.criteria || {});

        // 如果评分标准为空，则初始化
        if (!data.criteria || Object.keys(data.criteria).length === 0) {
          await initializeCriteria();
        }
      }
    } catch (error) {
      console.error("获取投票失败:", error);
    }
  };

  // 初始化评分标准
  const initializeCriteria = async () => {
    try {
      const response = await fetch("/api/department-vote", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ department }),
      });

      const data = await response.json();
      if (data.success) {
        setCriteria(data.criteria);
      }
    } catch (error) {
      console.error("初始化评分标准失败:", error);
    }
  };

  // 提交评价
  const submitEvaluation = async () => {
    // 检查是否所有评分标准都已选择
    const requiredCriteria = Object.keys(criteria);
    const selectedCriteria = Object.keys(evaluations);

    if (requiredCriteria.length !== selectedCriteria.length) {
      toast.error("请完成所有评分项目");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/department-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department,
          personId: selectedPerson,
          evaluations,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`评价提交成功！总分：${data.totalScore}分`);
        setEvaluations({});
        await fetchVotes();
      } else {
        toast.error(data.error || "评价提交失败");
      }
    } catch (error) {
      console.error("评价提交失败:", error);
      toast.error("评价提交失败");
    } finally {
      setLoading(false);
    }
  };

  // 重置投票
  const resetVotes = async () => {
    const confirmed = await new Promise((resolve) => {
      toast("确定要重置所有评价数据吗？", {
        action: {
          label: "确定",
          onClick: () => resolve(true),
        },
        cancel: {
          label: "取消",
          onClick: () => resolve(false),
        },
      });
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/department-vote?department=${department}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setVotes({});
        toast.success("评价数据已重置");
      } else {
        toast.error(data.error || "重置失败");
      }
    } catch (error) {
      console.error("重置失败:", error);
      toast.error("重置失败");
    }
  };

  // 处理评分选择
  const handleEvaluationChange = (criterion, score) => {
    setEvaluations((prev) => ({
      ...prev,
      [criterion]: score,
    }));
  };

  // 计算总分
  const calculateTotalScore = () => {
    return Object.values(evaluations).reduce((sum, score) => sum + score, 0);
  };

  // 获取评价结果统计
  const getResultsStats = () => {
    const results = Object.values(votes);
    const personStats = {};

    results.forEach((vote) => {
      const personId = vote.personId;
      if (!personStats[personId]) {
        personStats[personId] = {
          personId,
          count: 0,
          totalScore: 0,
          averageScore: 0,
          evaluations: {},
        };
      }

      personStats[personId].count++;
      personStats[personId].totalScore += vote.totalScore;

      // 统计各项评分
      Object.entries(vote.evaluations).forEach(([criterion, score]) => {
        if (!personStats[personId].evaluations[criterion]) {
          personStats[personId].evaluations[criterion] = { total: 0, count: 0 };
        }
        personStats[personId].evaluations[criterion].total += score;
        personStats[personId].evaluations[criterion].count++;
      });
    });

    // 计算平均分
    Object.values(personStats).forEach((stat) => {
      stat.averageScore = stat.totalScore / stat.count;
      Object.values(stat.evaluations).forEach((evalStat) => {
        evalStat.average = evalStat.total / evalStat.count;
      });
    });

    return personStats;
  };

  useEffect(() => {
    fetchPersonnel();
    fetchVotes();
  }, [department]);

  const getDepartmentName = () => {
    const names = {
      jingkong: "经控贸易",
      kaitou: "开投贸易",
      "kaitou-dispatch": "开投贸易派遣",
    };
    return names[department] || department;
  };

  const resultsStats = getResultsStats();

  return (
    <div className="space-y-6 w-full">
      {/* 标题和导航 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {getDepartmentName()} - 人员评价系统
          </h1>
          <p className="text-gray-600 mt-2">基于多维度评分标准的人员评价系统</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← 返回首页
        </Button>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "vote" ? "default" : "outline"}
          onClick={() => setActiveTab("vote")}
        >
          进行评价
        </Button>
        <Button
          variant={activeTab === "results" ? "default" : "outline"}
          onClick={() => setActiveTab("results")}
        >
          查看结果
        </Button>
      </div>

      {activeTab === "vote" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 评分标准 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>评分标准</CardTitle>
                <CardDescription>
                  {selectedPerson
                    ? `正在评价：${
                        personnel.find((p) => p.id === selectedPerson)?.name
                      }`
                    : "请指定要评价的人员"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(criteria).map(([key, criterion]) => (
                  <div key={key} className="space-y-3">
                    <div>
                      <h4 className="font-medium">{criterion.name}</h4>
                      <p className="text-sm text-gray-600">
                        {criterion.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {criterion.options.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                            evaluations[key] === option.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name={key}
                            value={option.value}
                            checked={evaluations[key] === option.value}
                            onChange={() =>
                              handleEvaluationChange(key, option.value)
                            }
                            disabled={!selectedPerson}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {option.value}分
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 当前人员信息和评价汇总 - 合并粘性容器 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* 当前人员信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>当前评价人员</CardTitle>
                  <CardDescription>正在评价的人员信息</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedPerson ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {personnel
                              .find((p) => p.id === selectedPerson)
                              ?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold">
                          {personnel.find((p) => p.id === selectedPerson)?.name}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">部门：</span>
                          <span className="font-medium">
                            {
                              personnel.find((p) => p.id === selectedPerson)
                                ?.department
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">类型：</span>
                          <span className="font-medium">
                            {
                              personnel.find((p) => p.id === selectedPerson)
                                ?.type
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ID：</span>
                          <span className="font-medium">{selectedPerson}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      未指定评价人员
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 评价汇总 */}
              <Card>
                <CardHeader>
                  <CardTitle>评价汇总</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 总分显示 */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      当前总分
                    </div>
                    <div className="text-4xl font-bold text-blue-600">
                      {calculateTotalScore()}
                    </div>
                    <div className="text-sm text-gray-500">分</div>
                  </div>

                  {/* 进度指示 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>完成进度</span>
                      <span>
                        {Object.keys(evaluations).length}/
                        {Object.keys(criteria).length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (Object.keys(evaluations).length /
                              Object.keys(criteria).length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <div className="space-y-2">
                    <Button
                      onClick={submitEvaluation}
                      disabled={
                        loading ||
                        !selectedPerson ||
                        Object.keys(evaluations).length !==
                          Object.keys(criteria).length
                      }
                      className="w-full"
                    >
                      {loading ? "提交中..." : "提交评价"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetVotes}
                      className="w-full"
                    >
                      重置数据
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>评价结果</CardTitle>
            <CardDescription>查看所有人员的评价统计结果</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(resultsStats).length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无评价数据</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(resultsStats).map(([personId, stats]) => {
                  const person = personnel.find((p) => p.id === personId);
                  return (
                    <div key={personId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{person?.name}</h3>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">平均分</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.averageScore.toFixed(1)}分
                          </div>
                          <div className="text-sm text-gray-500">
                            共{stats.count}次评价
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(stats.evaluations).map(
                          ([criterion, evalStat]) => {
                            const criterionInfo = criteria[criterion];
                            return (
                              <div
                                key={criterion}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-medium">
                                  {criterionInfo?.name}
                                </span>
                                <span className="text-sm font-bold">
                                  {evalStat.average.toFixed(1)}分
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
