// 完整人员名单导入脚本
const personnelData = {
  经控贸易: [
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
  ],
  开投贸易: [
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
  ],
  开投贸易派遣: ["陈雨田", "高洋", "毛璐杰", "杜嘉祎", "臧梦娇"],
};

// 转换为API需要的格式
const personnelList = [];
Object.entries(personnelData).forEach(([type, names]) => {
  names.forEach((name) => {
    personnelList.push({
      name: name.trim(),
      department: type,
      type: type,
    });
  });
});

console.log("准备导入的人员数据:");
console.log(JSON.stringify(personnelList, null, 2));

// 可以使用以下curl命令导入:
console.log("\n导入命令:");
console.log(
  `curl -X PUT -H "Content-Type: application/json" -d '${JSON.stringify({
    personnelList,
  })}' http://localhost:3000/api/personnel`
);
