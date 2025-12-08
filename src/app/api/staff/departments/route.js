import { getAllDepartments } from "@/lib/staffUtils";

export async function GET() {
  try {
    const departments = await getAllDepartments();
    return Response.json(departments);
  } catch (error) {
    console.error("获取部门列表失败:", error);
    return Response.json({ error: "获取部门列表失败" }, { status: 500 });
  }
}
