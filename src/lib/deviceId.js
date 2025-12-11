// 设备ID管理工具

// 生成设备ID的函数
export const generateDeviceId = (isLeader = false, isFunctional = false) => {
  // 尝试从现有的存储中获取设备ID
  let deviceId = localStorage.getItem("userId");

  // 如果已经有userid，直接使用
  if (deviceId) {
    return deviceId;
  }

  // 检查当前存储的ID是否与请求的角色匹配
  const needsNewId =
    deviceId &&
    ((isLeader && !deviceId.startsWith("leader_")) ||
      (!isLeader && deviceId.startsWith("leader_")) ||
      (isFunctional && !deviceId.startsWith("functional_")) ||
      (!isFunctional && deviceId.startsWith("functional_")));

  if (!deviceId || needsNewId) {
    // 如果没有设备ID或角色不匹配，生成一个新的
    // 使用浏览器指纹信息生成更稳定的设备ID
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    const fingerprint = canvas.toDataURL();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);

    if (isFunctional) {
      deviceId = `functional_${timestamp}_${random}`;
    } else {
      deviceId = isLeader
        ? `leader_${timestamp}_${random}`
        : `device_${timestamp}_${random}`;
    }

    // 存储设备ID
    localStorage.setItem("userId", deviceId);
  }

  return deviceId;
};

// 获取设备ID的函数
export const getDeviceId = (isLeader = false, isFunctional = false) => {
  return generateDeviceId(isLeader, isFunctional);
};

// 重置设备ID的函数（用于测试或特殊情况）
export const resetDeviceId = (isLeader = false, isFunctional = false) => {
  localStorage.removeItem("userId");
  return generateDeviceId(isLeader, isFunctional);
};
