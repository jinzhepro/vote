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

// 修复 RLS 策略的 SQL 语句
const fixRLSPoliciesSQL = `
-- 添加允许插入 personnel 表的策略
DROP POLICY IF EXISTS "Allow insert personnel" ON personnel;
CREATE POLICY "Allow insert personnel" ON personnel
  FOR INSERT WITH CHECK (true);
`;

// 修复 RLS 策略的函数
async function fixRLSPolicies() {
  try {
    console.log("开始修复行级安全策略...");

    // 由于 Supabase 限制，我们需要提供手动执行的 SQL
    console.log("请在 Supabase 控制台的 SQL 编辑器中执行以下 SQL 语句：");
    console.log("```sql");
    console.log(fixRLSPoliciesSQL);
    console.log("```");

    console.log("\n执行步骤：");
    console.log("1. 打开 Supabase 控制台: https://supabase.com/dashboard");
    console.log("2. 选择您的项目");
    console.log("3. 进入 SQL 编辑器");
    console.log("4. 复制并执行上述 SQL 语句");
    console.log("5. 执行完成后，运行以下命令重新上传人员数据：");
    console.log("   npm run upload:personnel");

    // 测试当前策略状态
    console.log("\n=== 测试当前策略状态 ===");
    const testData = {
      id: "TEST001",
      name: "测试用户",
      department: "test",
      department_name: "测试部门",
    };

    const { data, error } = await supabase
      .from("personnel")
      .insert(testData)
      .select();

    if (error) {
      console.log("❌ 当前策略仍然阻止插入操作:", error.message);
      console.log("请按照上述说明手动执行 SQL 语句来修复策略。");
    } else {
      console.log("✅ 策略已正确设置，插入操作成功");

      // 清理测试数据
      const { error: deleteError } = await supabase
        .from("personnel")
        .delete()
        .eq("id", "TEST001");

      if (deleteError) {
        console.warn("清理测试数据失败:", deleteError.message);
      } else {
        console.log("✅ 测试数据已清理");
      }
    }
  } catch (error) {
    console.error("修复过程中发生错误:", error);
    process.exit(1);
  }
}

// 执行修复
fixRLSPolicies();
