// 从 Supabase 获取人员数据的函数

// 获取所有人员名单的函数
export const getAllPersonnel = async () => {
  try {
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
  { id: "JK001", name: "郑效明" },
  { id: "JK002", name: "赵晓" },
  { id: "JK003", name: "薛慧" },
  { id: "JK004", name: "张倩" },
  { id: "JK005", name: "敬志伟" },
  { id: "JK006", name: "薛清华" },
  { id: "JK007", name: "邵汉明" },
  { id: "JK008", name: "陈立群" },
  { id: "JK009", name: "赵安琪" },
  { id: "JK010", name: "刘婷" },
  { id: "JK011", name: "方舟" },
  { id: "JK012", name: "韩晓青" },
  { id: "JK013", name: "赵邦宇" },
  { id: "JK014", name: "刘丽" },
  { id: "JK015", name: "李鸿康" },
  { id: "JK016", name: "张津诚" },
  { id: "JK017", name: "马丽萍" },
  { id: "JK018", name: "李昕益" },
  { id: "JK019", name: "王泽民" },
  { id: "JK020", name: "张梦卿" },
  { id: "JK021", name: "张新军" },
  { id: "JK022", name: "赵惠东" },
  { id: "JK023", name: "张笑艳" },
  { id: "JK024", name: "韩高洁" },
  { id: "JK025", name: "孙琨" },
  { id: "JK026", name: "刘萍" },
  { id: "JK027", name: "薛洋" },
  { id: "JK028", name: "潘振龙" },
  { id: "JK029", name: "侯继儒" },
  { id: "JK030", name: "沙绿洲" },
  { id: "JK031", name: "庞东" },
  { id: "JK032", name: "张鹏京" },
  { id: "JK033", name: "闫书奇" },
  { id: "JK034", name: "吕仕杰" },
  { id: "JK035", name: "孔帅" },
  { id: "JK036", name: "王伊凡" },
  { id: "JK037", name: "杨春梅" },
  { id: "JK038", name: "管伟胜" },
  { id: "JK039", name: "刘雅超" },
  { id: "JK040", name: "付冰清" },
  { id: "JK041", name: "张晋哲" },
  { id: "JK042", name: "原豪豪" },
  { id: "JK043", name: "崔建刚" },
  { id: "JK044", name: "张照月" },
  { id: "JK045", name: "廖斌" },
  { id: "JK046", name: "杨颖" },
  { id: "JK047", name: "肖锐" },
  { id: "JK048", name: "纪明霞" },
  { id: "JK049", name: "雷婷婷" },
  { id: "JK050", name: "张洋洋" },
  { id: "JK051", name: "陈泉玮" },
  { id: "JK052", name: "冯小凡" },
  { id: "JK053", name: "冷霜" },
];

export const kaitouPersonnel = [
  { id: "KT001", name: "周晓彬" },
  { id: "KT002", name: "陆剑飞" },
  { id: "KT003", name: "薛德晓" },
  { id: "KT004", name: "张龙龙" },
  { id: "KT005", name: "唐国彬" },
  { id: "KT006", name: "杨仕玉" },
  { id: "KT007", name: "刘娜" },
  { id: "KT008", name: "王珉" },
  { id: "KT009", name: "初凯" },
  { id: "KT010", name: "段启愚" },
  { id: "KT011", name: "高青" },
  { id: "KT012", name: "纪蕾" },
  { id: "KT013", name: "王杰" },
  { id: "KT014", name: "杨龙泉" },
  { id: "KT015", name: "迟浩元" },
  { id: "KT016", name: "刘伟玉" },
  { id: "KT017", name: "陈雨田" },
  { id: "KT018", name: "高洋" },
  { id: "KT019", name: "毛璐杰" },
  { id: "KT020", name: "杜嘉祎" },
  { id: "KT021", name: "臧梦娇" },
];
