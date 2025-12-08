import {
  getAllEmployees,
  createEmployee,
  getAllDepartments,
} from "@/lib/staffUtils";
import { initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    // 确保数据库已初始化
    await initializeDatabase();

    const employees = await getAllEmployees();
    const departments = await getAllDepartments();

    return Response.json({
      employees,
      departments,
    });
  } catch (error) {
    console.error("获取人员数据失败:", error);
    return Response.json({ error: "获取人员数据失败" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, department_id, position, email, phone } = body;

    if (!name || !department_id) {
      return Response.json({ error: "姓名和部门为必填项" }, { status: 400 });
    }

    const newEmployee = await createEmployee({
      name,
      department_id: parseInt(department_id),
      position,
      email,
      phone,
    });

    return Response.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("创建人员失败:", error);
    return Response.json({ error: "创建人员失败" }, { status: 500 });
  }
}
