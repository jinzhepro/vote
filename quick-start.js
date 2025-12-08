#!/usr/bin/env node

/**
 * 人员管理系统快速启动脚本
 * 运行: node quick-start.js
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 人员管理系统快速启动脚本");
console.log("================================");

function checkEnvFile() {
  const envPath = path.join(__dirname, ".env.local");

  if (!fs.existsSync(envPath)) {
    console.log("❌ 未找到 .env.local 文件");
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  if (!envContent.includes("DATABASE_URL")) {
    console.log("❌ .env.local 文件中未找到 DATABASE_URL");
    return false;
  }

  if (envContent.includes("username:password@hostname")) {
    console.log("⚠️  请在 .env.local 文件中配置实际的数据库连接信息");
    return false;
  }

  console.log("✅ 环境配置文件检查通过");
  return true;
}

function showInstructions() {
  console.log("\n📋 使用说明:");
  console.log("1. 确保已配置 Neon 数据库连接");
  console.log("2. 运行 npm run dev 启动应用");
  console.log("3. 访问 http://localhost:3000/init 进行初始化");
  console.log("4. 初始化完成后访问 http://localhost:3000/staff 管理人员");
  console.log("\n📖 详细文档请参考:");
  console.log("- INITIALIZATION_GUIDE.md - 初始化指南");
  console.log("- STAFF_MANAGEMENT.md - 功能说明");
}

async function main() {
  console.log("\n🔍 检查环境配置...");

  if (!checkEnvFile()) {
    console.log("\n请先配置数据库连接:");
    console.log("1. 访问 https://console.neon.tech/ 创建数据库");
    console.log("2. 复制连接字符串到 .env.local 文件");
    console.log("3. 重新运行此脚本");

    rl.close();
    return;
  }

  console.log("\n✅ 环境检查完成，系统已准备就绪！");

  rl.question("\n是否现在启动开发服务器? (y/n): ", (answer) => {
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      console.log("\n🚀 启动开发服务器...");
      console.log("请运行: npm run dev");
      console.log("然后在浏览器中访问: http://localhost:3000/init");
    } else {
      showInstructions();
    }

    rl.close();
  });
}

// 检查是否有必要的依赖
function checkDependencies() {
  const packagePath = path.join(__dirname, "package.json");

  if (!fs.existsSync(packagePath)) {
    console.log("❌ 未找到 package.json 文件");
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const requiredDeps = ["@neondatabase/serverless", "next", "react"];

  for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
      console.log(`❌ 缺少依赖: ${dep}`);
      console.log("请运行: npm install");
      return false;
    }
  }

  console.log("✅ 依赖检查通过");
  return true;
}

// 运行检查
if (!checkDependencies()) {
  process.exit(1);
}

main().catch(console.error);
