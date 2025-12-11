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
import { LoadingButton, LoadingSpinner } from "@/components/ui/loading";
import {
  defaultCriteria,
  calculateTotalScore as calculateScore,
  getScoreGrade,
  validateGradeDistribution,
  getGradeDistributionSuggestions,
} from "@/data/evaluationCriteria";
import { getPersonnelByDepartment } from "@/data/personnelData";
import { getDeviceId } from "@/lib/deviceId";

export function EvaluationVote({ department, onBack, initialPersonId }) {
  const [personnel, setPersonnel] = useState([]);
  const [criteria, setCriteria] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(initialPersonId || "");
  const [evaluations, setEvaluations] = useState({});
  const [votes, setVotes] = useState({});
  const [userEvaluations, setUserEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [selectedPersonDetails, setSelectedPersonDetails] = useState(null);

  // 初始化设备ID
  const initializeDeviceId = () => {
    const currentRole = getCurrentRole();
    const isLeader = currentRole === "leader";
    const deviceId = getDeviceId(isLeader);
    setUserId(deviceId);
    return deviceId;
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
      setPersonnel([]);
    }
  };

  // 获取投票结果和评分标准（从本地存储）
  const fetchVotes = async () => {
    try {
      const currentDeviceId = userId || initializeDeviceId();

      // 从本地存储获取评价数据
      const localEvaluations = loadEvaluationsFromLocal();
      setUserEvaluations(localEvaluations);

      setCriteria(defaultCriteria);
      setVotes({});
    } catch (error) {
      console.error("获取投票失败:", error);
    }
  };

  // 获取用户详情
  const fetchPersonDetails = async (personId) => {
    if (!personId) {
      setSelectedPersonDetails(null);
      return;
    }

    try {
      // 从当前人员列表中查找
      const personDetails = personnel.find((p) => p.id === personId);

      if (personDetails) {
        setSelectedPersonDetails({
          ...personDetails,
          department: department,
          department_name: getDepartmentName(),
        });
      } else {
        setSelectedPersonDetails(null);
      }
    } catch (error) {
      console.error("获取用户详情失败:", error);
      setSelectedPersonDetails(null);
    }
  };

  // 保存评价到本地存储
  const saveEvaluationToLocal = (personnelId, evaluationsData, totalScore) => {
    const currentDeviceId = userId || initializeDeviceId();
    const currentRole = getCurrentRole();

    // 获取本地存储的评价数据
    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    // 创建新的 localEvaluations 时删除其他 localEvaluations
    // 只保留当前设备ID的评价数据
    const newLocalEvaluations = {};
    if (localEvaluations[currentDeviceId]) {
      newLocalEvaluations[currentDeviceId] = localEvaluations[currentDeviceId];
    }

    // 确保用户数据存在
    if (!newLocalEvaluations[currentDeviceId]) {
      newLocalEvaluations[currentDeviceId] = {
        department: department,
        role: currentRole,
        evaluations: {},
      };
    }

    // 保存当前评价
    newLocalEvaluations[currentDeviceId].evaluations[personnelId] = {
      personnelId: personnelId,
      scores: evaluationsData,
      totalScore: totalScore,
      timestamp: new Date().toISOString(),
      department: department,
      role: currentRole,
    };

    // 保存到本地存储
    localStorage.setItem(
      "localEvaluations",
      JSON.stringify(newLocalEvaluations)
    );

    return newLocalEvaluations[currentDeviceId];
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

  // 批量提交本地存储的所有评价（调用API）
  const submitAllLocalEvaluations = async () => {
    const currentDeviceId = userId || initializeDeviceId();
    const localEvaluations = JSON.parse(
      localStorage.getItem("localEvaluations") || "{}"
    );

    if (!localEvaluations[currentDeviceId]) {
      return { success: true, message: "没有需要提交的评价" };
    }

    const userData = localEvaluations[currentDeviceId];
    const evaluations = userData.evaluations;
    const evaluationIds = Object.keys(evaluations);

    if (evaluationIds.length === 0) {
      return { success: true, message: "没有需要提交的评价" };
    }

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
        // 记录已完成的部门（仅对职能部门用户）
        const currentRole = getCurrentRole();
        if (currentRole === "functional") {
          const completedDepts = JSON.parse(
            localStorage.getItem("completedDepartments") || "[]"
          );
          if (!completedDepts.includes(department)) {
            completedDepts.push(department);
            localStorage.setItem(
              "completedDepartments",
              JSON.stringify(completedDepts)
            );
          }
        }

        // 提交成功后只清空当前部门的评价数据，保留其他部门的数据
        const currentDeviceId = userId || initializeDeviceId();
        const localEvaluations = JSON.parse(
          localStorage.getItem("localEvaluations") || "{}"
        );

        if (localEvaluations[currentDeviceId]) {
          // 清空当前部门的评价数据，但保留用户信息
          localEvaluations[currentDeviceId].evaluations = {};
          localStorage.setItem(
            "localEvaluations",
            JSON.stringify(localEvaluations)
          );
        }

        return {
          success: true,
          message:
            result.message || `成功提交 ${result.results?.length || 0} 个评价`,
          results: result.results || [],
          errors: result.errors || [],
        };
      } else {
        return {
          success: false,
          message: result.message || "批量提交失败",
          results: result.results || [],
          errors: result.errors || [],
        };
      }
    } catch (error) {
      console.error("批量提交失败:", error);
      return {
        success: false,
        message: "批量提交失败",
        errors: [{ error: error.message }],
      };
    }
  };

  // 处理评分选择
  const handleEvaluationChange = (criterion, score) => {
    setEvaluations((prev) => ({
      ...prev,
      [criterion]: score,
    }));
  };

  // 重置为默认分数
  const resetToDefaultScores = () => {
    setEvaluations({});
    toast.info("已清空所有评分");
  };

  // 设置为默认分数
  const setToDefaultScores = () => {
    const defaultEvals = getDefaultEvaluations();
    setEvaluations(defaultEvals);
    toast.info("已设置为默认评分");
  };

  // 获取默认评分（每个评价标准的中间值）
  const getDefaultEvaluations = () => {
    const defaultEvals = {};
    Object.entries(criteria).forEach(([key, criterion]) => {
      // 获取所有选项的分数并排序，选择中间值
      const scores = criterion.options
        .map((option) => option.value)
        .sort((a, b) => a - b);
      const middleIndex = Math.floor(scores.length / 2);
      defaultEvals[key] = scores[middleIndex];
    });
    return defaultEvals;
  };

  // 检查某个评分是否为默认值
  const isDefaultValue = (criterion, score) => {
    const defaultEvals = getDefaultEvaluations();
    return defaultEvals[criterion] === score;
  };

  // 当选择人员时，如果该用户已经评价过此人，则加载之前的评价，否则设置默认分数
  const handlePersonChange = (personId) => {
    setSelectedPerson(personId);
    fetchPersonDetails(personId);

    // 获取合并后的评价数据
    const mergedEvaluations = getMergedEvaluations();

    // 检查是否有评价记录
    if (mergedEvaluations[personId]) {
      setEvaluations(mergedEvaluations[personId].evaluations);
    } else {
      // 设置默认分数
      const defaultEvals = getDefaultEvaluations();
      setEvaluations(defaultEvals);
    }
  };

  // 当selectedPerson或userEvaluations变化时，自动加载评价
  useEffect(() => {
    if (selectedPerson) {
      // 获取合并后的评价数据
      const mergedEvaluations = getMergedEvaluations();

      // 检查是否有评价记录
      if (mergedEvaluations[selectedPerson]) {
        setEvaluations(mergedEvaluations[selectedPerson].evaluations);
      } else {
        // 如果没有评价记录，设置默认分数
        const defaultEvals = getDefaultEvaluations();
        setEvaluations(defaultEvals);
      }
    }
  }, [selectedPerson, userEvaluations]);

  // 随机选择一个未评价的人员并导航到该人员的评价页面
  const selectRandomUnevaluatedPerson = () => {
    const mergedEvaluations = getMergedEvaluations();
    const evaluatedPersonnel = new Set(Object.keys(mergedEvaluations));

    const unevaluatedPersonnel = personnel.filter(
      (person) => !evaluatedPersonnel.has(person.id)
    );

    if (unevaluatedPersonnel.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * unevaluatedPersonnel.length
      );
      const randomPerson = unevaluatedPersonnel[randomIndex];
      // 导航到该人员的评价页面
      window.location.href = `/vote/${department}/${getCurrentRole()}/${
        randomPerson.id
      }`;
    } else {
      toast.info("所有人员都已评价完成！");
    }
  };

  // 计算总分
  const calculateTotalScore = () => {
    return calculateScore(evaluations);
  };

  useEffect(() => {
    const initializeData = async () => {
      initializeDeviceId();
      await fetchPersonnel();
      await fetchVotes(); // 这会调用 loadEvaluationsFromLocal 并设置 userEvaluations
      setInitialLoading(false);
    };
    initializeData();
  }, [department]);

  // 当有初始人员ID时，获取该人员的详情
  useEffect(() => {
    if (initialPersonId && personnel.length > 0) {
      fetchPersonDetails(initialPersonId);
      setSelectedPerson(initialPersonId);
    }
  }, [initialPersonId, personnel]);

  const getDepartmentName = () => {
    const names = {
      jingkong: "经控贸易",
      kaitou: "开投贸易",
    };
    return names[department] || department;
  };

  const getCurrentRole = () => {
    // 从当前URL路径中获取角色信息
    const pathParts = window.location.pathname.split("/");
    const departmentIndex = pathParts.findIndex((part) => part === department);
    if (departmentIndex !== -1 && pathParts[departmentIndex + 1]) {
      return pathParts[departmentIndex + 1];
    }
    // 默认返回leader
    return "leader";
  };

  // 获取合并后的评价状态（服务器+本地）
  const getMergedEvaluations = () => {
    const localEvaluations = loadEvaluationsFromLocal();
    return {
      ...localEvaluations,
      ...userEvaluations,
    };
  };

  // 检查评价是否存在（所有评价都是本地的）
  const hasEvaluation = (personId) => {
    const evaluation = getMergedEvaluations()[personId];
    return evaluation !== undefined;
  };

  // 保存到本地并下一个
  const saveAndNext = async () => {
    // 检查是否所有评分标准都已选择
    const requiredCriteria = Object.keys(criteria);
    const selectedCriteria = Object.keys(evaluations);

    if (requiredCriteria.length !== selectedCriteria.length) {
      toast.error("请完成所有评分项目");
      return;
    }

    setLoading(true);
    try {
      const currentDeviceId = userId || initializeDeviceId();
      const totalScore = calculateTotalScore();

      // 保存到本地存储
      saveEvaluationToLocal(selectedPerson, evaluations, totalScore);

      // 更新本地评价数据以反映当前状态
      const localEvaluations = loadEvaluationsFromLocal();
      const updatedEvaluations = {
        ...localEvaluations,
        ...userEvaluations,
      };
      setUserEvaluations(updatedEvaluations);

      toast.success(`评价已保存到本地！总分：${totalScore}分`);

      // 自动跳转到下一个未评价的人员
      setTimeout(() => {
        const mergedEvaluations = getMergedEvaluations();
        const evaluatedPersonnel = new Set(Object.keys(mergedEvaluations));
        const unevaluatedPersonnel = personnel.filter(
          (person) => !evaluatedPersonnel.has(person.id)
        );

        if (unevaluatedPersonnel.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * unevaluatedPersonnel.length
          );
          const randomPerson = unevaluatedPersonnel[randomIndex];
          // 导航到该人员的评价页面
          window.location.href = `/vote/${department}/${getCurrentRole()}/${
            randomPerson.id
          }`;
        } else {
          toast.info("所有人员都已评价完成！");
        }
      }, 1000);
    } catch (error) {
      console.error("评价保存失败:", error);
      toast.error(error.message || "评价保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 重新保存当前评价
  const resaveEvaluation = async () => {
    // 检查是否所有评分标准都已选择
    const requiredCriteria = Object.keys(criteria);
    const selectedCriteria = Object.keys(evaluations);

    if (requiredCriteria.length !== selectedCriteria.length) {
      toast.error("请完成所有评分项目");
      return;
    }

    setLoading(true);
    try {
      const currentDeviceId = userId || initializeDeviceId();
      const totalScore = calculateTotalScore();

      // 保存到本地存储
      saveEvaluationToLocal(selectedPerson, evaluations, totalScore);

      // 重新加载最新的本地评价数据
      const latestEvaluations = loadEvaluationsFromLocal();

      // 更新状态以触发重新渲染
      setUserEvaluations(latestEvaluations);

      toast.success(`评价已重新保存！总分：${totalScore}分`);
      // 不跳转，让用户继续在当前页面
    } catch (error) {
      console.error("评价保存失败:", error);
      toast.error(error.message || "评价保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 提交所有评价
  const submitAllEvaluations = async () => {
    // 检查是否所有评分标准都已选择
    const requiredCriteria = Object.keys(criteria);
    const selectedCriteria = Object.keys(evaluations);

    if (requiredCriteria.length !== selectedCriteria.length) {
      toast.error("请完成所有评分项目");
      return;
    }

    setLoading(true);
    try {
      const currentDeviceId = userId || initializeDeviceId();
      const totalScore = calculateTotalScore();

      // 先保存当前评价到本地存储
      saveEvaluationToLocal(selectedPerson, evaluations, totalScore);

      // 重新加载最新的本地评价数据
      const latestEvaluations = loadEvaluationsFromLocal();

      // 更新状态以触发重新渲染
      setUserEvaluations(latestEvaluations);

      // 验证等级分布（对经控贸易和开投贸易部门）
      if (department === "jingkong" || department === "kaitou") {
        const validation = validateGradeDistribution(
          latestEvaluations,
          department
        );

        if (!validation.valid) {
          // 显示详细的错误信息
          const suggestions = getGradeDistributionSuggestions(
            latestEvaluations,
            department
          );
          const suggestionText =
            suggestions.length > 0
              ? suggestions.map((s) => `• ${s.message}`).join("\n")
              : "";

          toast.error(
            `等级分布不符合要求！\n${validation.message}\n\n调整建议：\n${suggestionText}`,
            {
              duration: 8000,
              style: {
                whiteSpace: "pre-line",
                maxWidth: "500px",
              },
            }
          );

          // 在控制台输出详细信息供调试
          console.log("等级分布验证失败:", validation.details);
          return;
        }
      }

      // 显示全屏loading并保存所有本地存储的评价
      setSubmitting(true);
      const result = await submitAllLocalEvaluations();

      if (result.success) {
        toast.success(`所有评价提交成功！${result.message}`);
        // 直接跳转到成功页面
        window.location.href = `/vote/success`;
      } else {
        toast.error(`评价提交失败：${result.message}`);
        if (result.errors.length > 0) {
          console.error("提交错误:", result.errors);
        }
      }
      setSubmitting(false);
    } catch (error) {
      console.error("评价提交失败:", error);
      toast.error(error.message || "评价提交失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取按钮禁用状态
  const getButtonDisabled = () => {
    return (
      loading ||
      !selectedPerson ||
      Object.keys(evaluations).length !== Object.keys(criteria).length
    );
  };

  // 获取重置按钮禁用状态
  const getResetButtonDisabled = () => {
    return (
      !selectedPerson || (hasEvaluation(selectedPerson) && false) // 所有评价都可以重置
    );
  };

  // 检查是否为最后一个人
  const isLastPerson = () => {
    const evaluatedPersonnel = new Set(Object.keys(getMergedEvaluations()));
    const unevaluatedPersonnel = personnel.filter(
      (person) => !evaluatedPersonnel.has(person.id)
    );

    return (
      unevaluatedPersonnel.length === 0 ||
      (unevaluatedPersonnel.length === 1 &&
        unevaluatedPersonnel[0].id === selectedPerson)
    );
  };

  return (
    <div className="flex-1 space-y-6 w-full">
      {/* 标题和导航 */}
      <div className="flex items-center justify-start">
        <div>
          <h1 className="text-3xl font-semibold">
            {getDepartmentName()} - 人员评价系统
          </h1>
          <p className="text-gray-600 mt-2">基于多维度评分标准的人员评价系统</p>
        </div>
      </div>

      {/* 初始加载状态 */}
      {initialLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}

      {/* 主要内容 */}
      {!initialLoading && (
        <div className="space-y-6">
          {/* 总体进度 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">评价进度</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    已完成 {Object.keys(getMergedEvaluations()).length} /{" "}
                    {personnel.length} 人
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (Object.keys(getMergedEvaluations()).length /
                        personnel.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-500">完成率</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (Object.keys(getMergedEvaluations()).length /
                          personnel.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 评分标准 */}
            <div className="lg:col-span-3">
              <Card>
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
                        {criterion.options.map((option) => {
                          const mergedEvaluations = getMergedEvaluations();
                          return (
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
                                disabled={
                                  !selectedPerson ||
                                  (mergedEvaluations[selectedPerson] && false) // 所有评价都可以编辑
                                }
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {option.value}分
                                  {mergedEvaluations[selectedPerson] &&
                                    mergedEvaluations[selectedPerson]
                                      .evaluations[key] === option.value && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        已保存
                                      </span>
                                    )}
                                  {isDefaultValue(key, option.value) && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      默认
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {option.label}
                                </div>
                              </div>
                            </label>
                          );
                        })}
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
                  </CardHeader>
                  <CardContent>
                    {selectedPerson ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                              getMergedEvaluations()[selectedPerson]
                                ? "bg-green-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <span
                              className={`text-2xl font-bold ${
                                getMergedEvaluations()[selectedPerson]
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {selectedPersonDetails?.name?.charAt(0) ||
                                personnel
                                  .find((p) => p.id === selectedPerson)
                                  ?.name?.charAt(0) ||
                                "?"}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                            {selectedPersonDetails?.name ||
                              personnel.find((p) => p.id === selectedPerson)
                                ?.name}
                            {getMergedEvaluations()[selectedPerson] && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ✓ 已保存
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">部门：</span>
                            <span className="font-medium">
                              {selectedPersonDetails?.department_name ||
                                selectedPersonDetails?.department ||
                                personnel.find((p) => p.id === selectedPerson)
                                  ?.department}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ID：</span>
                            <span className="font-medium">
                              {selectedPerson}
                            </span>
                          </div>
                          {getMergedEvaluations()[selectedPerson] && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">评分：</span>
                              <span className="font-medium text-green-600">
                                {
                                  getMergedEvaluations()[selectedPerson]
                                    .totalScore
                                }
                                分
                              </span>
                            </div>
                          )}
                          {getMergedEvaluations()[selectedPerson] && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">评价时间：</span>
                              <span className="font-medium text-green-600">
                                {new Date(
                                  getMergedEvaluations()[
                                    selectedPerson
                                  ].timestamp
                                ).toLocaleString("zh-CN")}
                              </span>
                            </div>
                          )}
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
                    {/* 当前评价进度 */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        当前评价进度
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">已完成项目：</span>
                          <span className="font-medium">
                            {Object.keys(evaluations).length} /{" "}
                            {Object.keys(criteria).length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (Object.keys(evaluations).length /
                                  Object.keys(criteria).length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          {Math.round(
                            (Object.keys(evaluations).length /
                              Object.keys(criteria).length) *
                              100
                          )}
                          %
                        </div>
                      </div>
                    </div>

                    {/* 总分显示 */}
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        当前总分
                      </div>
                      <div className="text-4xl font-bold text-blue-600">
                        {calculateTotalScore()}
                      </div>
                      <div className="text-sm text-gray-500">分</div>
                      <div className="text-lg font-medium mt-2">
                        {(() => {
                          const grade = getScoreGrade(calculateTotalScore());
                          return (
                            <span className={grade.color}>
                              {grade.grade} ({grade.letter})
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 本地存储状态 */}
                    {(() => {
                      const localEvaluations = loadEvaluationsFromLocal();
                      const localCount = Object.keys(localEvaluations).length;
                      if (localCount > 0) {
                        return (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-blue-800">
                              <div className="font-medium mb-1">
                                本地评价状态
                              </div>
                              <div>已保存 {localCount} 个评价到本地</div>
                              <div className="text-xs mt-1">
                                所有评价数据都保存在本地浏览器中
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* 返回人员列表按钮 */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/vote/${department}/${getCurrentRole()}`;
                      }}
                      className="w-full"
                    >
                      返回总览
                    </Button>

                    {/* 提交按钮 */}
                    <div className="space-y-2">
                      {/* 保存到本地并下一个按钮 - 仅在不是最后一个人时显示 */}
                      {!isLastPerson() && (
                        <Button
                          onClick={saveAndNext}
                          disabled={getButtonDisabled()}
                          className="w-full"
                        >
                          {loading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "保存并下一个"
                          )}
                        </Button>
                      )}

                      {/* 重新保存按钮  */}
                      <Button
                        onClick={resaveEvaluation}
                        disabled={getButtonDisabled()}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? <LoadingSpinner size="sm" /> : "保存"}
                      </Button>

                      {/* 提交所有评价按钮 - 仅在评价最后一个人员时显示 */}
                      {isLastPerson() && (
                        <Button
                          onClick={submitAllEvaluations}
                          disabled={getButtonDisabled()}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "保存并提交"
                          )}
                        </Button>
                      )}

                      {/* 设置默认评分按钮 */}
                      <Button
                        variant="outline"
                        onClick={setToDefaultScores}
                        className="w-full"
                        disabled={!selectedPerson}
                      >
                        设置默认评分
                      </Button>

                      {/* 重置按钮 */}
                      <Button
                        variant="outline"
                        onClick={() => setEvaluations({})}
                        className="w-full"
                        disabled={getResetButtonDisabled()}
                      >
                        清空所有评分
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

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
