import sql from "@/lib/db.js";

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: [],
    success: false,
  };

  try {
    // 步骤1：检查环境变量
    debugInfo.steps.push("检查环境变量");
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      debugInfo.errors.push("DATABASE_URL 环境变量未设置");
      return Response.json(debugInfo);
    }

    if (dbUrl.includes("username:password@hostname")) {
      debugInfo.errors.push(
        "DATABASE_URL 包含占位符，请配置实际的数据库连接信息"
      );
      return Response.json(debugInfo);
    }

    debugInfo.steps.push("✅ 环境变量检查通过");

    // 步骤2：测试数据库连接
    debugInfo.steps.push("测试数据库连接");
    try {
      const result =
        await sql`SELECT NOW() as current_time, version() as db_version`;
      debugInfo.steps.push(`✅ 数据库连接成功: ${result[0].current_time}`);
      debugInfo.dbInfo = result[0];
    } catch (error) {
      debugInfo.errors.push(`数据库连接失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    // 步骤3：检查现有表
    debugInfo.steps.push("检查数据库表");
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      debugInfo.existingTables = tables.map((t) => t.table_name);
      debugInfo.steps.push(`✅ 找到 ${tables.length} 个表`);
    } catch (error) {
      debugInfo.errors.push(`检查表失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    // 步骤4：测试创建部门表
    debugInfo.steps.push("测试创建部门表");
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS departments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      debugInfo.steps.push("✅ 部门表创建成功");
    } catch (error) {
      debugInfo.errors.push(`创建部门表失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    // 步骤5：测试创建人员表
    debugInfo.steps.push("测试创建人员表");
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          department_id INTEGER REFERENCES departments(id),
          position VARCHAR(100),
          email VARCHAR(100),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      debugInfo.steps.push("✅ 人员表创建成功");
    } catch (error) {
      debugInfo.errors.push(`创建人员表失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    // 步骤6：测试插入部门数据
    debugInfo.steps.push("测试插入部门数据");
    try {
      const result = await sql`
        INSERT INTO departments (name, description) VALUES 
          ('经控贸易', '经控贸易部门'),
          ('开投贸易', '开投贸易部门')
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name
      `;
      debugInfo.steps.push(`✅ 部门数据插入成功: ${result.length} 条记录`);
      debugInfo.departments = result;
    } catch (error) {
      debugInfo.errors.push(`插入部门数据失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    // 步骤7：测试插入人员数据
    debugInfo.steps.push("测试插入人员数据");
    try {
      const testEmployee = await sql`
        INSERT INTO employees (name, department_id, position)
        VALUES ('测试人员', 1, '测试职位')
        ON CONFLICT DO NOTHING
        RETURNING id, name
      `;
      debugInfo.steps.push(`✅ 人员数据插入测试成功`);

      // 清理测试数据
      if (testEmployee.length > 0) {
        await sql`DELETE FROM employees WHERE name = '测试人员'`;
        debugInfo.steps.push("✅ 测试数据清理完成");
      }
    } catch (error) {
      debugInfo.errors.push(`插入人员数据失败: ${error.message}`);
      return Response.json(debugInfo);
    }

    debugInfo.success = true;
    debugInfo.steps.push("🎉 所有测试通过，数据库初始化准备就绪！");
  } catch (error) {
    debugInfo.errors.push(`未预期的错误: ${error.message}`);
    debugInfo.stack = error.stack;
  }

  return Response.json(debugInfo);
}
