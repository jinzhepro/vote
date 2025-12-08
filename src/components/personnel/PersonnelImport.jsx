"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PersonnelImport({ onImport, onCancel, personnelTypes }) {
  const [selectedType, setSelectedType] = useState(
    personnelTypes[0]?.value || ""
  );
  const [namesText, setNamesText] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // 预定义的人员名单
  const predefinedPersonnel = {
    经控贸易:
      "郑效明、赵晓、薛慧、张倩、敬志伟、薛清华、邵汉明、陈立群、赵安琪、刘婷、方舟、韩晓青、赵邦宇、刘丽、李鸿康、张津诚、马丽萍、李昕益、王泽民、张梦卿、张新军、赵惠东、张笑艳、韩高洁、孙琨、刘萍、薛洋、潘振龙、侯继儒、沙绿洲、庞东、张鹏京、闫书奇、吕仕杰、孔帅、王伊凡、杨春梅、管伟胜、刘雅超、付冰清、张晋哲、原豪豪、崔建刚、张照月、廖斌、杨颖",
    开投贸易:
      "周晓彬、陆剑飞、薛德晓、张龙龙、唐国彬、杨仕玉、刘娜、王珉、初凯、段启愚、高青、纪蕾、王杰、杨龙泉、迟浩元、刘伟玉",
    开投贸易派遣: "陈雨田、高洋、毛璐杰、杜嘉祎、臧梦娇",
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setNamesText(predefinedPersonnel[type] || "");
    setDepartment(type); // 默认部门设置为类型
  };

  const parseNames = (text) => {
    if (!text.trim()) return [];
    return text.split(/[、，,\s]+/).filter((name) => name.trim());
  };

  const handleImport = async () => {
    const names = parseNames(namesText);

    if (names.length === 0) {
      toast.error("请输入人员姓名");
      return;
    }

    if (!department.trim()) {
      toast.error("请输入部门名称");
      return;
    }

    setLoading(true);
    try {
      const personnelList = names.map((name) => ({
        name: name.trim(),
        department: department.trim(),
        type: selectedType,
      }));

      const success = await onImport(personnelList);
      if (success) {
        setNamesText("");
        setDepartment("");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPredefinedData = () => {
    setNamesText(predefinedPersonnel[selectedType] || "");
    setDepartment(selectedType);
  };

  return (
    <div className="space-y-6">
      {/* 快速选择预定义数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快速导入预定义人员</CardTitle>
          <CardDescription>
            选择人员类型快速导入预定义的人员名单
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personnelTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => handleTypeChange(type.value)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {predefinedPersonnel[type.value]?.split(/、/).length || 0} 人
                </div>
              </Button>
            ))}
          </div>

          <Button
            onClick={loadPredefinedData}
            variant="secondary"
            className="w-full"
          >
            加载选中类型的人员名单
          </Button>
        </CardContent>
      </Card>

      {/* 自定义导入 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">自定义导入</CardTitle>
          <CardDescription>
            手动输入或粘贴人员姓名，用顿号、逗号或空格分隔
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="importType" className="text-sm font-medium">
              人员类型
            </label>
            <select
              id="importType"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {personnelTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              部门名称
            </label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="请输入部门名称"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="names" className="text-sm font-medium">
              人员姓名
            </label>
            <textarea
              id="names"
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              placeholder="请输入人员姓名，用顿号、逗号或空格分隔&#10;例如：张三、李四、王五"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 resize-y"
            />
            <div className="text-xs text-gray-500">
              已输入 {parseNames(namesText).length} 个姓名
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleImport}
              disabled={loading || parseNames(namesText).length === 0}
              className="flex-1"
            >
              {loading
                ? "导入中..."
                : `导入 ${parseNames(namesText).length} 人`}
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 预览 */}
      {namesText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">预览</CardTitle>
            <CardDescription>将要导入的人员列表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {parseNames(namesText).map((name, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-gray-100 rounded text-sm text-center"
                >
                  {name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
