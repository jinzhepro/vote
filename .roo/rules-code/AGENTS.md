# AGENTS.md - Code Mode

This file provides guidance to agents when working with code in this repository.

## 项目特定编码规则

### 数据存储模式

- **必须使用本地存储优先策略**：所有评价数据首先保存在 localStorage 中，使用 `saveEvaluationToLocal()` 函数
- **批量提交机制**：完成所有评价后使用 `submitAllLocalEvaluations()` 一次性提交到服务器
- **禁止直接 API 调用**：评价过程中不得直接调用服务器 API，必须通过本地存储中转

### 人员数据处理

- **硬编码数据源**：所有人员数据必须从 `src/data/personnelData.js` 获取，禁止从 API 获取
- **部门特定逻辑**：职能部门用户需要评价多个部门，使用 `completedDepartments` 数组跟踪进度
- **身份验证流程**：必须使用 `generateEncryptedUserId()` 生成用户 ID，存储在 localStorage

### 等级分布验证

- **强制验证**：经控贸易和开投贸易部门提交前必须调用 `validateGradeDistribution()` 验证
- **分布要求**：
  - 经控贸易：A≤11 人，B=23-26 人，C=18-21 人，D+E=3-6 人
  - 开投贸易：A≤4 人，B=9-11 人，C=6-8 人，D+E=1-3 人
  - 职能部门：无等级分布要求
- **验证失败处理**：必须显示详细错误信息和调整建议，使用 `getGradeDistributionSuggestions()`

### 组件开发规范

- **客户端组件**：所有评价相关组件必须使用 `"use client"` 指令
- **状态管理**：使用 `useState` 管理表单状态，`useEffect` 处理副作用
- **本地存储集成**：必须实现 `loadEvaluationsFromLocal()` 和 `saveEvaluationToLocal()` 方法
- **错误处理**：所有 localStorage 操作必须包含 try-catch 错误处理

### API 集成规则

- **用户评价 API**：使用 `/api/user-evaluations` 端点进行批量提交
- **数据格式**：提交数据必须包含 `userId`、`userName`、`userRole`、`evaluations` 对象
- **错误处理**：API 调用必须包含完整的错误处理和用户反馈

### 关键函数使用

- `getPersonnelByDepartment()` - 获取部门人员列表
- `validateGradeDistribution()` - 验证等级分布
- `getScoreGrade()` - 计算评价等级
- `generateEncryptedUserId()` - 生成加密用户 ID
- `saveEvaluationToLocal()` - 保存评价到本地存储

### 禁止操作

- 禁止绕过本地存储直接提交评价数据
- 禁止修改硬编码的人员数据结构
- 禁止在等级分布验证失败时允许提交
- 禁止在评价过程中清空其他部门的评价数据
