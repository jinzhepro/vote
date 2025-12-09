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

// 人员数据
const jingkongPersonnel = [
  { name: "郑效明" },
  { name: "赵晓" },
  { name: "薛慧" },
  { name: "张倩" },
  { name: "敬志伟" },
  { name: "薛清华" },
  { name: "邵汉明" },
  { name: "陈立群" },
  { name: "赵安琪" },
  { name: "刘婷" },
  { name: "方舟" },
  { name: "韩晓青" },
  { name: "赵邦宇" },
  { name: "刘丽" },
  { name: "李鸿康" },
  { name: "张津诚" },
  { name: "马丽萍" },
  { name: "李昕益" },
  { name: "王泽民" },
  { name: "张梦卿" },
  { name: "张新军" },
  { name: "赵惠东" },
  { name: "张笑艳" },
  { name: "韩高洁" },
  { name: "孙琨" },
  { name: "刘萍" },
  { name: "薛洋" },
  { name: "潘振龙" },
  { name: "侯继儒" },
  { name: "沙绿洲" },
  { name: "庞东" },
  { name: "张鹏京" },
  { name: "闫书奇" },
  { name: "吕仕杰" },
  { name: "孔帅" },
  { name: "王伊凡" },
  { name: "杨春梅" },
  { name: "管伟胜" },
  { name: "刘雅超" },
  { name: "付冰清" },
  { name: "张晋哲" },
  { name: "原豪豪" },
  { name: "崔建刚" },
  { name: "张照月" },
  { name: "廖斌" },
  { name: "杨颖" },
  { name: "肖锐" },
  { name: "纪明霞" },
  { name: "雷婷婷" },
  { name: "张洋洋" },
  { name: "陈泉玮" },
  { name: "冯小凡" },
  { name: "冷霜" },
];

const kaitouPersonnel = [
  { name: "周晓彬" },
  { name: "陆剑飞" },
  { name: "薛德晓" },
  { name: "张龙龙" },
  { name: "唐国彬" },
  { name: "杨仕玉" },
  { name: "刘娜" },
  { name: "王珉" },
  { name: "初凯" },
  { name: "段启愚" },
  { name: "高青" },
  { name: "纪蕾" },
  { name: "王杰" },
  { name: "杨龙泉" },
  { name: "迟浩元" },
  { name: "刘伟玉" },
  { name: "陈雨田" },
  { name: "高洋" },
  { name: "毛璐杰" },
  { name: "杜嘉祎" },
  { name: "臧梦娇" },
];

// 生成唯一ID的函数
function generateId(department, index) {
  const prefix = department === "jingkong" ? "JK" : "KT";
  return `${prefix}${String(index + 1).padStart(3, "0")}`;
}

// 上传人员数据的函数
async function uploadPersonnelData() {
  try {
    console.log("开始上传人员数据到数据库...");

    // 检查数据库连接
    const { data: testData, error: testError } = await supabase
      .from("personnel")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("数据库连接失败:", testError);
      console.log("请确保已按照 SUPABASE_SETUP.md 中的说明设置数据库表。");
      process.exit(1);
    }

    console.log("数据库连接成功！");

    // 清空现有数据（可选）
    const { error: deleteError } = await supabase
      .from("personnel")
      .delete()
      .neq("id", "");

    if (deleteError) {
      console.warn("清空现有数据时出错:", deleteError.message);
    } else {
      console.log("已清空现有人员数据");
    }

    // 准备经控贸易部门数据
    const jingkongData = jingkongPersonnel.map((person, index) => ({
      id: generateId("jingkong", index),
      name: person.name,
      department: "jingkong",
      department_name: "经控贸易",
    }));

    // 准备开投贸易部门数据
    const kaitouData = kaitouPersonnel.map((person, index) => ({
      id: generateId("kaitou", index),
      name: person.name,
      department: "kaitou",
      department_name: "开投贸易",
    }));

    // 合并所有数据
    const allPersonnel = [...jingkongData, ...kaitouData];

    console.log(`准备上传 ${allPersonnel.length} 条人员记录...`);

    // 分批上传数据（每次最多50条）
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allPersonnel.length; i += batchSize) {
      const batch = allPersonnel.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("personnel")
        .insert(batch)
        .select();

      if (error) {
        console.error(`批次 ${Math.floor(i / batchSize) + 1} 上传失败:`, error);
        errorCount += batch.length;
      } else {
        console.log(
          `批次 ${Math.floor(i / batchSize) + 1} 上传成功 (${
            batch.length
          } 条记录)`
        );
        successCount += batch.length;
      }
    }

    console.log("\n=== 上传结果 ===");
    console.log(`成功上传: ${successCount} 条记录`);
    console.log(`失败: ${errorCount} 条记录`);
    console.log(`总计: ${allPersonnel.length} 条记录`);

    if (successCount > 0) {
      console.log("\n人员数据上传完成！");

      // 验证上传结果
      const { data: verifyData, error: verifyError } = await supabase
        .from("personnel")
        .select("department, count")
        .group("department");

      if (!verifyError && verifyData) {
        console.log("\n=== 数据验证 ===");
        verifyData.forEach((dept) => {
          const deptName =
            dept.department === "jingkong" ? "经控贸易" : "开投贸易";
          console.log(`${deptName}: ${dept.count} 人`);
        });
      }
    }
  } catch (error) {
    console.error("上传过程中发生错误:", error);
    process.exit(1);
  }
}

// 执行上传
uploadPersonnelData();
