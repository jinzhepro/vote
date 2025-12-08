import { NextResponse } from "next/server";
import { redis, connectRedis } from "@/lib/redis";

// 获取所有人员
export async function GET() {
  try {
    const personnel = await redis.hgetall("personnel");
    return NextResponse.json({ success: true, personnel });
  } catch (error) {
    console.error("获取人员失败:", error);
    return NextResponse.json(
      { success: false, error: "获取人员失败" },
      { status: 500 }
    );
  }
}

// 添加人员
export async function POST(request) {
  try {
    const { name, department, type } = await request.json();

    if (!name || !department || !type) {
      return NextResponse.json(
        { success: false, error: "请提供完整的人员信息" },
        { status: 400 }
      );
    }

    // 生成唯一ID
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const personData = {
      id,
      name,
      department,
      type,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 存储到Redis
    await redis.hset("personnel", id, personData);

    // 按部门分类存储
    await redis.hset(`personnel:${department}`, id, personData);

    // 按类型分类存储
    await redis.hset(`personnel:type:${type}`, id, personData);

    return NextResponse.json({
      success: true,
      message: "人员添加成功",
      person: personData,
    });
  } catch (error) {
    console.error("添加人员失败:", error);
    return NextResponse.json(
      { success: false, error: "添加人员失败" },
      { status: 500 }
    );
  }
}

// 批量导入人员
export async function PUT(request) {
  try {
    const { personnelList } = await request.json();

    if (!personnelList || !Array.isArray(personnelList)) {
      return NextResponse.json(
        { success: false, error: "请提供有效的人员列表" },
        { status: 400 }
      );
    }

    const results = [];
    const timestamp = new Date().toISOString();

    for (const person of personnelList) {
      if (!person.name || !person.department || !person.type) {
        results.push({
          success: false,
          name: person.name,
          error: "信息不完整",
        });
        continue;
      }

      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const personData = {
        id,
        name: person.name,
        department: person.department,
        type: person.type,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // 存储到Redis
      await redis.hset("personnel", id, personData);
      await redis.hset(`personnel:${person.department}`, id, personData);
      await redis.hset(`personnel:type:${person.type}`, id, personData);

      results.push({ success: true, name: person.name, id });
    }

    return NextResponse.json({
      success: true,
      message: "批量导入完成",
      results,
    });
  } catch (error) {
    console.error("批量导入失败:", error);
    return NextResponse.json(
      { success: false, error: "批量导入失败" },
      { status: 500 }
    );
  }
}

// 删除所有人员
export async function DELETE() {
  try {
    // 获取所有人员键
    const allKeys = await redis.keys("personnel*");

    // 删除所有相关键
    for (const key of allKeys) {
      await redis.del(key);
    }

    return NextResponse.json({
      success: true,
      message: "所有人员数据已删除",
    });
  } catch (error) {
    console.error("删除人员失败:", error);
    return NextResponse.json(
      { success: false, error: "删除人员失败" },
      { status: 500 }
    );
  }
}
