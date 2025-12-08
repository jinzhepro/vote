import sql from "./db.js";

// 部门相关操作
export async function getAllDepartments() {
  try {
    const departments = await sql`SELECT * FROM departments ORDER BY name`;
    return departments;
  } catch (error) {
    console.error("获取部门列表失败:", error);
    return [];
  }
}

export async function getDepartmentById(id) {
  try {
    const [department] = await sql`SELECT * FROM departments WHERE id = ${id}`;
    return department;
  } catch (error) {
    console.error("获取部门信息失败:", error);
    return null;
  }
}

// 人员相关操作
export async function getAllEmployees() {
  try {
    const employees = await sql`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY d.name, e.name
    `;
    return employees;
  } catch (error) {
    console.error("获取人员列表失败:", error);
    return [];
  }
}

export async function getEmployeeById(id) {
  try {
    const [employee] = await sql`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ${id}
    `;
    return employee;
  } catch (error) {
    console.error("获取人员信息失败:", error);
    return null;
  }
}

export async function createEmployee(employeeData) {
  try {
    const { name, department_id, position, email, phone } = employeeData;
    const [newEmployee] = await sql`
      INSERT INTO employees (name, department_id, position, email, phone)
      VALUES (${name}, ${department_id}, ${position}, ${email}, ${phone})
      RETURNING *
    `;
    return newEmployee;
  } catch (error) {
    console.error("创建人员失败:", error);
    throw error;
  }
}

export async function updateEmployee(id, employeeData) {
  try {
    const { name, department_id, position, email, phone } = employeeData;
    const [updatedEmployee] = await sql`
      UPDATE employees 
      SET name = ${name}, 
          department_id = ${department_id}, 
          position = ${position}, 
          email = ${email}, 
          phone = ${phone},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return updatedEmployee;
  } catch (error) {
    console.error("更新人员失败:", error);
    throw error;
  }
}

export async function deleteEmployee(id) {
  try {
    const [deletedEmployee] = await sql`
      DELETE FROM employees WHERE id = ${id} RETURNING *
    `;
    return deletedEmployee;
  } catch (error) {
    console.error("删除人员失败:", error);
    throw error;
  }
}

export async function getEmployeesByDepartment(departmentId) {
  try {
    const employees = await sql`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.department_id = ${departmentId}
      ORDER BY e.name
    `;
    return employees;
  } catch (error) {
    console.error("获取部门人员失败:", error);
    return [];
  }
}

export async function searchEmployees(query) {
  try {
    const employees = await sql`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.name ILIKE ${"%" + query + "%"} 
         OR e.position ILIKE ${"%" + query + "%"}
         OR e.email ILIKE ${"%" + query + "%"}
         OR d.name ILIKE ${"%" + query + "%"}
      ORDER BY d.name, e.name
    `;
    return employees;
  } catch (error) {
    console.error("搜索人员失败:", error);
    return [];
  }
}

// 批量初始化人员数据
export async function initializeEmployees() {
  try {
    // 导入初始化数据
    const { JINGKONG_EMPLOYEES, KAITOU_EMPLOYEES, validateInitData } =
      await import("./initData.js");

    // 验证数据
    const validation = validateInitData();
    console.log("📊 开始初始化人员数据:", validation);

    // 获取部门ID
    const departments = await getAllDepartments();
    const jingkongDept = departments.find((d) => d.name === "经控贸易");
    const kaitouDept = departments.find((d) => d.name === "开投贸易");

    if (!jingkongDept || !kaitouDept) {
      throw new Error("部门未找到，请先初始化部门数据");
    }

    let insertedCount = 0;
    let skippedCount = 0;

    // 批量插入经控贸易人员
    console.log(`🔄 正在插入经控贸易人员 (${JINGKONG_EMPLOYEES.length}人)...`);
    for (const name of JINGKONG_EMPLOYEES) {
      try {
        const result = await sql`
          INSERT INTO employees (name, department_id, position)
          VALUES (${name}, ${jingkongDept.id}, '员工')
          ON CONFLICT DO NOTHING
          RETURNING id
        `;
        if (result.length > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ 插入人员失败: ${name}`, error.message);
      }
    }

    // 批量插入开投贸易人员
    console.log(`🔄 正在插入开投贸易人员 (${KAITOU_EMPLOYEES.length}人)...`);
    for (const name of KAITOU_EMPLOYEES) {
      try {
        const result = await sql`
          INSERT INTO employees (name, department_id, position)
          VALUES (${name}, ${kaitouDept.id}, '员工')
          ON CONFLICT DO NOTHING
          RETURNING id
        `;
        if (result.length > 0) {
          insertedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.warn(`⚠️ 插入人员失败: ${name}`, error.message);
      }
    }

    console.log(
      `✅ 人员数据初始化完成: 新增${insertedCount}人, 跳过${skippedCount}人`
    );
    return true;
  } catch (error) {
    console.error("❌ 人员数据初始化失败:", error);
    return false;
  }
}
