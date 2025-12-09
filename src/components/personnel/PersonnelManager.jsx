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
import { Input } from "@/components/ui/input";
import { PersonnelForm } from "./PersonnelForm";
import { PersonnelList } from "./PersonnelList";
import { PersonnelImport } from "./PersonnelImport";

export function PersonnelManager() {
  const [personnel, setPersonnel] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // 预定义的人员类型
  const personnelTypes = [
    { value: "经控贸易", label: "经控贸易" },
    { value: "开投贸易", label: "开投贸易" },
    { value: "开投贸易派遣", label: "开投贸易派遣" },
  ];

  // 获取所有人员
  const fetchPersonnel = async () => {
    try {
      const response = await fetch("/api/personnel");
      const data = await response.json();
      if (data.success) {
        setPersonnel(data.personnel || {});
      }
    } catch (error) {
      console.error("获取人员失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加人员
  const addPerson = async (personData) => {
    try {
      const response = await fetch("/api/personnel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPersonnel();
        setActiveTab("list");
        toast.success("人员添加成功！");
        return true;
      } else {
        toast.error(data.error || "添加失败");
        return false;
      }
    } catch (error) {
      console.error("添加人员失败:", error);
      toast.error("添加人员失败");
      return false;
    }
  };

  // 删除人员
  const deletePerson = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast("确定要删除这个人员吗？", {
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
      const response = await fetch(`/api/personnel/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await fetchPersonnel();
        toast.success("人员删除成功！");
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除人员失败:", error);
      toast.error("删除人员失败");
    }
  };

  // 批量导入人员
  const importPersonnel = async (personnelList) => {
    try {
      const response = await fetch("/api/personnel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personnelList }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPersonnel();
        setActiveTab("list");
        toast.success(
          `批量导入完成！成功：${
            data.results.filter((r) => r.success).length
          }，失败：${data.results.filter((r) => !r.success).length}`
        );
        return true;
      } else {
        toast.error(data.error || "导入失败");
        return false;
      }
    } catch (error) {
      console.error("批量导入失败:", error);
      toast.error("批量导入失败");
      return false;
    }
  };

  // 清空所有人员
  const clearAllPersonnel = async () => {
    const confirmed = await new Promise((resolve) => {
      toast("确定要清空所有人员数据吗？此操作不可恢复！", {
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
      const response = await fetch("/api/personnel", {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setPersonnel({});
        toast.success("所有人员数据已清空！");
      } else {
        toast.error(data.error || "清空失败");
      }
    } catch (error) {
      console.error("清空人员失败:", error);
      toast.error("清空人员失败");
    }
  };

  // 过滤人员
  const getFilteredPersonnel = () => {
    let filtered = Object.values(personnel);

    // 按类型过滤
    if (filterType !== "all") {
      filtered = filtered.filter((person) => person.type === filterType);
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 按ID排序
    filtered.sort((a, b) => {
      // 将ID转换为数字进行比较
      const idA = parseInt(a.id) || 0;
      const idB = parseInt(b.id) || 0;
      return idA - idB;
    });

    return filtered;
  };

  // 统计信息
  const getStatistics = () => {
    const all = Object.values(personnel);
    return {
      total: all.length,
      byType: personnelTypes.reduce((acc, type) => {
        acc[type.value] = all.filter((p) => p.type === type.value).length;
        return acc;
      }, {}),
    };
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const stats = getStatistics();
  const filteredPersonnel = getFilteredPersonnel();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和统计 */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">人员管理系统</h1>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          {personnelTypes.map((type) => (
            <Card key={type.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {type.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byType[type.value] || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === "list" ? "default" : "outline"}
          onClick={() => setActiveTab("list")}
        >
          人员列表
        </Button>
        <Button
          variant={activeTab === "add" ? "default" : "outline"}
          onClick={() => setActiveTab("add")}
        >
          添加人员
        </Button>
        <Button
          variant={activeTab === "import" ? "default" : "outline"}
          onClick={() => setActiveTab("import")}
        >
          批量导入
        </Button>
        <Button variant="destructive" onClick={clearAllPersonnel}>
          清空所有
        </Button>
      </div>

      {/* 内容区域 */}
      {activeTab === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>人员列表</CardTitle>
            <CardDescription>查看和管理所有人员信息</CardDescription>

            {/* 搜索和过滤 */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                placeholder="搜索姓名或部门..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有类型</option>
                {personnelTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <PersonnelList
              personnel={filteredPersonnel}
              onDelete={deletePerson}
              onRefresh={fetchPersonnel}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "add" && (
        <Card>
          <CardHeader>
            <CardTitle>添加人员</CardTitle>
            <CardDescription>添加新的人员信息</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonnelForm
              onSubmit={addPerson}
              onCancel={() => setActiveTab("list")}
              personnelTypes={personnelTypes}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>批量导入</CardTitle>
            <CardDescription>批量导入人员信息</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonnelImport
              onImport={importPersonnel}
              onCancel={() => setActiveTab("list")}
              personnelTypes={personnelTypes}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
