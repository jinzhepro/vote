# AGENTS.md - Debug Mode

This file provides guidance to agents when working with code in this repository.

## 项目调试指南

### 本地存储调试

- **localStorage 检查**：使用浏览器开发者工具 > Application > Local Storage 检查评价数据
- **关键存储项**：
  - `userId` - 当前用户 ID
  - `localEvaluations` - 本地评价数据
  - `completedDepartments` - 职能部门已完成评价的部门列表
  - `functionalUserNames` - 职能部门用户姓名映射

### 评价数据结构

- **本地评价格式**：`localEvaluations[userId].evaluations[personId]`
- **评价数据包含**：`scores`、`totalScore`、`timestamp`、`department`、`role`
- **提交数据格式**：通过 `/api/user-evaluations` 批量提交

### 常见问题诊断

- **等级分布验证失败**：检查 `validateGradeDistribution()` 返回的详细信息
- **用户身份验证失败**：确认 `generateEncryptedUserId()` 生成的 ID 与存储的一致
- **评价数据丢失**：检查 localStorage 操作是否包含 try-catch 错误处理
- **API 提交失败**：检查网络连接和 Supabase 配置

### 调试工具

- **控制台日志**：关键操作都有 console.log 输出，包括用户 ID 生成、评价保存、提交状态
- **网络面板**：检查 API 请求和响应，特别是 `/api/user-evaluations` 端点
- **组件状态**：使用 React DevTools 检查组件状态和 props

### 环境变量检查

- **Supabase 配置**：确认 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_KEY` 正确设置
- **数据库连接**：使用 `npm run test:supabase` 测试连接

### 部门特定调试

- **经控贸易**：55 人，等级分布 A≤11, B=23-26, C=18-21, D+E=3-6
- **开投贸易**：23 人，等级分布 A≤4, B=9-11, C=6-8, D+E=1-3
- **职能部门**：5 人，无等级分布要求，需要评价多个部门，使用 `completedDepartments` 跟踪进度

### 性能监控

- **大量评价数据**：使用 `useMemo` 优化等级统计和验证计算
- **本地存储大小**：监控 localStorage 使用情况，避免超出浏览器限制
- **网络请求**：批量提交机制减少 API 调用次数
