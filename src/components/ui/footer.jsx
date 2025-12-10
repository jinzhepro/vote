export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-gray-200 bg-white">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100 shadow-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            本项目由国贸集团青云通公司开发
          </span>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          © 2024 国贸集团青云通公司 - 人员评价系统
        </div>
      </div>
    </footer>
  );
}
