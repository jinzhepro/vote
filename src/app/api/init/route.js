import { initializeDatabase } from "@/lib/db";
import { getAllEmployees, initializeEmployees } from "@/lib/staffUtils";

export async function POST() {
  const initLog = {
    steps: [],
    errors: [],
    success: false,
  };

  try {
    initLog.steps.push("开始数据库初始化...");

    // 步骤1：初始化数据库表
    initLog.steps.push("正在创建数据库表...");
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      initLog.errors.push("数据库表创建失败");
      return Response.json(
        {
          error: "数据库初始化失败",
          details: initLog,
        },
        { status: 500 }
      );
    }
    initLog.steps.push("✅ 数据库表创建成功");

    // 步骤2：检查是否已有人员数据
    initLog.steps.push("检查现有人员数据...");
    const existingEmployees = await getAllEmployees();
    if (existingEmployees.length > 0) {
      initLog.steps.push(
        `✅ 发现已有 ${existingEmployees.length} 名人员，跳过数据初始化`
      );
      return Response.json({
        message: "数据库已初始化，已有人员数据",
        employeeCount: existingEmployees.length,
        details: initLog,
      });
    }

    // 步骤3：初始化人员数据
    initLog.steps.push("开始初始化人员数据...");
    const employeesInitialized = await initializeEmployees();
    if (!employeesInitialized) {
      initLog.errors.push("人员数据初始化失败");
      return Response.json(
        {
          error: "人员数据初始化失败",
          details: initLog,
        },
        { status: 500 }
      );
    }
    initLog.steps.push("✅ 人员数据初始化成功");

    // 步骤4：验证初始化结果
    initLog.steps.push("验证初始化结果...");
    const finalEmployees = await getAllEmployees();
    initLog.steps.push(`✅ 验证完成，共录入 ${finalEmployees.length} 名人员`);

    initLog.success = true;
    return Response.json({
      message: "数据库和人员数据初始化成功",
      employeeCount: finalEmployees.length,
      details: initLog,
    });
  } catch (error) {
    console.error("初始化失败:", error);
    initLog.errors.push(`系统错误: ${error.message}`);
    initLog.errors.push(`错误堆栈: ${error.stack}`);

    return Response.json(
      {
        error: "初始化失败: " + error.message,
        details: initLog,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const employees = await getAllEmployees();
    return Response.json({
      initialized: employees.length > 0,
      employeeCount: employees.length,
    });
  } catch (error) {
    console.error("检查初始化状态失败:", error);
    return Response.json(
      {
        error: "检查初始化状态失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
