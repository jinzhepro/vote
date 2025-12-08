"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function InitPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    checkInitializationStatus();
  }, []);

  const checkInitializationStatus = async () => {
    try {
      const response = await fetch("/api/init");
      if (response.ok) {
        const data = await response.json();
        if (data.initialized) {
          setStatus("initialized");
          setEmployeeCount(data.employeeCount);
          setMessage(`数据库已初始化，共有 ${data.employeeCount} 名人员`);
        } else {
          setStatus("not_initialized");
          setMessage("数据库尚未初始化");
        }
      } else {
        setStatus("error");
        setMessage("检查初始化状态失败");
      }
    } catch (error) {
      setStatus("error");
      setMessage("连接服务器失败");
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setMessage("正在初始化数据库和人员数据...");

    try {
      const response = await fetch("/api/init", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setStatus("initialized");
        setEmployeeCount(data.employeeCount);
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        setStatus("error");
        setMessage(errorData.error || "初始化失败");
      }
    } catch (error) {
      setStatus("error");
      setMessage("初始化过程中发生错误");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">系统初始化</h1>
          <p className="mt-2 text-gray-600">初始化数据库和人员数据</p>
        </div>

        <div className="space-y-6">
          {/* 状态显示 */}
          <div
            className={`rounded-lg p-4 ${
              status === "initialized"
                ? "bg-green-50 border border-green-200"
                : status === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  status === "initialized"
                    ? "bg-green-500"
                    : status === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              ></div>
              <span
                className={`font-medium ${
                  status === "initialized"
                    ? "text-green-800"
                    : status === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {status === "initialized"
                  ? "已初始化"
                  : status === "error"
                  ? "错误"
                  : "未初始化"}
              </span>
            </div>
            <p
              className={`mt-2 text-sm ${
                status === "initialized"
                  ? "text-green-700"
                  : status === "error"
                  ? "text-red-700"
                  : "text-blue-700"
              }`}
            >
              {message}
            </p>
          </div>

          {/* 操作按钮 */}
          {status === "not_initialized" && (
            <Button
              variant="primary"
              onClick={handleInitialize}
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? "初始化中..." : "初始化数据库"}
            </Button>
          )}

          {status === "initialized" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {employeeCount}
                </div>
                <div className="text-sm text-gray-600">名人员已录入</div>
              </div>

              <div className="space-y-2">
                <Link href="/staff">
                  <Button variant="primary" className="w-full">
                    管理人员
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    返回首页
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Button
                variant="primary"
                onClick={checkInitializationStatus}
                className="w-full"
              >
                重新检查
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  返回首页
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 说明信息 */}
        <div className="text-xs text-gray-500 text-center">
          <p>初始化将创建数据库表并录入以下人员：</p>
          <p>• 经控贸易部门：46名人员</p>
          <p>• 开投贸易部门：21名人员</p>
        </div>
      </div>
    </div>
  );
}
