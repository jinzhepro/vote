"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPersonnelByNameAndIdCard,
  validateIdCard,
} from "@/data/personnelData";
import { toast } from "sonner";
import { generateEncryptedUserId } from "@/lib/encryption";

export default function Home() {
  const [name, setName] = useState("");
  const [idCard, setIdCard] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("表单提交开始");

    if (!name.trim()) {
      toast.error("请输入姓名");
      return;
    }

    if (!idCard.trim()) {
      toast.error("请输入身份证号");
      return;
    }

    // 验证身份证号格式
    if (!validateIdCard(idCard.trim())) {
      toast.error("身份证号格式不正确");
      return;
    }

    console.log("开始查找人员信息:", {
      name: name.trim(),
      idCard: idCard.trim(),
    });

    try {
      // 根据姓名和身份证号查找人员信息
      const person = getPersonnelByNameAndIdCard(name.trim(), idCard.trim());

      console.log("查找结果:", person);

      if (!person) {
        toast.error("未找到该姓名和身份证号对应的人员信息");
        return;
      }

      // 生成基于姓名和部门的加密userid
      const encryptedUserId = generateEncryptedUserId(
        name.trim(),
        person.department
      );

      console.log("生成的用户ID:", encryptedUserId);

      // 确保localStorage可用
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          localStorage.setItem("userId", encryptedUserId);
          console.log("用户ID已保存到localStorage");
        } catch (error) {
          console.error("保存到localStorage失败:", error);
          toast.error("浏览器本地存储不可用，请更换浏览器");
          return;
        }
      } else {
        console.error("localStorage不可用");
        toast.error("浏览器不支持本地存储，请更换浏览器");
        return;
      }

      // 如果是职能部门，跳转到部门选择页面
      if (person.department === "functional") {
        console.log("跳转到职能部门选择页面");
        router.push(`/vote/functional/select-department`);
      } else {
        // 其他部门直接跳转到对应页面
        const role = person.role || "employee";
        console.log("跳转到部门页面:", `/vote/${person.department}/${role}`);
        router.push(`/vote/${person.department}/${role}`);
      }
    } catch (error) {
      console.error("查找人员失败:", error);
      toast.error("查找人员失败，请重试");
    }
  };

  return (
    <div className="flex  items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex  w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <h1 className="text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
              2025年度员工绩效考核
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              请输入您的姓名和身份证号进入评价系统。
            </p>
          </div>

          {/* 姓名输入表单 */}
          <div className="mt-12 max-w-md mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  姓名
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的姓名"
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="idCard"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  身份证号
                </label>
                <Input
                  id="idCard"
                  type="text"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value.toUpperCase())}
                  placeholder="请输入您的身份证号（不区分大小写）"
                  className="w-full"
                  maxLength={18}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!name.trim() || !idCard.trim()}
              >
                进入评价系统
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
