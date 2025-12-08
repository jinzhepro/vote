"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultipleChoice, setAllowMultipleChoice] = useState(false);
  const router = useRouter();

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 验证表单
    if (!question.trim()) {
      alert("请输入投票问题");
      return;
    }

    const validOptions = options.filter((option) => option.trim());
    if (validOptions.length < 2) {
      alert("请至少输入两个有效的选项");
      return;
    }

    // 生成投票ID（实际应用中应该由后端生成）
    const pollId = Math.random().toString(36).substring(2, 15);

    // 保存投票数据到localStorage（实际应用中应该保存到后端）
    const pollData = {
      id: pollId,
      question: question.trim(),
      options: validOptions,
      allowMultipleChoice,
      createdAt: new Date().toISOString(),
      votes: [],
    };

    // 获取现有投票数据
    const existingPolls = JSON.parse(localStorage.getItem("polls") || "[]");
    existingPolls.push(pollData);
    localStorage.setItem("polls", JSON.stringify(existingPolls));

    // 跳转到投票页面
    router.push(`/vote/${pollId}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">创建新投票</h1>
          <p className="mt-2 text-gray-600">设置您的问题和选项</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              投票问题
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入您的投票问题..."
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                选项
              </label>
              <span className="text-sm text-gray-500">{options.length}/10</span>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`选项 ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                + 添加选项
              </button>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="multipleChoice"
              checked={allowMultipleChoice}
              onChange={(e) => setAllowMultipleChoice(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="multipleChoice"
              className="ml-2 block text-sm text-gray-700"
            >
              允许多选
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              创建投票
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
