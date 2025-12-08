"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PollResults() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id;

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage获取投票数据
    const storedPolls = JSON.parse(localStorage.getItem("polls") || "[]");
    const foundPoll = storedPolls.find((p) => p.id === pollId);

    if (foundPoll) {
      setPoll(foundPoll);
    } else {
      // 投票不存在，重定向到投票列表
      router.push("/results");
    }

    setLoading(false);
  }, [pollId, router]);

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

  const calculateResults = () => {
    if (!poll || poll.votes.length === 0) {
      return poll.options.map((option, index) => ({
        option,
        votes: 0,
        percentage: 0,
      }));
    }

    const optionCounts = {};
    poll.options.forEach((_, index) => {
      optionCounts[index] = 0;
    });

    poll.votes.forEach((vote) => {
      vote.options.forEach((optionIndex) => {
        optionCounts[optionIndex]++;
      });
    });

    return poll.options.map((option, index) => ({
      option,
      votes: optionCounts[index],
      percentage: ((optionCounts[index] / poll.votes.length) * 100).toFixed(1),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">投票不存在</h1>
          <Link
            href="/results"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            返回结果列表
          </Link>
        </div>
      </div>
    );
  }

  const results = calculateResults();
  const totalVotes = poll.votes.length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
          <p className="mt-2 text-gray-600">
            {poll.allowMultipleChoice ? "多选投票" : "单选投票"} • {totalVotes}{" "}
            票
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              投票结果
            </h2>
          </div>

          {totalVotes === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无投票结果</p>
              <Link
                href={`/vote/${pollId}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-500 font-medium"
              >
                成为第一个投票者
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results
                .sort((a, b) => b.votes - a.votes)
                .map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {result.option}
                      </span>
                      <div className="text-right">
                        <span className="text-gray-600">{result.votes} 票</span>
                        <span className="ml-2 text-gray-500">
                          ({result.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="text-sm text-gray-600 space-y-1">
            <p>创建时间: {formatDate(poll.createdAt)}</p>
            <p>
              投票类型: {poll.allowMultipleChoice ? "多选投票" : "单选投票"}
            </p>
            <p>总投票数: {totalVotes}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/vote/${pollId}`}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            参与投票
          </Link>
          <Link
            href="/results"
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
          >
            查看其他结果
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>此投票为匿名投票，保护投票者隐私</p>
        </div>
      </div>
    </div>
  );
}
