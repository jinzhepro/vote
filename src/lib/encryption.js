// 加密工具函数

// 简单的加密函数（基于姓名和部门生成加密的userid）
export const generateEncryptedUserId = (name, department) => {
  // 创建一个简单的哈希函数
  const createHash = (str) => {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  };

  // 根据部门确定前缀
  const getDepartmentPrefix = (dept) => {
    switch (dept) {
      case "functional":
        return "functional";
      case "jingkong":
        return "jingkong";
      case "kaitou":
        return "kaitou";
      default:
        return "user";
    }
  };

  // 生成基于姓名和部门的哈希（移除时间戳以确保相同输入产生相同输出）
  const nameHash = createHash(name);
  const deptHash = createHash(department);

  // 组合生成加密的userid（不包含时间戳）
  const prefix = getDepartmentPrefix(department);
  const combinedHash = createHash(`${name}_${department}`); // 组合哈希确保唯一性

  return `${prefix}_${combinedHash}`;
};

// 验证userid是否匹配给定的姓名和部门
export const validateUserId = (userId, name, department) => {
  if (!userId || !name || !department) return false;

  const prefix = userId.split("_")[0];
  const expectedPrefix =
    department === "functional"
      ? "functional"
      : department === "jingkong"
      ? "jingkong"
      : department === "kaitou"
      ? "kaitou"
      : "user";

  return prefix === expectedPrefix;
};
