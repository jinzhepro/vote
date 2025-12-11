"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPersonnelByName } from "@/data/personnelData";
import { toast } from "sonner";

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("请输入姓名");
      return;
    }

    setLoading(true);

    try {
      // 根据姓名查找人员信息
      const person = await getPersonnelByName(name.trim());

      if (!person) {
        toast.error("未找到该姓名对应的人员信息");
        return;
      }

      // 如果是职能部门，跳转到部门选择页面
      if (person.department === "functional") {
        router.push(`/vote/functional/select-department`);
      } else {
        // 其他部门直接跳转到对应页面
        const role = person.role || "employee";
        router.push(`/vote/${person.department}/${role}`);
      }
    } catch (error) {
      console.error("查找人员失败:", error);
      toast.error("查找人员失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
            <h1 className="text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
              2025年度员工绩效考核
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              请输入您的姓名进入评价系统。
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
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !name.trim()}
              >
                {loading ? "查找中..." : "进入评价系统"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
