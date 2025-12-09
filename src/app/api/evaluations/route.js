import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const department = searchParams.get("department");
    const personnelId = searchParams.get("personnelId");
    const stats = searchParams.get("stats");

    // 如果请求统计数据
    if (stats === "true") {
      return await getStatistics(department);
    }

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

// 获取统计数据的函数
async function getStatistics(department) {
  try {
    let query = supabase.from("evaluations").select("*");

    if (department) {
      query = query.eq("department", department);
    }

    const { data, error } = await query.order("timestamp", {
      ascending: false,
    });

    if (error) {
      console.error("获取统计数据失败:", error);
      return NextResponse.json(
        { error: "获取统计数据失败", details: error.message },
        { status: 500 }
      );
    }

    // 统计数据
    const stats = {
      totalEvaluations: data?.length || 0,
      departments: {},
      users: {},
      personnel: {},
      roles: {
        leader: { count: 0, evaluations: [] },
        employee: { count: 0, evaluations: [] },
      },
    };

    // 处理每条评价记录
    data?.forEach((evaluation) => {
      const dept = evaluation.department;
      const userId = evaluation.user_id;
      const personnelId = evaluation.personnel_id;
      const role = evaluation.role || "employee";

      // 按部门统计
      if (!stats.departments[dept]) {
        stats.departments[dept] = {
          count: 0,
          averageScore: 0,
          totalScore: 0,
          evaluations: [],
        };
      }
      stats.departments[dept].count++;
      stats.departments[dept].totalScore += evaluation.total_score;
      stats.departments[dept].evaluations.push(evaluation);

      // 按用户统计
      if (!stats.users[userId]) {
        stats.users[userId] = {
          count: 0,
          role: role,
          department: dept,
          evaluations: [],
        };
      }
      stats.users[userId].count++;
      stats.users[userId].evaluations.push(evaluation);

      // 按被评价人员统计
      if (!stats.personnel[personnelId]) {
        stats.personnel[personnelId] = {
          count: 0,
          totalScore: 0,
          averageScore: 0,
          evaluations: [],
        };
      }
      stats.personnel[personnelId].count++;
      stats.personnel[personnelId].totalScore += evaluation.total_score;
      stats.personnel[personnelId].evaluations.push(evaluation);

      // 按角色统计
      if (stats.roles[role]) {
        stats.roles[role].count++;
        stats.roles[role].evaluations.push(evaluation);
      }
    });

    // 计算平均分
    Object.keys(stats.departments).forEach((dept) => {
      const deptStats = stats.departments[dept];
      deptStats.averageScore =
        deptStats.count > 0
          ? (deptStats.totalScore / deptStats.count).toFixed(1)
          : 0;
    });

    Object.keys(stats.personnel).forEach((personId) => {
      const personStats = stats.personnel[personId];
      personStats.averageScore =
        personStats.count > 0
          ? (personStats.totalScore / personStats.count).toFixed(1)
          : 0;
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("统计数据 API 错误:", err);
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
