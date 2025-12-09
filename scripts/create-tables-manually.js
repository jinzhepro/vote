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

console.log("=== 数据库表设置指南 ===\n");
console.log("由于 Supabase 限制，需要手动在 Supabase 控制台中创建表。\n");
console.log("请按照以下步骤操作：\n");
console.log("1. 打开 Supabase 控制台: https://supabase.com/dashboard");
console.log("2. 选择您的项目");
console.log("3. 进入 SQL 编辑器");
console.log("4. 复制并执行以下 SQL 语句：\n");

const sqlStatements = `
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

console.log(sqlStatements);

console.log("\n5. 执行完 SQL 语句后，运行以下命令上传人员数据：");
console.log("   npm run upload:personnel");
console.log("\n6. 如果需要测试数据库连接，可以运行：");
console.log("   npm run test:supabase");

// 测试数据库连接
async function testConnection() {
  try {
    console.log("\n=== 测试数据库连接 ===");
    const { data, error } = await supabase
      .from("_test_connection")
      .select("*")
      .limit(1);

    if (error && error.code === "PGRST116") {
      console.log("✅ 数据库连接正常，但表尚未创建");
      console.log("请按照上述说明手动创建表。");
    } else if (error) {
      console.log("❌ 数据库连接失败:", error.message);
    } else {
      console.log("✅ 数据库连接正常");
    }
  } catch (err) {
    console.log("❌ 连接测试失败:", err.message);
  }
}

testConnection();
