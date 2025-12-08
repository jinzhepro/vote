// 简单的API测试脚本
// 在浏览器控制台中运行此脚本来测试人员管理API

async function testStaffAPI() {
  console.log("🧪 开始测试人员管理API...");

  try {
    // 1. 测试初始化状态
    console.log("\n📋 1. 检查初始化状态...");
    const initStatus = await fetch("/api/init").then((r) => r.json());
    console.log("初始化状态:", initStatus);

    // 2. 如果未初始化，执行初始化
    if (!initStatus.initialized) {
      console.log("\n🚀 2. 执行数据库初始化...");
      const initResult = await fetch("/api/init", { method: "POST" }).then(
        (r) => r.json()
      );
      console.log("初始化结果:", initResult);
    }

    // 3. 测试获取所有人员
    console.log("\n👥 3. 获取所有人员...");
    const staffData = await fetch("/api/staff").then((r) => r.json());
    console.log("人员数据:", {
      总人数: staffData.employees.length,
      部门数: staffData.departments.length,
      部门列表: staffData.departments.map((d) => d.name),
    });

    // 4. 测试获取部门列表
    console.log("\n🏢 4. 获取部门列表...");
    const departments = await fetch("/api/staff/departments").then((r) =>
      r.json()
    );
    console.log("部门列表:", departments);

    // 5. 测试添加新人员
    console.log("\n➕ 5. 添加测试人员...");
    const newEmployee = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "测试人员",
        department_id: departments[0].id,
        position: "测试职位",
        email: "test@example.com",
        phone: "13800138000",
      }),
    }).then((r) => r.json());
    console.log("新添加的人员:", newEmployee);

    // 6. 测试更新人员信息
    if (newEmployee.id) {
      console.log("\n✏️ 6. 更新人员信息...");
      const updatedEmployee = await fetch(`/api/staff/${newEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "测试人员（已更新）",
          department_id: departments[0].id,
          position: "高级测试职位",
          email: "updated@example.com",
          phone: "13900139000",
        }),
      }).then((r) => r.json());
      console.log("更新后的人员:", updatedEmployee);

      // 7. 测试删除人员
      console.log("\n🗑️ 7. 删除测试人员...");
      const deleteResult = await fetch(`/api/staff/${newEmployee.id}`, {
        method: "DELETE",
      }).then((r) => r.json());
      console.log("删除结果:", deleteResult);
    }

    // 8. 测试搜索功能
    console.log("\n🔍 8. 测试搜索功能...");
    const searchResults = await fetch("/api/staff/search?q=郑").then((r) =>
      r.json()
    );
    console.log('搜索"郑"的结果:', {
      找到人数: searchResults.length,
      前几个结果: searchResults.slice(0, 3),
    });

    console.log("\n✅ 所有测试完成！");
  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error);
  }
}

// 运行测试
testStaffAPI();
