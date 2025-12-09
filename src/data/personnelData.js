// 从 Supabase 获取人员数据的函数

// 获取所有人员名单的函数
export const getAllPersonnel = async () => {
  try {
    // 从API获取数据
    const response = await fetch("/api/personnel");
    if (!response.ok) {
      throw new Error("获取人员数据失败");
    }
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "获取人员数据失败");
    }

    // 将数据转换为原来的格式
    const personnel = {};
    result.data.forEach((person) => {
      if (!personnel[person.department]) {
        personnel[person.department] = [];
      }
      personnel[person.department].push({
        id: person.id,
        name: person.name,
      });
    });

    return personnel;
  } catch (error) {
    console.error("获取人员数据失败:", error);
    // 返回空数据作为后备
    return {
      jingkong: [],
      kaitou: [],
    };
  }
};

// 根据部门获取人员名单的函数
export const getPersonnelByDepartment = async (department) => {
  try {
    // 从API获取数据
    const response = await fetch(`/api/personnel?department=${department}`);
    if (!response.ok) {
      throw new Error("获取部门人员数据失败");
    }
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "获取部门人员数据失败");
    }

    // 将数据转换为原来的格式
    return result.data.map((person) => ({
      id: person.id,
      name: person.name,
    }));
  } catch (error) {
    console.error("获取部门人员数据失败:", error);
    // 返回空数据作为后备
    return [];
  }
};

// 获取人员总数的函数
export const getPersonnelCount = async (department) => {
  try {
    const personnel = await getPersonnelByDepartment(department);
    return personnel.length;
  } catch (error) {
    console.error("获取人员总数失败:", error);
    return 0;
  }
};

// 根据ID获取人员信息的函数
export const getPersonnelById = async (id) => {
  try {
    // 从API获取数据
    const response = await fetch("/api/personnel");
    if (!response.ok) {
      throw new Error("获取人员数据失败");
    }
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "获取人员数据失败");
    }

    const person = result.data.find((p) => p.id === id);
    return person
      ? {
          id: person.id,
          name: person.name,
          department: person.department,
          department_name: person.department_name,
        }
      : null;
  } catch (error) {
    console.error("根据ID获取人员信息失败:", error);
    return null;
  }
};

// 根据姓名获取人员信息的函数
export const getPersonnelByName = async (name) => {
  try {
    // 从API获取数据
    const response = await fetch("/api/personnel");
    if (!response.ok) {
      throw new Error("获取人员数据失败");
    }
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "获取人员数据失败");
    }

    const person = result.data.find((p) => p.name === name);
    return person
      ? {
          id: person.id,
          name: person.name,
          department: person.department,
          department_name: person.department_name,
        }
      : null;
  } catch (error) {
    console.error("根据姓名获取人员信息失败:", error);
    return null;
  }
};

// 本地备用数据（当 Supabase 不可用时使用）
export const jingkongPersonnel = [
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

export const kaitouPersonnel = [
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
