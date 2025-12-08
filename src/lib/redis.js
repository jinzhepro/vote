import { createClient } from "redis";

// 创建Redis客户端
const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

// 连接错误处理
client.on("error", (err) => {
  console.error("Redis连接错误:", err);
});

// 连接成功处理
client.on("connect", () => {
  console.log("Redis连接成功");
});

// 连接Redis
export async function connectRedis() {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error("Redis连接失败:", error);
    throw error;
  }
}

// 获取Redis客户端
export function getRedisClient() {
  return client;
}

// Redis操作封装
export const redis = {
  // 设置键值对
  async set(key, value, expireInSeconds) {
    const client = await connectRedis();
    if (expireInSeconds) {
      return await client.setEx(key, expireInSeconds, JSON.stringify(value));
    }
    return await client.set(key, JSON.stringify(value));
  },

  // 获取值
  async get(key) {
    const client = await connectRedis();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },

  // 删除键
  async del(key) {
    const client = await connectRedis();
    return await client.del(key);
  },

  // 检查键是否存在
  async exists(key) {
    const client = await connectRedis();
    return await client.exists(key);
  },

  // 设置过期时间
  async expire(key, seconds) {
    const client = await connectRedis();
    return await client.expire(key, seconds);
  },

  // 获取所有匹配的键
  async keys(pattern) {
    const client = await connectRedis();
    return await client.keys(pattern);
  },

  // 哈希操作
  async hset(key, field, value) {
    const client = await connectRedis();
    return await client.hSet(key, field, JSON.stringify(value));
  },

  async hget(key, field) {
    const client = await connectRedis();
    const value = await client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  },

  async hgetall(key) {
    const client = await connectRedis();
    const hash = await client.hGetAll(key);
    const result = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    return result;
  },

  // 列表操作
  async lpush(key, ...values) {
    const client = await connectRedis();
    return await client.lPush(
      key,
      values.map((v) => JSON.stringify(v))
    );
  },

  async rpush(key, ...values) {
    const client = await connectRedis();
    return await client.rPush(
      key,
      values.map((v) => JSON.stringify(v))
    );
  },

  async lrange(key, start, stop) {
    const client = await connectRedis();
    const values = await client.lRange(key, start, stop);
    return values.map((v) => JSON.parse(v));
  },

  // 集合操作
  async sadd(key, ...members) {
    const client = await connectRedis();
    return await client.sAdd(
      key,
      members.map((m) => JSON.stringify(m))
    );
  },

  async smembers(key) {
    const client = await connectRedis();
    const members = await client.sMembers(key);
    return members.map((m) => JSON.parse(m));
  },

  // 关闭连接
  async quit() {
    if (client.isOpen) {
      await client.quit();
    }
  },
};

export default redis;
