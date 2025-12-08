import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// 获取投票结果
export async function GET() {
  try {
    const votes = await redis.hgetall("votes");
    return NextResponse.json({ success: true, votes });
  } catch (error) {
    console.error("获取投票失败:", error);
    return NextResponse.json(
      { success: false, error: "获取投票失败" },
      { status: 500 }
    );
  }
}

// 提交投票
export async function POST(request) {
  try {
    const { option } = await request.json();

    if (!option) {
      return NextResponse.json(
        { success: false, error: "请选择一个选项" },
        { status: 400 }
      );
    }

    // 获取当前票数
    const currentVotes = (await redis.hget("votes", option)) || 0;

    // 增加票数
    await redis.hset("votes", option, currentVotes + 1);

    // 记录投票历史（可选）
    const timestamp = new Date().toISOString();
    await redis.lpush("vote_history", {
      option,
      timestamp,
      ip: request.ip || "unknown",
    });

    // 获取更新后的投票结果
    const updatedVotes = await redis.hgetall("votes");

    return NextResponse.json({
      success: true,
      message: "投票成功",
      votes: updatedVotes,
    });
  } catch (error) {
    console.error("投票失败:", error);
    return NextResponse.json(
      { success: false, error: "投票失败" },
      { status: 500 }
    );
  }
}

// 重置投票
export async function DELETE() {
  try {
    await redis.del("votes");
    await redis.del("vote_history");
    return NextResponse.json({
      success: true,
      message: "投票已重置",
    });
  } catch (error) {
    console.error("重置投票失败:", error);
    return NextResponse.json(
      { success: false, error: "重置投票失败" },
      { status: 500 }
    );
  }
}
