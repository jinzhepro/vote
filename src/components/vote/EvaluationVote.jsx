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
import { getPersonnelByDepartment } from "@/data/personnelData";
import {
  defaultCriteria,
  calculateTotalScore as calculateScore,
} from "@/data/evaluationCriteria";
import { getDeviceId } from "@/lib/deviceId";

export function EvaluationVote({ department, onBack, initialPersonId }) {
  const [personnel, setPersonnel] = useState([]);
  const [criteria, setCriteria] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(initialPersonId || "");
  const [evaluations, setEvaluations] = useState({});
  const [votes, setVotes] = useState({});
  const [userEvaluations, setUserEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // 初始化设备ID
  const initializeDeviceId = () => {
    const deviceId = getDeviceId();
    setUserId(deviceId);
    return deviceId;
  };

  // 获取部门人员（从本地数据）
  const fetchPersonnel = () => {
    try {
      const personnelData = getPersonnelByDepartment(department);

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
    }
  };

  // 获取投票结果和评分标准（从localStorage）
  const fetchVotes = () => {
    try {
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

      setCriteria(defaultCriteria);
      setVotes({});
    } catch (error) {
      console.error("获取投票失败:", error);
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
      const currentDeviceId = userId || initializeDeviceId();
      const totalScore = calculateTotalScore();

      // 保存到localStorage
      const storageKey = `evaluations_${department}_${currentDeviceId}`;
      const existingEvaluations = localStorage.getItem(storageKey);
      let allEvaluations = {};

      if (existingEvaluations) {
        try {
          allEvaluations = JSON.parse(existingEvaluations);
        } catch (error) {
          console.error("解析现有评价失败:", error);
        }
      }

      // 更新评价数据
      allEvaluations[selectedPerson] = {
        evaluations: evaluations,
        totalScore: totalScore,
        timestamp: new Date().toISOString(),
        userId: currentDeviceId,
      };

      localStorage.setItem(storageKey, JSON.stringify(allEvaluations));

      toast.success(`评价提交成功！总分：${totalScore}分`);
      setEvaluations({});
      fetchVotes();
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
      const currentDeviceId = userId || initializeDeviceId();
      const storageKey = `evaluations_${department}_${currentDeviceId}`;
      localStorage.removeItem(storageKey);

      setVotes({});
      setUserEvaluations({});
      toast.success("评价数据已重置");
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

  // 当选择人员时，如果该用户已经评价过此人，则加载之前的评价
  const handlePersonChange = (personId) => {
    setSelectedPerson(personId);
    if (userEvaluations[personId]) {
      setEvaluations(userEvaluations[personId].evaluations);
    } else {
      setEvaluations({});
    }
  };

  // 当selectedPerson或userEvaluations变化时，自动加载评价
  useEffect(() => {
    if (selectedPerson && userEvaluations[selectedPerson]) {
      setEvaluations(userEvaluations[selectedPerson].evaluations);
    }
  }, [selectedPerson, userEvaluations]);

  // 随机选择一个未评价的人员并导航到该人员的评价页面
  const selectRandomUnevaluatedPerson = () => {
    const unevaluatedPersonnel = personnel.filter(
      (person) => !userEvaluations[person.id]
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
    initializeDeviceId();
    fetchPersonnel();
    fetchVotes();
  }, [department]);

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
                          <div className="font-medium text-sm flex items-center gap-2">
                            {option.value}分
                            {userEvaluations[selectedPerson] &&
                              userEvaluations[selectedPerson].evaluations[
                                key
                              ] === option.value && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  上次选择
                                </span>
                              )}
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
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                          userEvaluations[selectedPerson]
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <span
                          className={`text-2xl font-bold ${
                            userEvaluations[selectedPerson]
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {personnel
                            .find((p) => p.id === selectedPerson)
                            ?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                        {personnel.find((p) => p.id === selectedPerson)?.name}
                        {userEvaluations[selectedPerson] && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ 已评价
                          </span>
                        )}
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
                        <span className="text-gray-500">ID：</span>
                        <span className="font-medium">{selectedPerson}</span>
                      </div>
                      {userEvaluations[selectedPerson] && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">上次评分：</span>
                          <span className="font-medium text-green-600">
                            {userEvaluations[selectedPerson].totalScore}分
                          </span>
                        </div>
                      )}
                      {userEvaluations[selectedPerson] && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">评价时间：</span>
                          <span className="font-medium text-green-600">
                            {new Date(
                              userEvaluations[selectedPerson].timestamp
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
                    className={`w-full ${
                      userEvaluations[selectedPerson]
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                  >
                    {loading
                      ? "提交中..."
                      : userEvaluations[selectedPerson]
                      ? "更新评价"
                      : "提交评价"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={selectRandomUnevaluatedPerson}
                    className="w-full"
                    disabled={
                      personnel.filter((p) => !userEvaluations[p.id]).length ===
                      0
                    }
                  >
                    下一个 →
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
    </div>
  );
}
