import {
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "@/lib/staffUtils";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const employee = await getEmployeeById(id);

    if (!employee) {
      return Response.json({ error: "人员不存在" }, { status: 404 });
    }

    return Response.json(employee);
  } catch (error) {
    console.error("获取人员信息失败:", error);
    return Response.json({ error: "获取人员信息失败" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, department_id, position, email, phone } = body;

    if (!name || !department_id) {
      return Response.json({ error: "姓名和部门为必填项" }, { status: 400 });
    }

    const updatedEmployee = await updateEmployee(id, {
      name,
      department_id: parseInt(department_id),
      position,
      email,
      phone,
    });

    if (!updatedEmployee) {
      return Response.json({ error: "人员不存在" }, { status: 404 });
    }

    return Response.json(updatedEmployee);
  } catch (error) {
    console.error("更新人员失败:", error);
    return Response.json({ error: "更新人员失败" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const deletedEmployee = await deleteEmployee(id);

    if (!deletedEmployee) {
      return Response.json({ error: "人员不存在" }, { status: 404 });
    }

    return Response.json({ message: "人员删除成功" });
  } catch (error) {
    console.error("删除人员失败:", error);
    return Response.json({ error: "删除人员失败" }, { status: 500 });
  }
}
