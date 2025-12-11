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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading";
import * as XLSX from "xlsx";
import { jingkongPersonnel, kaitouPersonnel } from "@/data/personnelData";

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiJingkongPersonnel, setApiJingkongPersonnel] = useState([]);
  const [apiKaitouPersonnel, setApiKaitouPersonnel] = useState([]);
  const [selectedUserEvaluations, setSelectedUserEvaluations] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const loadPersonnelData = async () => {
    try {
      const jingkongResponse = await fetch(
        "/api/personnel?department=jingkong"
      );
      const kaitouResponse = await fetch("/api/personnel?department=kaitou");

      if (jingkongResponse.ok) {
        const jingkongResult = await jingkongResponse.json();
        if (jingkongResult.success) {
          setApiJingkongPersonnel(jingkongResult.data || []);
        } else {
          console.error("获取经控贸易人员数据失败:", jingkongResult.error);
        }
      } else {
        console.error("获取经控贸易人员数据失败");
      }

      if (kaitouResponse.ok) {
        const kaitouResult = await kaitouResponse.json();
        if (kaitouResult.success) {
          setApiKaitouPersonnel(kaitouResult.data || []);
        } else {
          console.error("获取开投贸易人员数据失败:", kaitouResult.error);
        }
      } else {
        console.error("获取开投贸易人员数据失败");
      }
    } catch (error) {
      console.error("加载人员数据失败:", error);
    }
  };

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      // 同时加载评价数据和人员数据
      const [evaluationsResponse] = await Promise.all([
        fetch("/api/evaluations?stats=true"),
        loadPersonnelData(),
      ]);

      const result = await evaluationsResponse.json();

      if (evaluationsResponse.ok && result.success) {
        setStats(result.data);
      } else {
        console.error("获取统计数据失败:", result.error);
      }
    } catch (error) {
      console.error("加载统计数据失败:", error);
    } finally {
      setLoading(false);
    }
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

  const clearAllData = async () => {
    if (confirm("确定要清除所有评价数据吗？此操作不可恢复。")) {
      try {
        // 这里可以添加清除数据库的 API 调用
        // const response = await fetch('/api/evaluations', { method: 'DELETE' });
        alert("功能开发中，请联系系统管理员清除数据库数据");
        loadEvaluations();
      } catch (error) {
        console.error("清除数据失败:", error);
        alert("清除数据失败，请联系系统管理员");
      }
    }
  };

  const handleUserClick = (userId, userStats) => {
    setSelectedUserEvaluations({
      userId: userId,
      role: userStats.role,
      department: userStats.department,
      evaluations: userStats.evaluations,
    });
    setShowUserDetails(true);
  };

  // 获取人员姓名的函数
  const getPersonnelName = (personnelId) => {
    // 在经控贸易人员中查找
    const jingkongPerson = apiJingkongPersonnel.find(
      (p) => p.id === personnelId || p.name === personnelId
    );
    if (jingkongPerson) return jingkongPerson.name;

    // 在开投贸易人员中查找
    const kaitouPerson = apiKaitouPersonnel.find(
      (p) => p.id === personnelId || p.name === personnelId
    );
    if (kaitouPerson) return kaitouPerson.name;

    // 如果找不到，返回原始ID
    return personnelId;
  };

  // 尝试通过userId获取用户姓名的函数
  const getUserNameById = (userId) => {
    // 检查是否是加密的userId格式（基于姓名生成的）
    if (userId.includes("_")) {
      const [prefix, hash] = userId.split("_");

      // 检查是否是有效的部门前缀
      if (["jingkong", "kaitou", "functional"].includes(prefix)) {
        // 尝试在所有人员中查找匹配的哈希值
        const allPersonnel = [...apiJingkongPersonnel, ...apiKaitouPersonnel];

        for (const person of allPersonnel) {
          // 模拟加密过程来匹配
          const createHash = (str) => {
            let hash = 0;
            if (str.length === 0) return hash;
            for (let i = 0; i < str.length; i++) {
              const char = str.charCodeAt(i);
              hash = (hash << 5) - hash + char;
              hash = hash & hash;
            }
            return Math.abs(hash);
          };

          const department = apiJingkongPersonnel.includes(person)
            ? "jingkong"
            : "kaitou";
          const combinedHash = createHash(`${person.name}_${department}`);
          const encryptedId = `${department}_${combinedHash}`;

          if (encryptedId === userId) {
            return person.name;
          }
        }

        // 对于职能部门，可能不在人员列表中，尝试从localStorage获取
        if (prefix === "functional") {
          const savedNames = JSON.parse(
            localStorage.getItem("functionalUserNames") || "{}"
          );
          for (const [name, savedId] of Object.entries(savedNames)) {
            if (savedId === userId) {
              return name;
            }
          }
        }
      }
    }

    // 如果无法解析，返回userId
    return userId;
  };

  // 评分标准中文映射
  const criterionNames = {
    responsibility: "责任心",
    diligence: "勤勉性",
    dedication: "爱岗敬业",
    cooperation: "合作性",
    knowledge: "专业知识",
    judgment: "判断能力",
    learning: "学习能力",
    effectiveness: "工作成效",
    quality: "工作质量",
    efficiency: "工作效率",
  };

  // 获取评分标准中文名称
  const getCriterionName = (criterion) => {
    return criterionNames[criterion] || criterion;
  };

  const getPersonnelEvaluations = (personnel) => {
    if (!stats || !stats.personnel) {
      return null;
    }

    // personnel 可能是字符串（名称）或对象（包含 id 和 name）
    const personnelId =
      typeof personnel === "string" ? personnel : personnel.id;
    const personnelName =
      typeof personnel === "string" ? personnel : personnel.name;

    // 尝试直接用 ID 查找
    if (stats.personnel[personnelId]) {
      return stats.personnel[personnelId];
    }

    // 尝试用名称查找
    if (stats.personnel[personnelName]) {
      return stats.personnel[personnelName];
    }

    // 如果直接查找失败，遍历所有评价数据，查找匹配的人员
    // 收集所有评价数据，查找匹配的人员
    let allEvaluations = [];
    for (const [key, value] of Object.entries(stats.personnel)) {
      if (value.evaluations && Array.isArray(value.evaluations)) {
        allEvaluations = allEvaluations.concat(value.evaluations);
      }
    }

    // 查找匹配的评价（先尝试匹配 ID，再尝试匹配名称）
    const matchingEvaluations = allEvaluations.filter((evaluation) => {
      return (
        evaluation.personnel_id === personnelId ||
        evaluation.personnel_id === personnelName
      );
    });

    if (matchingEvaluations.length > 0) {
      // 重新计算统计数据
      const totalScore = matchingEvaluations.reduce(
        (sum, e) => sum + e.total_score,
        0
      );
      const averageScore = (totalScore / matchingEvaluations.length).toFixed(1);

      return {
        count: matchingEvaluations.length,
        totalScore: totalScore,
        averageScore: averageScore,
        evaluations: matchingEvaluations,
      };
    }

    return null;
  };

  // 导出Excel功能
  const exportToExcel = (department, role) => {
    if (!stats || !stats.users) {
      alert("没有数据可导出");
      return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 获取指定部门的人员（作为列）
    const departmentPersonnel =
      department === "jingkong" ? apiJingkongPersonnel : apiKaitouPersonnel;
    const personnelColumns = departmentPersonnel.map((p) => p.name);

    // 表头：第一列为"评价人"，后面各列为被评价人员姓名
    const header = ["评价人", ...personnelColumns];
    const sheetData = [header];

    let filteredUsers;

    // 根据角色筛选用户
    if (role === "functional") {
      // 职能部门用户：筛选所有functional角色用户
      filteredUsers = Object.entries(stats.users).filter(
        ([_, user]) => user.role === "functional"
      );
    } else {
      // 其他角色：筛选指定部门和角色的用户
      filteredUsers = Object.entries(stats.users).filter(
        ([_, user]) => user.role === role && user.department === department
      );
    }

    // 为每个用户创建一行数据
    filteredUsers.forEach(([userId, userStats]) => {
      const row = [userId]; // 第一列是评价人ID

      // 为每个被评价人员查找该用户的评分
      personnelColumns.forEach((personName) => {
        const person = departmentPersonnel.find((p) => p.name === personName);
        if (person) {
          const evaluation = getPersonnelEvaluations(person);
          const userEvaluation = evaluation?.evaluations?.find(
            (e) => e.role === role && e.user_id === userId
          );
          row.push(userEvaluation ? userEvaluation.total_score : "");
        } else {
          row.push("");
        }
      });

      sheetData.push(row);
    });

    // 添加平均值行
    const averageRow = ["平均值"];
    personnelColumns.forEach((personName) => {
      const person = departmentPersonnel.find((p) => p.name === personName);
      if (person) {
        const evaluation = getPersonnelEvaluations(person);
        const roleEvaluations = evaluation?.evaluations?.filter(
          (e) => e.role === role
        );

        if (roleEvaluations && roleEvaluations.length > 0) {
          const totalScore = roleEvaluations.reduce(
            (sum, e) => sum + e.total_score,
            0
          );
          const averageScore = (totalScore / roleEvaluations.length).toFixed(1);
          averageRow.push(averageScore);
        } else {
          averageRow.push("");
        }
      } else {
        averageRow.push("");
      }
    });
    sheetData.push(averageRow);

    // 将数据添加到工作簿
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    let sheetName, fileName;
    if (role === "functional") {
      sheetName = `职能部门对${
        department === "jingkong" ? "经控贸易" : "开投贸易"
      }评价`;
      fileName = `职能部门${
        department === "jingkong" ? "经控贸易" : "开投贸易"
      }评价数据_${new Date().toISOString().split("T")[0]}.xlsx`;
    } else {
      sheetName = `${department === "jingkong" ? "经控贸易" : "开投贸易"}${
        role === "leader" ? "负责人" : "员工"
      }评价`;
      fileName = `${department === "jingkong" ? "经控贸易" : "开投贸易"}${
        role === "leader" ? "负责人" : "员工"
      }评价数据_${new Date().toISOString().split("T")[0]}.xlsx`;
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 导出文件
    XLSX.writeFile(wb, fileName);
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

          {/* 用户统计 - 按部门分开显示 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户投票统计</CardTitle>
                <CardDescription>
                  所有用户的投票详情，按部门分开显示
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* 经控贸易用户统计 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-blue-600">
                        经控贸易 - 用户投票详情
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel("jingkong", "leader")}
                      >
                        导出负责人Excel
                      </Button>
                    </div>

                    {/* Leader 统计 */}
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-3 text-blue-600">
                        部门负责人 (Leader)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "leader" &&
                          user.department === "jingkong"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  用户ID
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  部门
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  投票时间
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "leader" &&
                                      user.department === "jingkong"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr key={userId}>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        <div>
                                          <div className="font-medium">
                                            {getUserNameById(userId)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {userId}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        经控贸易
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        {userStats.evaluations &&
                                        userStats.evaluations.length > 0 ? (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            已完成
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            未完成
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无经控贸易部门负责人投票数据
                        </div>
                      )}
                    </div>

                    {/* 员工统计 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg text-green-600">
                          普通员工 (Employee)
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel("jingkong", "employee")}
                        >
                          导出员工Excel
                        </Button>
                      </div>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "employee" &&
                          user.department === "jingkong"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  用户ID
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  部门
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  投票时间
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "employee" &&
                                      user.department === "jingkong"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr key={userId}>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        <div>
                                          <div className="font-medium">
                                            {getUserNameById(userId)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {userId}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        经控贸易
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        {userStats.evaluations &&
                                        userStats.evaluations.length > 0 ? (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            已完成
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            未完成
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无经控贸易员工投票数据
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 开投贸易用户统计 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-green-600">
                        开投贸易 - 用户投票详情
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToExcel("kaitou", "leader")}
                      >
                        导出负责人Excel
                      </Button>
                    </div>

                    {/* Leader 统计 */}
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-3 text-blue-600">
                        部门负责人 (Leader)
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "leader" && user.department === "kaitou"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  用户ID
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  部门
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  投票时间
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "leader" &&
                                      user.department === "kaitou"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr key={userId}>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        <div>
                                          <div className="font-medium">
                                            {getUserNameById(userId)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {userId}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        开投贸易
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                      <td className="border border-blue-200 px-4 py-2 text-sm">
                                        {userStats.evaluations &&
                                        userStats.evaluations.length > 0 ? (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            已完成
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            未完成
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无开投贸易部门负责人投票数据
                        </div>
                      )}
                    </div>

                    {/* 员工统计 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg text-green-600">
                          普通员工 (Employee)
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel("kaitou", "employee")}
                        >
                          导出员工Excel
                        </Button>
                      </div>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) =>
                          user.role === "employee" &&
                          user.department === "kaitou"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  用户ID
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  部门
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  投票时间
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) =>
                                      user.role === "employee" &&
                                      user.department === "kaitou"
                                  )
                                  .map(([userId, userStats]) => (
                                    <tr key={userId}>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        <div>
                                          <div className="font-medium">
                                            {getUserNameById(userId)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {userId}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        开投贸易
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm text-gray-600">
                                        {userStats.evaluations[0]
                                          ? new Date(
                                              userStats.evaluations[0].timestamp
                                            ).toLocaleString("zh-CN")
                                          : "无"}
                                      </td>
                                      <td className="border border-green-200 px-4 py-2 text-sm">
                                        {userStats.evaluations &&
                                        userStats.evaluations.length > 0 ? (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            已完成
                                          </span>
                                        ) : (
                                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            未完成
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无开投贸易员工投票数据
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 职能部门用户统计 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-purple-600">
                        职能部门 - 用户投票详情
                      </h3>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            exportToExcel("jingkong", "functional")
                          }
                        >
                          导出经控贸易Excel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToExcel("kaitou", "functional")}
                        >
                          导出开投贸易Excel
                        </Button>
                      </div>
                    </div>

                    {/* 经控贸易评价统计 */}
                    <div className="mb-6">
                      <h4 className="font-medium text-lg mb-3 text-blue-600">
                        经控贸易
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) => user.role === "functional"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  用户ID
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  部门
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  投票时间
                                </th>
                                <th className="border border-blue-200 px-4 py-2 text-left text-sm font-medium text-blue-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) => user.role === "functional"
                                  )
                                  .map(([userId, userStats]) => {
                                    const jingkongEvals =
                                      userStats.evaluations?.filter(
                                        (e) => e.department === "jingkong"
                                      ) || [];

                                    return (
                                      <tr key={userId}>
                                        <td className="border border-blue-200 px-4 py-2 text-sm">
                                          <div>
                                            <div className="font-medium">
                                              {getUserNameById(userId)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {userId}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="border border-blue-200 px-4 py-2 text-sm">
                                          经控贸易
                                        </td>
                                        <td className="border border-blue-200 px-4 py-2 text-sm text-gray-600">
                                          {jingkongEvals.length > 0
                                            ? new Date(
                                                Math.max(
                                                  ...jingkongEvals.map(
                                                    (e) => new Date(e.timestamp)
                                                  )
                                                )
                                              ).toLocaleString("zh-CN")
                                            : "无"}
                                        </td>
                                        <td className="border border-blue-200 px-4 py-2 text-sm">
                                          {jingkongEvals.length > 0 ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              已完成
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              未完成
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无职能部门对经控贸易的投票数据
                        </div>
                      )}
                    </div>

                    {/* 开投贸易评价统计 */}
                    <div>
                      <h4 className="font-medium text-lg text-green-600">
                        开投贸易
                      </h4>
                      {stats &&
                      Object.entries(stats.users).filter(
                        ([_, user]) => user.role === "functional"
                      ).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  用户ID
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  部门
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  投票时间
                                </th>
                                <th className="border border-green-200 px-4 py-2 text-left text-sm font-medium text-green-800">
                                  完成状态
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats &&
                                Object.entries(stats.users)
                                  .filter(
                                    ([_, user]) => user.role === "functional"
                                  )
                                  .map(([userId, userStats]) => {
                                    const kaitouEvals =
                                      userStats.evaluations?.filter(
                                        (e) => e.department === "kaitou"
                                      ) || [];

                                    return (
                                      <tr key={userId}>
                                        <td className="border border-green-200 px-4 py-2 text-sm">
                                          <div>
                                            <div className="font-medium">
                                              {getUserNameById(userId)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {userId}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="border border-green-200 px-4 py-2 text-sm">
                                          开投贸易
                                        </td>
                                        <td className="border border-green-200 px-4 py-2 text-sm text-gray-600">
                                          {kaitouEvals.length > 0
                                            ? new Date(
                                                Math.max(
                                                  ...kaitouEvals.map(
                                                    (e) => new Date(e.timestamp)
                                                  )
                                                )
                                              ).toLocaleString("zh-CN")
                                            : "无"}
                                        </td>
                                        <td className="border border-green-200 px-4 py-2 text-sm">
                                          {kaitouEvals.length > 0 ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              已完成
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              未完成
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          暂无职能部门对开投贸易的投票数据
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 用户评价详情弹窗 */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-h-[80vh] overflow-y-auto m:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              用户评价详情 - {selectedUserEvaluations?.userId}
            </DialogTitle>
            <DialogDescription>
              角色:{" "}
              {selectedUserEvaluations?.role === "leader"
                ? "部门负责人"
                : selectedUserEvaluations?.role === "functional"
                ? "职能部门"
                : "普通员工"}{" "}
              | 部门:{" "}
              {selectedUserEvaluations?.department === "jingkong"
                ? "经控贸易"
                : selectedUserEvaluations?.department === "kaitou"
                ? "开投贸易"
                : selectedUserEvaluations?.department === "functional"
                ? "职能部门"
                : "未知"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              评价记录 ({selectedUserEvaluations?.evaluations?.length || 0})
            </h3>

            {selectedUserEvaluations?.evaluations?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-800">
                        被评价人员
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-800">
                        总分
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-800">
                        评价时间
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-800">
                        详细评分
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserEvaluations.evaluations.map(
                      (evaluation, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 text-sm">
                            {getPersonnelName(evaluation.personnel_id)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm font-medium">
                            {evaluation.total_score}分
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {new Date(evaluation.timestamp).toLocaleString(
                              "zh-CN"
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm">
                            {evaluation.scores &&
                            typeof evaluation.scores === "object" ? (
                              <div className="space-y-1">
                                {Object.entries(evaluation.scores).map(
                                  ([criterion, score]) => (
                                    <div
                                      key={criterion}
                                      className="flex justify-between"
                                    >
                                      <span>
                                        {getCriterionName(criterion)}:
                                      </span>
                                      <span className="font-medium">
                                        {score}分
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">无详细评分</span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">暂无评价记录</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
