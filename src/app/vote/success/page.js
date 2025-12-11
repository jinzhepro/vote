"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const [isFunctionalUser, setIsFunctionalUser] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState("");

  useEffect(() => {
    // 检查是否是职能部门用户
    const userId = localStorage.getItem("userId");
    if (userId) {
      // 检查用户ID格式，职能部门用户ID通常包含"functional"
      if (userId.includes("functional")) {
        // 使用setTimeout来避免同步状态设置
        setTimeout(() => {
          setIsFunctionalUser(true);

          // 从已完成部门列表中获取最近完成的部门
          const completedDepts = JSON.parse(
            localStorage.getItem("completedDepartments") || "[]"
          );

          if (completedDepts.length > 0) {
            // 获取最后一个完成的部门
            setCurrentDepartment(completedDepts[completedDepts.length - 1]);
          }
        }, 0);
      }
    }
  }, []);

  const handleEvaluateAnotherDepartment = () => {
    // 跳转到职能部门选择部门页面
    router.push("/vote/functional/select-department");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl font-bold text-green-600">
            提交成功！
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            所有评价数据已成功保存，感谢您的参与！
          </p>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">评价完成率: 100%</div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* 职能部门用户显示评价另一个部门的按钮 */}
          {isFunctionalUser && (
            <div className="space-y-3 pt-2">
              <div className="text-sm text-gray-600">
                {currentDepartment && (
                  <span>
                    您已完成对
                    {currentDepartment === "jingkong" ? "经控贸易" : "开投贸易"}
                    部门的评价
                  </span>
                )}
              </div>
              <Button
                onClick={handleEvaluateAnotherDepartment}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                评价另一个部门
              </Button>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="w-full"
            >
              返回首页
            </Button>

            <div className="text-sm text-gray-500">
              您现在可以安全关闭此页面
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
