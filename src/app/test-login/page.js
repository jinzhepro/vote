"use client";

import { useState } from "react";
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
  jingkongPersonnel,
  kaitouPersonnel,
  functionalPersonnel,
} from "@/data/personnelData";

export default function TestLoginPage() {
  const router = useRouter();

  const handleTestLogin = (person) => {
    // 设置测试用户信息到表单
    const nameInput = document.getElementById("name");
    const idCardInput = document.getElementById("idCard");

    if (nameInput && idCardInput) {
      nameInput.value = person.name;
      idCardInput.value = person.idCard;

      // 触发输入事件以更新React状态
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      idCardInput.dispatchEvent(new Event("input", { bubbles: true }));

      // 跳转到主页
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            测试登录页面
          </h1>
          <p className="text-gray-600">点击下面的用户卡片，自动填充登录信息</p>
        </div>

        <div className="space-y-8">
          {/* 经控贸易部门 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">经控贸易部门</CardTitle>
              <CardDescription>点击用户自动填充登录信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jingkongPersonnel.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleTestLogin(person)}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.id}</div>
                    <div className="text-sm text-gray-500">{person.idCard}</div>
                    <div className="text-sm text-blue-600 mt-1">
                      {person.role === "leader" ? "负责人" : "员工"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 开投贸易部门 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">开投贸易部门</CardTitle>
              <CardDescription>点击用户自动填充登录信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kaitouPersonnel.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className="p-4 border rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => handleTestLogin(person)}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.id}</div>
                    <div className="text-sm text-gray-500">{person.idCard}</div>
                    <div className="text-sm text-green-600 mt-1">
                      {person.role === "leader" ? "负责人" : "员工"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 职能部门 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600">职能部门</CardTitle>
              <CardDescription>点击用户自动填充登录信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {functionalPersonnel.map((person) => (
                  <div
                    key={person.id}
                    className="p-4 border rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                    onClick={() => handleTestLogin(person)}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.id}</div>
                    <div className="text-sm text-gray-500">{person.idCard}</div>
                    <div className="text-sm text-purple-600 mt-1">
                      {person.role === "leader" ? "负责人" : "员工"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            返回主页
          </Button>
        </div>
      </div>
    </div>
  );
}
