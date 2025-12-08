import { NextResponse } from "next/server";
import { redis, connectRedis } from "@/lib/redis";

// 获取单个人员
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const person = await redis.hget("personnel", id);

    if (!person) {
      return NextResponse.json(
        { success: false, error: "人员不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, person });
  } catch (error) {
    console.error("获取人员失败:", error);
    return NextResponse.json(
      { success: false, error: "获取人员失败" },
      { status: 500 }
    );
  }
}

// 更新人员信息
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, department, type } = await request.json();

    // 获取现有人员信息
    const existingPerson = await redis.hget("personnel", id);
    if (!existingPerson) {
      return NextResponse.json(
        { success: false, error: "人员不存在" },
        { status: 404 }
      );
    }

    const updatedPerson = {
      ...existingPerson,
      name: name || existingPerson.name,
      department: department || existingPerson.department,
      type: type || existingPerson.type,
      updatedAt: new Date().toISOString(),
    };

    // 更新主存储
    await redis.hset("personnel", id, updatedPerson);

    // 如果部门发生变化，更新部门分类
    if (department && department !== existingPerson.department) {
      await redis.hget(`personnel:${existingPerson.department}`, id); // 从旧部门删除
      await redis.hset(`personnel:${department}`, id, updatedPerson); // 添加到新部门
    }

    // 如果类型发生变化，更新类型分类
    if (type && type !== existingPerson.type) {
      await redis.hget(`personnel:type:${existingPerson.type}`, id); // 从旧类型删除
      await redis.hset(`personnel:type:${type}`, id, updatedPerson); // 添加到新类型
    }

    return NextResponse.json({
      success: true,
      message: "人员信息更新成功",
      person: updatedPerson,
    });
  } catch (error) {
    console.error("更新人员失败:", error);
    return NextResponse.json(
      { success: false, error: "更新人员失败" },
      { status: 500 }
    );
  }
}

// 删除人员
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // 获取人员信息
    const person = await redis.hget("personnel", id);
    if (!person) {
      return NextResponse.json(
        { success: false, error: "人员不存在" },
        { status: 404 }
      );
    }

    // 从主存储删除
    const client = await redis.connectRedis();
    await client.hDel("personnel", id);

    // 从部门分类删除
    await client.hDel(`personnel:${person.department}`, id);

    // 从类型分类删除
    await client.hDel(`personnel:type:${person.type}`, id);

    return NextResponse.json({
      success: true,
      message: "人员删除成功",
    });
  } catch (error) {
    console.error("删除人员失败:", error);
    return NextResponse.json(
      { success: false, error: "删除人员失败" },
      { status: 500 }
    );
  }
}
