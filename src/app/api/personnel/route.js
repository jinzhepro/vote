import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    let query = supabase.from("personnel").select("*");

    // 如果指定了部门，添加过滤条件
    if (department) {
      query = query.eq("department", department);
    }

    const { data, error } = await query
      .order("department", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("获取人员数据失败:", error);
      return NextResponse.json(
        { error: "获取人员数据失败", details: error.message },
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
    if (!body.id || !body.name || !body.department) {
      return NextResponse.json(
        { error: "缺少必需字段: id, name, department" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("personnel")
      .insert([
        {
          id: body.id,
          name: body.name,
          department: body.department,
          department_name: body.department_name || body.department,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("添加人员失败:", error);
      return NextResponse.json(
        { error: "添加人员失败", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: "人员添加成功",
    });
  } catch (err) {
    console.error("API 错误:", err);
    return NextResponse.json(
      { error: "服务器内部错误", details: err.message },
      { status: 500 }
    );
  }
}
