import sql from "@/lib/db.js";

export async function POST(request) {
  const { step } = await request.json();

  try {
    switch (step) {
      case "test-connection":
        const result =
          await sql`SELECT NOW() as current_time, version() as db_version`;
        return Response.json({
          success: true,
          message: "数据库连接成功",
          data: result[0],
        });

      case "create-departments-table":
        await sql`
          CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        return Response.json({
          success: true,
          message: "部门表创建成功",
        });

      case "create-employees-table":
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
        return Response.json({
          success: true,
          message: "人员表创建成功",
        });

      case "insert-departments":
        const deptResult = await sql`
          INSERT INTO departments (name, description) VALUES 
            ('经控贸易', '经控贸易部门'),
            ('开投贸易', '开投贸易部门')
          ON CONFLICT (name) DO NOTHING
          RETURNING id, name
        `;
        return Response.json({
          success: true,
          message: `部门数据插入成功: ${deptResult.length} 条记录`,
          data: deptResult,
        });

      case "check-tables":
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `;
        return Response.json({
          success: true,
          message: "表检查完成",
          data: tables,
        });

      default:
        return Response.json(
          {
            success: false,
            message: "未知步骤",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`步骤 ${step} 失败:`, error);
    return Response.json(
      {
        success: false,
        message: `步骤 ${step} 失败: ${error.message}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
