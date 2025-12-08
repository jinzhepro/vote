"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id;

  const [poll, setPoll] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage获取投票数据
    const storedPolls = JSON.parse(localStorage.getItem("polls") || "[]");
    const foundPoll = storedPolls.find((p) => p.id === pollId);

    if (foundPoll) {
      setPoll(foundPoll);

      // 检查是否已经投票（基于localStorage）
      const voteKey = `voted_${pollId}`;
      const hasVotedBefore = localStorage.getItem(voteKey);
      setHasVoted(!!hasVotedBefore);
    } else {
      // 投票不存在，重定向到投票列表
      router.push("/vote");
    }

    setLoading(false);
  }, [pollId, router]);

  const handleOptionChange = (optionIndex) => {
    if (poll.allowMultipleChoice) {
      // 多选逻辑
      if (selectedOptions.includes(optionIndex)) {
        setSelectedOptions(selectedOptions.filter((i) => i !== optionIndex));
      } else {
        setSelectedOptions([...selectedOptions, optionIndex]);
      }
    } else {
      // 单选逻辑
      setSelectedOptions([optionIndex]);
    }
  };

  const handleSubmitVote = (e) => {
    e.preventDefault();

    if (selectedOptions.length === 0) {
      alert("请至少选择一个选项");
      return;
    }

    // 获取现有投票数据
    const storedPolls = JSON.parse(localStorage.getItem("polls") || "[]");
    const pollIndex = storedPolls.findIndex((p) => p.id === pollId);

    if (pollIndex !== -1) {
      // 添加新投票
      const newVote = {
        options: selectedOptions,
        timestamp: new Date().toISOString(),
      };

      storedPolls[pollIndex].votes.push(newVote);

      // 保存更新后的数据
      localStorage.setItem("polls", JSON.stringify(storedPolls));

      // 标记已投票
      localStorage.setItem(`voted_${pollId}`, "true");

      // 更新状态
      setPoll(storedPolls[pollIndex]);
      setHasVoted(true);
    }
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
            href="/vote"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            返回投票列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
          <p className="mt-2 text-gray-600">
            {poll.allowMultipleChoice ? "多选投票" : "单选投票"} •{" "}
            {poll.options.length} 个选项
          </p>
        </div>

        {hasVoted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              投票成功！
            </h2>
            <p className="text-gray-600 mb-6">感谢您的参与</p>
            <div className="space-y-3">
              <Link
                href={`/results/${pollId}`}
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                查看结果
              </Link>
              <Link
                href="/vote"
                className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                参与其他投票
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitVote} className="space-y-6">
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type={poll.allowMultipleChoice ? "checkbox" : "radio"}
                    name="vote"
                    value={index}
                    checked={selectedOptions.includes(index)}
                    onChange={() => handleOptionChange(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                提交投票
              </button>
              <Link
                href="/vote"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                取消
              </Link>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>此投票为匿名投票，您的选择将被保密</p>
        </div>
      </div>
    </div>
  );
}
