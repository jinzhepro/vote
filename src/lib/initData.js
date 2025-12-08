// 初始化数据定义

export const DEPARTMENTS = [
  {
    name: "经控贸易",
    description: "经控贸易部门",
  },
  {
    name: "开投贸易",
    description: "开投贸易部门",
  },
];

export const JINGKONG_EMPLOYEES = [
  "郑效明",
  "赵晓",
  "薛慧",
  "张倩",
  "敬志伟",
  "薛清华",
  "邵汉明",
  "陈立群",
  "赵安琪",
  "刘婷",
  "方舟",
  "韩晓青",
  "赵邦宇",
  "刘丽",
  "李鸿康",
  "张津诚",
  "马丽萍",
  "李昕益",
  "王泽民",
  "张梦卿",
  "张新军",
  "赵惠东",
  "张笑艳",
  "韩高洁",
  "孙琨",
  "刘萍",
  "薛洋",
  "潘振龙",
  "侯继儒",
  "沙绿洲",
  "庞东",
  "张鹏京",
  "闫书奇",
  "吕仕杰",
  "孔帅",
  "王伊凡",
  "杨春梅",
  "管伟胜",
  "刘雅超",
  "付冰清",
  "张晋哲",
  "原豪豪",
  "崔建刚",
  "张照月",
  "廖斌",
  "杨颖",
];

export const KAITOU_EMPLOYEES = [
  "周晓彬",
  "陆剑飞",
  "薛德晓",
  "张龙龙",
  "唐国彬",
  "杨仕玉",
  "刘娜",
  "王珉",
  "初凯",
  "段启愚",
  "高青",
  "纪蕾",
  "王杰",
  "杨龙泉",
  "迟浩元",
  "刘伟玉",
  "陈雨田",
  "高洋",
  "毛璐杰",
  "杜嘉祎",
  "臧梦娇",
];

// 验证数据完整性
export function validateInitData() {
  const totalEmployees = JINGKONG_EMPLOYEES.length + KAITOU_EMPLOYEES.length;

  console.log("📊 数据验证结果:");
  console.log(`- 部门数量: ${DEPARTMENTS.length}`);
  console.log(`- 经控贸易人员: ${JINGKONG_EMPLOYEES.length}人`);
  console.log(`- 开投贸易人员: ${KAITOU_EMPLOYEES.length}人`);
  console.log(`- 总人员数: ${totalEmployees}人`);

  // 检查是否有重复姓名
  const allEmployees = [...JINGKONG_EMPLOYEES, ...KAITOU_EMPLOYEES];
  const duplicates = allEmployees.filter(
    (name, index) => allEmployees.indexOf(name) !== index
  );

  if (duplicates.length > 0) {
    console.warn("⚠️ 发现重复姓名:", duplicates);
  } else {
    console.log("✅ 无重复姓名");
  }

  return {
    departments: DEPARTMENTS.length,
    jingkongEmployees: JINGKONG_EMPLOYEES.length,
    kaitouEmployees: KAITOU_EMPLOYEES.length,
    totalEmployees,
    hasDuplicates: duplicates.length > 0,
    duplicates,
  };
}
