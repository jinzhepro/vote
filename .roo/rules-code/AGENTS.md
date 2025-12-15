# 项目编码规则 (非显而易见)

## 核心数据流

- 评价数据必须先保存到 localStorage，然后手动提交到服务器
- 使用`saveEvaluationToLocal()`函数保存本地数据，不要直接操作 localStorage
- 用户 ID 必须使用`generateEncryptedUserId(name, department)`生成，确保一致性

## 关键组件依赖

- `VotePersonnelList.jsx`依赖`evaluationCriteria.js`中的等级分布验证
- `EvaluationVote.jsx`必须与`personnelData.js`中的部门结构保持同步
- 所有评价组件都依赖`encryption.js`中的用户 ID 生成逻辑

## 数据验证要求

- 身份证号验证必须使用`validateIdCard()`函数，不要自定义验证
- 等级分布验证只能对经控贸易和开投贸易部门执行，职能部门跳过验证
- 评分标准必须使用`defaultCriteria`对象，不要修改评分选项

## 本地存储结构

- 用户 ID 存储在`localStorage.userId`
- 评价数据存储在`localStorage.localEvaluations[userId]`
- 职能部门完成记录存储在`localStorage.completedDepartments`

## API 调用模式

- 用户评价数据使用`/api/user-evaluations`端点
- 批量提交时必须包含`isSubmitted: true`标志
- 人员数据优先从本地`personnelData.js`获取，API 作为备用

## 部门特定逻辑

- 职能部门用户需要评价所有其他部门，使用`completedDepartments`跟踪进度
- 经控贸易和开投贸易部门只评价本部门人员
- 部门代码使用：jingkong, kaitou, functional

## 错误处理

- 所有 localStorage 操作必须包含 try-catch 块
- 数据库操作失败时必须回滚本地存储状态
- 用户未登录时必须重定向到首页
