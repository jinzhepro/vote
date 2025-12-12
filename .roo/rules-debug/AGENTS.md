# 项目调试规则 (非显而易见部分)

## 本地存储调试

- 评价数据存储在 localStorage 的`localEvaluations`键中
- 用户 ID 存储在 localStorage 的`userId`键中
- 职能部门完成的部门列表存储在`completedDepartments`键中
- 使用`localStorage.getItem()`和`localStorage.setItem()`直接检查数据

## 数据流调试

- 评价数据先保存到本地，然后批量提交到服务器
- 检查`submitAllLocalEvaluations()`函数的返回值确认提交状态
- API 错误信息包含在响应的`error`和`details`字段中

## 常见调试位置

- 控制台查看评价数据：`console.log(JSON.parse(localStorage.getItem('localEvaluations')))`
- 检查用户身份验证：`console.log(localStorage.getItem('userId'))`
- 验证等级分布：在`src/data/evaluationCriteria.js`中的`validateGradeDistribution()`函数

## 网络请求调试

- API 路由位于`/api/evaluations`和`/api/personnel`
- 批量提交请求体包含`batch: true`和`evaluations`数组
- 检查 Supabase 连接状态：查看网络面板中的 API 请求

## 组件状态调试

- 评价组件状态：检查`evaluations`、`userEvaluations`和`votes`状态
- 人员列表状态：检查`personnel`和`filteredPersonnel`数组
- 加载状态：检查`loading`、`submitting`和`initialLoading`布尔值

## 错误处理调试

- 评价提交失败：检查等级分布验证结果
- 用户身份验证失败：检查姓名是否在人员数据中存在
- 数据同步问题：检查本地存储格式是否正确
