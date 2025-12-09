import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const department = searchParams.get("department");
    const personnelId = searchParams.get("personnelId");

    let query = supabase.from("evaluations").select("*");

    // 添加过滤条件
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (department) {
      query = query.eq("department", department);
    }
    if (personnelId) {
      query = query.eq("personnel_id", personnelId);
    }

    const { data, error } = await query.order("timestamp", {
      ascending: false,
    });

    if (error) {
      console.error("获取评价数据失败:", error);
      return NextResponse.json(
        { error: "获取评价数据失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (err) {
    console.error("API 错误:", err);
    return NextResponse.json(
      { error: "服务器内部错误", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // 验证必需字段
    if (
      !body.userId ||
      !body.personnelId ||
      !body.department ||
      !body.scores ||
      !body.totalScore
    ) {
      return NextResponse.json(
        {
          error:
            "缺少必需字段: userId, personnelId, department, scores, totalScore",
        },
        { status: 400 }
      );
    }

    // 检查是否已经评价过
    const { data: existingEvaluation } = await supabase
      .from("evaluations")
      .select("*")
      .eq("user_id", body.userId)
      .eq("personnel_id", body.personnelId)
      .single();

    let result;
    if (existingEvaluation) {
      // 更新现有评价
      const { data, error } = await supabase
        .from("evaluations")
        .update({
          scores: body.scores,
          total_score: body.totalScore,
          comments: body.comments || null,
          timestamp: new Date().toISOString(),
        })
        .eq("id", existingEvaluation.id)
        .select();

      if (error) {
        console.error("更新评价失败:", error);
        return NextResponse.json(
          { error: "更新评价失败", details: error.message },
          { status: 500 }
        );
      }
      result = data[0];
    } else {
      // 创建新评价
      const { data, error } = await supabase
        .from("evaluations")
        .insert([
          {
            user_id: body.userId,
            personnel_id: body.personnelId,
            department: body.department,
            role: body.role || "employee",
            scores: body.scores,
            total_score: body.totalScore,
            comments: body.comments || null,
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("创建评价失败:", error);
        return NextResponse.json(
          { error: "创建评价失败", details: error.message },
          { status: 500 }
        );
      }
      result = data[0];
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingEvaluation ? "评价更新成功" : "评价提交成功",
    });
  } catch (err) {
    console.error("API 错误:", err);
    return NextResponse.json(
      { error: "服务器内部错误", details: err.message },
      { status: 500 }
    );
  }
}
