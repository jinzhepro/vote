import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">匿名投票系统</h1>
          <p className="mt-2 text-gray-600">创建和参与匿名投票</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/create"
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white font-medium transition-colors hover:bg-blue-700"
          >
            创建新投票
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">或者</span>
            </div>
          </div>

          <Link
            href="/vote"
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium transition-colors hover:bg-gray-50"
          >
            参与投票
          </Link>
        </div>

        <div className="text-center">
          <Link
            href="/results"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            查看投票结果
          </Link>
        </div>
      </div>
    </div>
  );
}
