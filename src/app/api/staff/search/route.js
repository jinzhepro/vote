import { searchEmployees } from "@/lib/staffUtils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return Response.json([]);
    }

    const employees = await searchEmployees(query);
    return Response.json(employees);
  } catch (error) {
    console.error("搜索人员失败:", error);
    return Response.json({ error: "搜索人员失败" }, { status: 500 });
  }
}
