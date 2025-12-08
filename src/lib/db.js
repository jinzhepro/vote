import { neon } from "@neondatabase/serverless";

// 创建数据库连接
const sql = neon(process.env.DATABASE_URL);

// 测试数据库连接
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("数据库连接成功:", result);
    return true;
  } catch (error) {
    console.error("数据库连接失败:", error);
    return false;
  }
}

// 初始化数据库表
export async function initializeDatabase() {
  try {
    console.log("🔄 开始初始化数据库表...");

    // 步骤1：创建部门表
    console.log("📝 创建部门表...");
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS departments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("✅ 部门表创建成功");
    } catch (error) {
      console.error("❌ 部门表创建失败:", error);
      throw new Error(`部门表创建失败: ${error.message}`);
    }

    // 步骤2：创建人员表
    console.log("📝 创建人员表...");
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
      console.log("✅ 人员表创建成功");
    } catch (error) {
      console.error("❌ 人员表创建失败:", error);
      throw new Error(`人员表创建失败: ${error.message}`);
    }

    // 步骤3：初始化部门数据
    console.log("📊 初始化部门数据...");
    try {
      const result = await sql`
        INSERT INTO departments (name, description) VALUES 
          ('经控贸易', '经控贸易部门'),
          ('开投贸易', '开投贸易部门')
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name
      `;
      console.log(`✅ 部门数据初始化完成: ${result.length} 条记录`);
    } catch (error) {
      console.error("❌ 部门数据初始化失败:", error);
      throw new Error(`部门数据初始化失败: ${error.message}`);
    }

    console.log("🎉 数据库初始化完成");
    return true;
  } catch (error) {
    console.error("💥 数据库初始化失败:", error);
    throw error; // 重新抛出错误，让上层处理
  }
}

export default sql;
