// 本地人员数据管理函数

// 身份证号验证函数
export const validateIdCard = (idCard) => {
  // 转换为大写以便不区分大小写
  const upperIdCard = idCard.toUpperCase();

  // 基本格式验证：18位数字，最后一位可以是X
  const idCardRegex =
    /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!idCardRegex.test(upperIdCard)) {
    return false;
  }

  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(upperIdCard[i]) * weights[i];
  }

  const checkCode = checkCodes[sum % 11];
  return upperIdCard[17] === checkCode;
};

// 根据姓名和身份证号获取人员信息的函数
export const getPersonnelByNameAndIdCard = (name, idCard) => {
  try {
    console.log("查找人员:", { name, idCard });

    // 优先从职能部门查找
    let person = functionalPersonnel.find(
      (p) => p.name === name && p.idCard === idCard
    );
    if (person) {
      console.log("在职能部门找到人员:", person);
      return {
        id: person.id,
        name: person.name,
        idCard: person.idCard,
        role: person.role || "employee",
        department: "functional",
        department_name: "职能部门",
      };
    }

    // 然后从经控贸易部门查找
    person = jingkongPersonnel.find(
      (p) => p.name === name && p.idCard === idCard
    );
    if (person) {
      console.log("在经控贸易部门找到人员:", person);
      return {
        id: person.id,
        name: person.name,
        idCard: person.idCard,
        role: person.role || "employee",
        department: "jingkong",
        department_name: "经控贸易",
      };
    }

    // 最后从开投贸易部门查找
    person = kaitouPersonnel.find(
      (p) => p.name === name && p.idCard === idCard
    );
    if (person) {
      console.log("在开投贸易部门找到人员:", person);
      return {
        id: person.id,
        name: person.name,
        idCard: person.idCard,
        role: person.role || "employee",
        department: "kaitou",
        department_name: "开投贸易",
      };
    }

    console.log("未找到匹配的人员");
    return null;
  } catch (error) {
    console.error("根据姓名和身份证号获取人员信息失败:", error);
    return null;
  }
};

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
export const getPersonnelByDepartment = (department) => {
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
        idCard: person.idCard,
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
        idCard: person.idCard,
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
        idCard: person.idCard,
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
        idCard: person.idCard,
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
  { id: "JK001", name: "郑效明", role: "leader", idCard: "37078519860919491X" },
  { id: "JK002", name: "赵晓", role: "employee", idCard: "370284199010253363" },
  { id: "JK003", name: "薛慧", role: "employee", idCard: "37028119870217702X" },
  { id: "JK004", name: "张倩", role: "employee", idCard: "370832198805040347" },
  { id: "JK005", name: "敬志伟", role: "leader", idCard: "37078319870718419X" },
  {
    id: "JK006",
    name: "薛清华",
    role: "employee",
    idCard: "370284199501095814",
  },
  {
    id: "JK007",
    name: "邵汉明",
    role: "employee",
    idCard: "370284198710316439",
  },
  { id: "JK008", name: "陈立群", role: "leader", idCard: "370822197806012017" },
  {
    id: "JK009",
    name: "赵安琪",
    role: "employee",
    idCard: "370211199002180522",
  },
  { id: "JK010", name: "刘婷", role: "employee", idCard: "371422199405300024" },
  { id: "JK011", name: "方舟", role: "employee", idCard: "510223198105230315" },
  {
    id: "JK012",
    name: "韩晓青",
    role: "employee",
    idCard: "37020219900405112X",
  },
  {
    id: "JK013",
    name: "赵邦宇",
    role: "employee",
    idCard: "41232119950716933X",
  },
  { id: "JK014", name: "刘丽", role: "leader", idCard: "370284198404084342" },
  {
    id: "JK015",
    name: "李鸿康",
    role: "employee",
    idCard: "370284198611130030",
  },
  {
    id: "JK016",
    name: "张津诚",
    role: "employee",
    idCard: "370211199205072011",
  },
  {
    id: "JK017",
    name: "马丽萍",
    role: "employee",
    idCard: "370284198901133926",
  },
  {
    id: "JK018",
    name: "李昕益",
    role: "employee",
    idCard: "370202199605171418",
  },
  {
    id: "JK019",
    name: "王泽民",
    role: "employee",
    idCard: "370284199201170819",
  },
  {
    id: "JK020",
    name: "张梦卿",
    role: "employee",
    idCard: "37028419900901332X",
  },
  { id: "JK021", name: "张新军", role: "leader", idCard: "370784198604242517" },
  {
    id: "JK022",
    name: "赵惠东",
    role: "employee",
    idCard: "370202199411272210",
  },
  {
    id: "JK023",
    name: "张笑艳",
    role: "employee",
    idCard: "370284198501090429",
  },
  {
    id: "JK024",
    name: "韩高洁",
    role: "employee",
    idCard: "370211199011170019",
  },
  { id: "JK025", name: "孙琨", role: "employee", idCard: "370284198709160051" },
  { id: "JK026", name: "刘萍", role: "employee", idCard: "370785199309094524" },
  { id: "JK027", name: "薛洋", role: "employee", idCard: "370211198803212040" },
  {
    id: "JK028",
    name: "潘振龙",
    role: "employee",
    idCard: "370284198804290436",
  },
  { id: "JK029", name: "侯继儒", role: "leader", idCard: "370521198807030016" },
  {
    id: "JK030",
    name: "沙绿洲",
    role: "employee",
    idCard: "370284198112300058",
  },
  { id: "JK031", name: "庞东", role: "leader", idCard: "37020319840814093X" },
  {
    id: "JK032",
    name: "张鹏京",
    role: "employee",
    idCard: "370284198809130474",
  },
  {
    id: "JK033",
    name: "闫书奇",
    role: "employee",
    idCard: "372925199504015322",
  },
  {
    id: "JK034",
    name: "吕仕杰",
    role: "employee",
    idCard: "371203199409103714",
  },
  { id: "JK035", name: "孔帅", role: "employee", idCard: "411326199211055836" },
  {
    id: "JK036",
    name: "王伊凡",
    role: "employee",
    idCard: "370284198812191817",
  },
  {
    id: "JK037",
    name: "杨春梅",
    role: "employee",
    idCard: "511321198708240022",
  },
  {
    id: "JK038",
    name: "管伟胜",
    role: "employee",
    idCard: "370284198803126415",
  },
  {
    id: "JK039",
    name: "刘雅超",
    role: "employee",
    idCard: "370211199010181023",
  },
  {
    id: "JK040",
    name: "付冰清",
    role: "employee",
    idCard: "412727199507133548",
  },
  {
    id: "JK041",
    name: "张晋哲",
    role: "employee",
    idCard: "370304199501072739",
  },
  {
    id: "JK042",
    name: "原豪豪",
    role: "employee",
    idCard: "410822199407091514",
  },
  { id: "JK043", name: "崔建刚", role: "leader", idCard: "370285198511212932" },
  {
    id: "JK044",
    name: "张照月",
    role: "employee",
    idCard: "37052320021209462X",
  },
  { id: "JK045", name: "廖斌", role: "employee", idCard: "360781198707130023" },
  { id: "JK046", name: "杨颖", role: "employee", idCard: "350500199201081029" },
  { id: "JK047", name: "肖锐", role: "employee", idCard: "210503199305052116" },
  { id: "JK048", name: "纪明霞", role: "leader", idCard: "210503199305052116" },
  {
    id: "JK049",
    name: "雷婷婷",
    role: "employee",
    idCard: "370983198912104962",
  },
  {
    id: "JK050",
    name: "张洋洋",
    role: "employee",
    idCard: "130929198707075127",
  },
  {
    id: "JK051",
    name: "陈泉玮",
    role: "employee",
    idCard: "370284199612026723",
  },
  {
    id: "JK052",
    name: "冯小凡",
    role: "employee",
    idCard: "370686199112090424",
  },
  { id: "JK053", name: "冷霜", role: "employee", idCard: "370785199406200704" },
  { id: "JK054", name: "丁鑫", role: "employee", idCard: "370284199601160070" },
  {
    id: "JK055",
    name: "张祥舟",
    role: "employee",
    idCard: "370284199012140418",
  },
];

export const kaitouPersonnel = [
  { id: "KT001", name: "周晓彬", role: "leader", idCard: "37040419810302007X" },
  { id: "KT002", name: "陆剑飞", role: "leader", idCard: "62010219820601621X" },
  {
    id: "KT003",
    name: "薛德晓",
    role: "employee",
    idCard: "370211197811102031",
  },
  {
    id: "KT004",
    name: "张龙龙",
    role: "employee",
    idCard: "142202198807062871",
  },
  {
    id: "KT005",
    name: "唐国彬",
    role: "employee",
    idCard: "35032119960102733X",
  },
  {
    id: "KT006",
    name: "杨仕玉",
    role: "employee",
    idCard: "372324198410156470",
  },
  { id: "KT007", name: "刘娜", role: "employee", idCard: "370211198411020023" },
  { id: "KT008", name: "王珉", role: "employee", idCard: "370202198802134929" },
  { id: "KT009", name: "初凯", role: "employee", idCard: "370682199108081642" },
  {
    id: "KT010",
    name: "段启愚",
    role: "employee",
    idCard: "140203200002057623",
  },
  { id: "KT011", name: "高青", role: "employee", idCard: "370211199001040018" },
  { id: "KT012", name: "纪蕾", role: "employee", idCard: "370211198504170020" },
  { id: "KT014", name: "王杰", role: "employee", idCard: "370284199411224336" },
  {
    id: "KT015",
    name: "杨龙泉",
    role: "employee",
    idCard: "370211198703281516",
  },
  {
    id: "KT016",
    name: "迟浩元",
    role: "employee",
    idCard: "370284199607066018",
  },
  {
    id: "KT017",
    name: "刘伟玉",
    role: "employee",
    idCard: "371082199507282124",
  },
  {
    id: "KT018",
    name: "陈雨田",
    role: "employee",
    idCard: "370284199901060020",
  },
  { id: "KT019", name: "高洋", role: "employee", idCard: "370783199812223319" },
  { id: "KT020", name: "韩春", role: "employee", idCard: "370306199404030521" },
  {
    id: "KT021",
    name: "毛璐杰",
    role: "employee",
    idCard: "371121200012202514",
  },
  {
    id: "KT022",
    name: "杜嘉祎",
    role: "employee",
    idCard: "370502199412293634",
  },
  {
    id: "KT023",
    name: "臧梦娇",
    role: "employee",
    idCard: "370211198810020549",
  },
];

export const functionalPersonnel = [
  { id: "FN001", name: "郑效明", role: "leader", idCard: "37078519860919491X" },
  { id: "FN002", name: "敬志伟", role: "leader", idCard: "37078319870718419X" },
  { id: "FN003", name: "陈立群", role: "leader", idCard: "370822197806012017" },
  { id: "FN004", name: "纪明霞", role: "leader", idCard: "210503199305052116" },
  { id: "FN005", name: "贾松涛", role: "leader", idCard: "210211197704285819" },
];
