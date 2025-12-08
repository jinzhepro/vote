"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResultsList() {
  const [polls, setPolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 从localStorage获取投票数据
    const storedPolls = JSON.parse(localStorage.getItem("polls") || "[]");
    setPolls(storedPolls);
  }, []);

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

  const getTotalVotes = (poll) => {
    return poll.votes.length;
  };

  const getLeadingOption = (poll) => {
    if (poll.votes.length === 0) return null;

    const optionCounts = {};
    poll.options.forEach((_, index) => {
      optionCounts[index] = 0;
    });

    poll.votes.forEach((vote) => {
      vote.options.forEach((optionIndex) => {
        optionCounts[optionIndex]++;
      });
    });

    let maxCount = 0;
    let leadingIndex = 0;

    Object.entries(optionCounts).forEach(([index, count]) => {
      if (count > maxCount) {
        maxCount = count;
        leadingIndex = parseInt(index);
      }
    });

    return {
      option: poll.options[leadingIndex],
      count: maxCount,
      percentage: ((maxCount / poll.votes.length) * 100).toFixed(1),
    };
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">投票结果</h1>
          <p className="mt-2 text-gray-600">查看所有投票的结果</p>
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
              {filteredPolls.map((poll) => {
                const totalVotes = getTotalVotes(poll);
                const leadingOption = getLeadingOption(poll);

                return (
                  <div
                    key={poll.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {poll.question}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {totalVotes} 票
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{poll.allowMultipleChoice ? "多选" : "单选"}</span>
                      <span>{formatDate(poll.createdAt)}</span>
                    </div>

                    {totalVotes > 0 && leadingOption ? (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            领先选项
                          </span>
                          <span className="text-sm text-gray-600">
                            {leadingOption.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${leadingOption.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {leadingOption.option}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-3">暂无投票</p>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/results/${poll.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        查看详细结果
                      </Link>
                      <Link
                        href={`/vote/${poll.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        参与投票
                      </Link>
                    </div>
                  </div>
                );
              })}
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
