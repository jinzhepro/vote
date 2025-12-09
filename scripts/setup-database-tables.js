const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.local" });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("错误: 缺少 Supabase 配置。请检查 .env.local 文件。");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 创建数据库表的 SQL 语句
const createTablesSQL = `
-- 创建人员表
CREATE TABLE IF NOT EXISTS personnel (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评价表
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  personnel_id VARCHAR(10) NOT NULL,
  department VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  comments TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_personnel_department ON personnel(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_personnel_id ON evaluations(personnel_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_department ON evaluations(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_timestamp ON evaluations(timestamp);

-- 启用行级安全
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
DROP POLICY IF EXISTS "Allow anonymous read access to personnel" ON personnel;
CREATE POLICY "Allow anonymous read access to personnel" ON personnel
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert personnel" ON personnel;
CREATE POLICY "Allow insert personnel" ON personnel
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert evaluations" ON evaluations;
CREATE POLICY "Allow insert evaluations" ON evaluations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read own evaluations" ON evaluations;
CREATE POLICY "Allow read own evaluations" ON evaluations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update own evaluations" ON evaluations;
CREATE POLICY "Allow update own evaluations" ON evaluations
  FOR UPDATE USING (true);
`;

// 设置数据库表的函数
async function setupDatabaseTables() {
  try {
    console.log("开始设置数据库表...");

    // 执行 SQL 语句
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: createTablesSQL,
    });

    if (error) {
      console.error("设置数据库表失败:", error);
      console.log(
        "\n请手动在 Supabase 控制台的 SQL 编辑器中执行以下 SQL 语句:"
      );
      console.log("```sql");
      console.log(createTablesSQL);
      console.log("```");
      process.exit(1);
    }

    console.log("数据库表设置成功！");

    // 验证表是否创建成功
    const { data: personnelData, error: personnelError } = await supabase
      .from("personnel")
      .select("*")
      .limit(1);

    if (personnelError) {
      console.error("验证 personnel 表失败:", personnelError);
      process.exit(1);
    }

    const { data: evaluationsData, error: evaluationsError } = await supabase
      .from("evaluations")
      .select("*")
      .limit(1);

    if (evaluationsError) {
      console.error("验证 evaluations 表失败:", evaluationsError);
      process.exit(1);
    }

    console.log("所有表验证成功！数据库已准备就绪。");
  } catch (error) {
    console.error("设置过程中发生错误:", error);
    console.log("\n请手动在 Supabase 控制台的 SQL 编辑器中执行以下 SQL 语句:");
    console.log("```sql");
    console.log(createTablesSQL);
    console.log("```");
    process.exit(1);
  }
}

// 执行设置
setupDatabaseTables();
