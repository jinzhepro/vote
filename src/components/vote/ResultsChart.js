import { calculatePollResults } from "@/lib/pollUtils";

export function ResultsChart({ poll }) {
  if (!poll || poll.votes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">暂无投票结果</p>
      </div>
    );
  }

  const results = calculatePollResults(poll);
  const totalVotes = poll.votes.length;

  return (
    <div className="space-y-4">
      {results
        .sort((a, b) => b.votes - a.votes)
        .map((result, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">{result.option}</span>
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

      <div className="pt-4 border-t text-sm text-gray-600">
        <p>总投票数: {totalVotes}</p>
      </div>
    </div>
  );
}
