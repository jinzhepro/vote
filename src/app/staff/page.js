"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StaffList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff");
      if (!response.ok) {
        throw new Error("获取人员数据失败");
      }
      const data = await response.json();
      setEmployees(data.employees || []);
      setDepartments(data.departments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("确定要删除这个人员吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除人员失败");
      }

      // 重新获取数据
      fetchStaffData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position &&
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.email &&
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department_id === parseInt(selectedDepartment);

    return matchesSearch && matchesDepartment;
  });

  // 按部门分组
  const groupedEmployees = filteredEmployees.reduce((groups, employee) => {
    const deptName = employee.department_name || "未分配部门";
    if (!groups[deptName]) {
      groups[deptName] = [];
    }
    groups[deptName].push(employee);
    return groups;
  }, {});

  if (loading) {
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">人员管理</h1>
          <p className="mt-2 text-gray-600">管理贸易部门人员信息</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* 操作栏 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link href="/staff/add">
              <Button variant="primary">添加人员</Button>
            </Link>

            <input
              type="text"
              placeholder="搜索人员..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">所有部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
              </div>
              <div className="text-sm text-blue-800">总人数</div>
            </div>
            {departments.map((dept) => {
              const deptCount = employees.filter(
                (e) => e.department_id === dept.id
              ).length;
              return (
                <div key={dept.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">
                    {deptCount}
                  </div>
                  <div className="text-sm text-gray-800">{dept.name}</div>
                </div>
              );
            })}
          </div>

          {/* 人员列表 */}
          {Object.keys(groupedEmployees).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || selectedDepartment !== "all"
                  ? "没有找到匹配的人员"
                  : "暂无人员"}
              </p>
              <Link
                href="/staff/add"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500 font-medium"
              >
                添加第一个人员
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEmployees).map(
                ([deptName, deptEmployees]) => (
                  <div key={deptName}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {deptName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deptEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {employee.name}
                            </h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {employee.position || "员工"}
                            </span>
                          </div>

                          {employee.email && (
                            <p className="text-sm text-gray-600 mb-1">
                              {employee.email}
                            </p>
                          )}
                          {employee.phone && (
                            <p className="text-sm text-gray-600 mb-3">
                              {employee.phone}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Link href={`/staff/edit/${employee.id}`}>
                              <Button size="small" variant="outline">
                                编辑
                              </Button>
                            </Link>
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() => handleDelete(employee.id)}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
