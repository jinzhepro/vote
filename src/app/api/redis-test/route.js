import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// 测试Redis连接
export async function GET() {
  try {
    // 测试基本连接
    const testKey = "test:connection";
    const testValue = {
      message: "Redis连接测试成功",
      timestamp: new Date().toISOString(),
    };

    // 设置测试数据
    await redis.set(testKey, testValue, 60); // 60秒过期

    // 获取测试数据
    const retrievedValue = await redis.get(testKey);

    // 测试计数器
    await redis.set("test:counter", 0);
    await redis.set("test:counter", 1);

    const counter = await redis.get("test:counter");

    // 清理测试数据
    await redis.del(testKey);
    await redis.del("test:counter");

    return NextResponse.json({
      success: true,
      message: "Redis连接测试成功",
      data: {
        testValue: retrievedValue,
        counter: counter,
        redisInfo: {
          connected: true,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Redis连接测试失败:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Redis连接测试失败",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 测试Redis数据操作
export async function POST(request) {
  try {
    const { operation, key, value } = await request.json();

    let result;

    switch (operation) {
      case "set":
        result = await redis.set(key, value);
        break;
      case "get":
        result = await redis.get(key);
        break;
      case "del":
        result = await redis.del(key);
        break;
      case "exists":
        result = await redis.exists(key);
        break;
      case "keys":
        result = await redis.keys(value || "*");
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            message: "不支持的操作",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      result,
    });
  } catch (error) {
    console.error("Redis操作失败:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Redis操作失败",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
