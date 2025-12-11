// 本地人员数据管理函数

// 获取所有人员名单的函数
export const getAllPersonnel = async () => {
  try {
    // 直接返回本地数据
    return {
      jingkong: jingkongPersonnel,
      kaitou: kaitouPersonnel,
      functional: functionalPersonnel,
    };
  } catch (error) {
    console.error("获取人员数据失败:", error);
    // 返回空数据作为后备
    return {
      jingkong: [],
      kaitou: [],
      functional: [],
    };
  }
};

// 根据部门获取人员名单的函数
export const getPersonnelByDepartment = async (department) => {
  try {
    // 直接返回本地数据
    if (department === "jingkong") {
      return jingkongPersonnel;
    } else if (department === "kaitou") {
      return kaitouPersonnel;
    } else if (department === "functional") {
      return functionalPersonnel;
    } else {
      return [];
    }
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
    // 从本地数据中查找
    const allPersonnel = [
      ...jingkongPersonnel,
      ...kaitouPersonnel,
      ...functionalPersonnel,
    ];
    const person = allPersonnel.find((p) => p.id === id);

    if (person) {
      let department, departmentName;
      if (jingkongPersonnel.includes(person)) {
        department = "jingkong";
        departmentName = "经控贸易";
      } else if (kaitouPersonnel.includes(person)) {
        department = "kaitou";
        departmentName = "开投贸易";
      } else {
        department = "functional";
        departmentName = "职能部门";
      }

      return {
        id: person.id,
        name: person.name,
        role: person.role || "employee",
        department: department,
        department_name: departmentName,
      };
    }

    return null;
  } catch (error) {
    console.error("根据ID获取人员信息失败:", error);
    return null;
  }
};

// 根据姓名获取人员信息的函数
export const getPersonnelByName = async (name) => {
  try {
    // 优先从职能部门查找
    let person = functionalPersonnel.find((p) => p.name === name);
    if (person) {
      return {
        id: person.id,
        name: person.name,
        role: person.role || "employee",
        department: "functional",
        department_name: "职能部门",
      };
    }

    // 然后从经控贸易部门查找
    person = jingkongPersonnel.find((p) => p.name === name);
    if (person) {
      return {
        id: person.id,
        name: person.name,
        role: person.role || "employee",
        department: "jingkong",
        department_name: "经控贸易",
      };
    }

    // 最后从开投贸易部门查找
    person = kaitouPersonnel.find((p) => p.name === name);
    if (person) {
      return {
        id: person.id,
        name: person.name,
        role: person.role || "employee",
        department: "kaitou",
        department_name: "开投贸易",
      };
    }

    return null;
  } catch (error) {
    console.error("根据姓名获取人员信息失败:", error);
    return null;
  }
};

// 本地人员数据

export const jingkongPersonnel = [
  { id: "JK001", name: "郑效明", role: "leader" },
  { id: "JK002", name: "赵晓", role: "employee" },
  { id: "JK003", name: "薛慧", role: "employee" },
  { id: "JK004", name: "张倩", role: "employee" },
  { id: "JK005", name: "敬志伟", role: "leader" },
  { id: "JK006", name: "薛清华", role: "employee" },
  { id: "JK007", name: "邵汉明", role: "employee" },
  { id: "JK008", name: "陈立群", role: "leader" },
  { id: "JK009", name: "赵安琪", role: "employee" },
  { id: "JK010", name: "刘婷", role: "employee" },
  { id: "JK011", name: "方舟", role: "employee" },
  { id: "JK012", name: "韩晓青", role: "employee" },
  { id: "JK013", name: "赵邦宇", role: "employee" },
  { id: "JK014", name: "刘丽", role: "leader" },
  { id: "JK015", name: "李鸿康", role: "employee" },
  { id: "JK016", name: "张津诚", role: "employee" },
  { id: "JK017", name: "马丽萍", role: "employee" },
  { id: "JK018", name: "李昕益", role: "employee" },
  { id: "JK019", name: "王泽民", role: "employee" },
  { id: "JK020", name: "张梦卿", role: "employee" },
  { id: "JK021", name: "张新军", role: "leader" },
  { id: "JK022", name: "赵惠东", role: "employee" },
  { id: "JK023", name: "张笑艳", role: "employee" },
  { id: "JK024", name: "韩高洁", role: "employee" },
  { id: "JK025", name: "孙琨", role: "employee" },
  { id: "JK026", name: "刘萍", role: "employee" },
  { id: "JK027", name: "薛洋", role: "employee" },
  { id: "JK028", name: "潘振龙", role: "employee" },
  { id: "JK029", name: "侯继儒", role: "leader" },
  { id: "JK030", name: "沙绿洲", role: "employee" },
  { id: "JK031", name: "庞东", role: "leader" },
  { id: "JK032", name: "张鹏京", role: "employee" },
  { id: "JK033", name: "闫书奇", role: "employee" },
  { id: "JK034", name: "吕仕杰", role: "employee" },
  { id: "JK035", name: "孔帅", role: "employee" },
  { id: "JK036", name: "王伊凡", role: "employee" },
  { id: "JK037", name: "杨春梅", role: "employee" },
  { id: "JK038", name: "管伟胜", role: "employee" },
  { id: "JK039", name: "刘雅超", role: "employee" },
  { id: "JK040", name: "付冰清", role: "employee" },
  { id: "JK041", name: "张晋哲", role: "employee" },
  { id: "JK042", name: "原豪豪", role: "employee" },
  { id: "JK043", name: "崔建刚", role: "leader" },
  { id: "JK044", name: "张照月", role: "employee" },
  { id: "JK045", name: "廖斌", role: "employee" },
  { id: "JK046", name: "杨颖", role: "employee" },
  { id: "JK047", name: "肖锐", role: "employee" },
  { id: "JK048", name: "纪明霞", role: "leader" },
  { id: "JK049", name: "雷婷婷", role: "employee" },
  { id: "JK050", name: "张洋洋", role: "employee" },
  { id: "JK051", name: "陈泉玮", role: "employee" },
  { id: "JK052", name: "冯小凡", role: "employee" },
  { id: "JK053", name: "冷霜", role: "employee" },
  { id: "JK054", name: "丁鑫", role: "employee" },
  { id: "JK055", name: "张祥舟", role: "employee" },
];

export const kaitouPersonnel = [
  { id: "KT001", name: "周晓彬", role: "leader" },
  { id: "KT002", name: "陆剑飞", role: "leader" },
  { id: "KT003", name: "薛德晓", role: "employee" },
  { id: "KT004", name: "张龙龙", role: "employee" },
  { id: "KT005", name: "唐国彬", role: "employee" },
  { id: "KT006", name: "杨仕玉", role: "employee" },
  { id: "KT007", name: "刘娜", role: "employee" },
  { id: "KT008", name: "王珉", role: "employee" },
  { id: "KT009", name: "初凯", role: "employee" },
  { id: "KT010", name: "段启愚", role: "employee" },
  { id: "KT011", name: "高青", role: "employee" },
  { id: "KT012", name: "纪蕾", role: "employee" },
  { id: "KT013", name: "王杰", role: "employee" },
  { id: "KT014", name: "杨龙泉", role: "employee" },
  { id: "KT015", name: "迟浩元", role: "employee" },
  { id: "KT016", name: "刘伟玉", role: "employee" },
  { id: "KT017", name: "陈雨田", role: "employee" },
  { id: "KT018", name: "高洋", role: "employee" },
  { id: "KT019", name: "毛璐杰", role: "employee" },
  { id: "KT020", name: "杜嘉祎", role: "employee" },
  { id: "KT021", name: "臧梦娇", role: "employee" },
];

export const functionalPersonnel = [
  { id: "FN001", name: "郑效明", role: "leader" },
  { id: "FN002", name: "敬志伟", role: "leader" },
  { id: "FN003", name: "陈立群", role: "leader" },
  { id: "FN004", name: "纪明霞", role: "leader" },
];
