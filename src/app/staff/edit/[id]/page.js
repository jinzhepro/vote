"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function EditStaff() {
  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    position: "",
    email: "",
    phone: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    fetchStaffData();
    fetchDepartments();
  }, [id]);

  const fetchStaffData = async () => {
    try {
      const response = await fetch(`/api/staff/${id}`);
      if (!response.ok) {
        throw new Error("获取人员信息失败");
      }
      const data = await response.json();
      setFormData({
        name: data.name || "",
        department_id: data.department_id?.toString() || "",
        position: data.position || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/staff/departments");
      if (!response.ok) {
        throw new Error("获取部门列表失败");
      }
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("请输入人员姓名");
      return;
    }

    if (!formData.department_id) {
      setError("请选择部门");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("更新人员失败");
      }

      router.push("/staff");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">编辑人员</h1>
          <p className="mt-2 text-gray-600">修改人员基本信息</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              姓名 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入人员姓名"
              required
            />
          </div>

          <div>
            <label
              htmlFor="department_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              部门 *
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">请选择部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              职位
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入职位信息"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入邮箱地址"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              电话
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入电话号码"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "更新中..." : "更新人员"}
            </Button>
            <Link href="/staff" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                取消
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
