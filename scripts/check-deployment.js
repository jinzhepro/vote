// 部署检查脚本
// 用于诊断线上环境的问题

console.log("=== 部署环境检查 ===\n");

// 检查 Node.js 版本
console.log("Node.js 版本:", process.version);
console.log("平台:", process.platform);
console.log("架构:", process.arch);

// 检查环境变量
console.log("\n=== 环境变量检查 ===");
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_KEY",
  "NODE_ENV",
];

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(
      `✓ ${varName}: ${varName.includes("KEY") ? "***已设置***" : value}`
    );
  } else {
    console.log(`✗ ${varName}: 未设置`);
  }
});

// 检查内存使用情况
console.log("\n=== 内存使用情况 ===");
const memUsage = process.memoryUsage();
console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);

// 检查可用模块
console.log("\n=== 模块检查 ===");
try {
  const fs = require("fs");
  console.log("✓ fs 模块可用");
} catch (e) {
  console.log("✗ fs 模块不可用");
}

try {
  const path = require("path");
  console.log("✓ path 模块可用");
} catch (e) {
  console.log("✗ path 模块不可用");
}

// 检查 Next.js 配置
console.log("\n=== Next.js 配置检查 ===");
try {
  const nextConfig = require("../next.config.js");
  console.log("✓ next.config.js 加载成功");
  console.log("配置项:", Object.keys(nextConfig));
} catch (e) {
  console.log("✗ next.config.js 加载失败:", e.message);
}

// 检查 package.json
console.log("\n=== package.json 检查 ===");
try {
  const packageJson = require("../package.json");
  console.log("✓ package.json 加载成功");
  console.log("项目名称:", packageJson.name);
  console.log("版本:", packageJson.version);
  console.log("依赖数量:", Object.keys(packageJson.dependencies || {}).length);
  console.log(
    "开发依赖数量:",
    Object.keys(packageJson.devDependencies || {}).length
  );

  // 检查关键依赖
  const criticalDeps = ["next", "react", "react-dom", "sonner"];
  criticalDeps.forEach((dep) => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✓ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`✗ ${dep}: 未找到`);
    }
  });
} catch (e) {
  console.log("✗ package.json 加载失败:", e.message);
}

console.log("\n=== 检查完成 ===");
console.log("如果发现问题，请检查部署配置和环境变量设置。");
