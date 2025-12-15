# 项目调试规则 (非显而易见)

## 本地存储调试

- 评价数据存储在`localStorage.localEvaluations[userId]`，检查数据结构是否正确
- 职能部门进度存储在`localStorage.completedDepartments`数组中
- 用户 ID 存储在`localStorage.userId`，验证格式为`department_hash`

## 数据库连接调试

- 使用`npm run test:supabase`测试 Supabase 连接
- 检查环境变量`NEXT_PUBLIC_SUPABASE_URL`和`NEXT_PUBLIC_SUPABASE_KEY`
- 本地 PostgreSQL 连接字符串在`src/lib/database.js`中配置

## 常见问题定位

- 等级分布验证失败时，检查`validateGradeDistribution()`函数的返回值
- 用户登录失败时，验证`getPersonnelByNameAndIdCard()`函数的匹配逻辑
- 评价提交失败时，检查 API 响应中的`error`字段

## 关键断点位置

- `src/components/vote/EvaluationVote.jsx`的`saveEvaluationToLocal()`函数
- `src/components/vote/VotePersonnelList.jsx`的`submitAllEvaluations()`函数
- `src/app/api/user-evaluations/route.js`的 POST 处理函数

## 数据一致性检查

- 验证本地评价数据与服务器数据的同步状态
- 检查职能部门用户的`completedDepartments`数组
- 确认等级分布统计的准确性

## 性能监控点

- 大量评价数据加载时的渲染性能
- localStorage 读写操作的响应时间
- 批量提交 API 调用的超时处理
