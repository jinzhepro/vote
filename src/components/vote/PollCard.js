import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatDate, getLeadingOption } from "@/lib/pollUtils";

export function PollCard({ poll, showActions = true }) {
  const totalVotes = poll.votes.length;
  const leadingOption = getLeadingOption(poll);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{poll.question}</h3>
        <span className="text-sm text-gray-500">
          {poll.options.length} 个选项
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span>{poll.allowMultipleChoice ? "多选" : "单选"}</span>
        <span>{formatDate(poll.createdAt)}</span>
        <span>{totalVotes} 票</span>
      </div>

      {totalVotes > 0 && leadingOption && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">领先选项</span>
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
          <p className="text-sm text-gray-600 mt-1 truncate">
            {leadingOption.option}
          </p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Link href={`/vote/${poll.id}`}>
            <Button size="small" variant="primary">
              参与投票
            </Button>
          </Link>
          <Link href={`/results/${poll.id}`}>
            <Button size="small" variant="outline">
              查看结果
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
