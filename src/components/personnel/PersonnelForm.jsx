"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PersonnelForm({
  onSubmit,
  onCancel,
  personnelTypes,
  initialData = {},
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    department: initialData.department || "",
    type: initialData.type || personnelTypes[0]?.value || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.department.trim()) {
      toast.error("请填写完整的人员信息");
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({
          name: "",
          department: "",
          type: personnelTypes[0]?.value || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            姓名 *
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入姓名"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="department" className="text-sm font-medium">
            部门 *
          </label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="请输入部门"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          人员类型 *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {personnelTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "提交中..." : initialData.id ? "更新" : "添加"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
