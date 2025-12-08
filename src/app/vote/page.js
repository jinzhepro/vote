"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function VoteList() {
  const [polls, setPolls] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("polls") || "[]");
    }
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolls = polls.filter((poll) =>
    poll.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">参与投票</h1>
          <p className="mt-2 text-gray-600">选择一个投票来参与</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="搜索投票..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {filteredPolls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "没有找到匹配的投票" : "暂无投票"}
              </p>
              <Link
                href="/create"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500 font-medium"
              >
                创建第一个投票
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolls.map((poll) => (
                <div
                  key={poll.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {poll.question}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {poll.options.length} 个选项
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{poll.allowMultipleChoice ? "多选" : "单选"}</span>
                    <span>{formatDate(poll.createdAt)}</span>
                    <span>{poll.votes.length} 票</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/vote/${poll.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      参与投票
                    </Link>
                    <Link
                      href={`/results/${poll.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      查看结果
                    </Link>
                  </div>
                </div>
              ))}
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
