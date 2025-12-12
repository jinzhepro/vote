import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const department = searchParams.get("department");
    const role = searchParams.get("role");
    const stats = searchParams.get("stats");

    // 如果请求统计数据
    if (stats === "true") {
      return await getUserStatistics(department);
    }

    let query = supabase.from("user_evaluations").select("*");

    // 添加过滤条件
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (department) {
      query = query.eq("user_department", department);
    }
    if (role) {
      query = query.eq("user_role", role);
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("获取用户评价数据失败:", error);
      return NextResponse.json(
        { error: "获取用户评价数据失败", details: error.message },
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

// 获取用户统计数据的函数
async function getUserStatistics(department) {
  try {
    let query = supabase.from("user_evaluations").select("*");

    if (department) {
      query = query.eq("user_department", department);
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("获取用户统计数据失败:", error);
      return NextResponse.json(
        { error: "获取用户统计数据失败", details: error.message },
        { status: 500 }
      );
    }

    // 统计数据
    const stats = {
      totalUsers: data?.length || 0,
      departments: {},
      users: {},
      personnel: {},
      roles: {
        leader: { count: 0, evaluations: [] },
        employee: { count: 0, evaluations: [] },
        functional: { count: 0, evaluations: [] },
      },
      submittedUsers: 0,
      totalEvaluations: 0,
    };

    // 处理每个用户的评价数据
    data?.forEach((userEvaluation) => {
      const dept = userEvaluation.user_department;
      const userId = userEvaluation.user_id;
      const role = userEvaluation.user_role;

      // 按部门统计
      if (!stats.departments[dept]) {
        stats.departments[dept] = {
          count: 0,
          submittedCount: 0,
          totalEvaluations: 0,
          users: [],
        };
      }
      stats.departments[dept].count++;
      stats.departments[dept].totalEvaluations +=
        userEvaluation.total_evaluations;
      if (userEvaluation.is_submitted) {
        stats.departments[dept].submittedCount++;
      }
      stats.departments[dept].users.push(userEvaluation);

      // 按用户角色统计
      if (stats.roles[role]) {
        stats.roles[role].count++;
        stats.roles[role].evaluations.push(userEvaluation);
      }

      // 按用户统计
      if (!stats.users[userId]) {
        stats.users[userId] = {
          userName: userEvaluation.user_name,
          role: role,
          department: dept,
          totalEvaluations: userEvaluation.total_evaluations,
          completedDepartments: userEvaluation.completed_departments || [],
          isSubmitted: userEvaluation.is_submitted,
          evaluations: userEvaluation.evaluations,
          updatedAt: userEvaluation.updated_at,
        };
      }

      // 统计提交用户数
      if (userEvaluation.is_submitted) {
        stats.submittedUsers++;
      }

      // 统计总评价数
      stats.totalEvaluations += userEvaluation.total_evaluations;

      // 处理每个被评价人员的统计
      if (
        userEvaluation.evaluations &&
        typeof userEvaluation.evaluations === "object"
      ) {
        Object.entries(userEvaluation.evaluations).forEach(
          ([personnelId, evaluation]) => {
            if (!stats.personnel[personnelId]) {
              stats.personnel[personnelId] = {
                count: 0,
                totalScore: 0,
                averageScore: 0,
                evaluations: [],
              };
            }
            stats.personnel[personnelId].count++;
            stats.personnel[personnelId].totalScore +=
              evaluation.totalScore || 0;
            stats.personnel[personnelId].evaluations.push({
              userId: userId,
              userName: userEvaluation.user_name,
              userRole: role,
              userDepartment: dept,
              ...evaluation,
            });
          }
        );
      }
    });

    // 计算平均分
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
    console.error("用户统计数据 API 错误:", err);
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
    if (!body.userId || !body.userName || !body.userDepartment) {
      return NextResponse.json(
        {
          error: "缺少必需字段: userId, userName, userDepartment",
        },
        { status: 400 }
      );
    }

    // 检查是否已存在该用户的评价记录
    const { data: existingUser } = await supabase
      .from("user_evaluations")
      .select("*")
      .eq("user_id", body.userId)
      .single();

    let result;
    if (existingUser) {
      // 合并现有用户评价记录
      const existingEvaluations = existingUser.evaluations || {};
      const newEvaluations = body.evaluations || {};

      // 合并evaluations，新数据会覆盖相同personnel_id的数据
      const mergedEvaluations = {
        ...existingEvaluations,
        ...newEvaluations,
      };

      // 合并completed_departments
      const existingCompletedDepts = existingUser.completed_departments || [];
      const newCompletedDepts = body.completedDepartments || [];
      const mergedCompletedDepts = [
        ...new Set([...existingCompletedDepts, ...newCompletedDepts]),
      ];

      const { data, error } = await supabase
        .from("user_evaluations")
        .update({
          user_name: body.userName,
          user_role: body.userRole || "employee",
          user_department: body.userDepartment,
          evaluations: mergedEvaluations,
          completed_departments: mergedCompletedDepts,
          total_evaluations: Object.keys(mergedEvaluations).length,
          is_submitted: body.isSubmitted || false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
        .select();

      if (error) {
        console.error("更新用户评价失败:", error);
        return NextResponse.json(
          { error: "更新用户评价失败", details: error.message },
          { status: 500 }
        );
      }
      result = data[0];
    } else {
      // 创建新的用户评价记录
      const { data, error } = await supabase
        .from("user_evaluations")
        .insert([
          {
            user_id: body.userId,
            user_name: body.userName,
            user_role: body.userRole || "employee",
            user_department: body.userDepartment,
            evaluations: body.evaluations || {},
            completed_departments: body.completedDepartments || [],
            total_evaluations: body.totalEvaluations || 0,
            is_submitted: body.isSubmitted || false,
          },
        ])
        .select();

      if (error) {
        console.error("创建用户评价失败:", error);
        return NextResponse.json(
          { error: "创建用户评价失败", details: error.message },
          { status: 500 }
        );
      }
      result = data[0];
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingUser ? "用户评价更新成功" : "用户评价创建成功",
    });
  } catch (err) {
    console.error("API 错误:", err);
    return NextResponse.json(
      { error: "服务器内部错误", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "缺少必需参数: userId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_evaluations")
      .delete()
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("删除用户评价失败:", error);
      return NextResponse.json(
        { error: "删除用户评价失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "用户评价删除成功",
    });
  } catch (err) {
    console.error("API 错误:", err);
    return NextResponse.json(
      { error: "服务器内部错误", details: err.message },
      { status: 500 }
    );
  }
}
