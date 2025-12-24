# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的人员评价系统，用于国贸集团青云通公司的员工绩效考核。系统支持三个部门（经控贸易、开投贸易、职能部门）的评价，具有严格的等级分布要求和本地存储机制。

## 构建和开发命令

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库相关命令
npm run setup:tables          # 设置 Supabase 表
npm run setup:db              # 设置数据库表
npm run test:supabase         # 测试 Supabase 连接
npm run import:personnel      # 导入人员数据
npm run fix:rls               # 修复 RLS 策略
```

## 核心架构

### 数据存储策略

- **本地存储优先**：所有评价数据首先保存在浏览器的 localStorage 中
- **批量提交机制**：完成所有评价后一次性提交到服务器
- **离线支持**：系统可在无网络环境下完成评价工作

### 关键组件结构

- `src/data/personnelData.js` - 人员数据管理（硬编码数据）
- `src/data/evaluationCriteria.js` - 评价标准和等级分布验证
- `src/lib/encryption.js` - 用户 ID 加密生成
- `src/components/vote/EvaluationVote.jsx` - 评价界面核心组件
- `src/components/vote/VotePersonnelList.jsx` - 人员列表和统计

### API 端点

- `/api/evaluations` - 单个评价数据管理
- `/api/user-evaluations` - 用户批量评价数据管理
- `/api/personnel` - 人员信息管理

## 代码风格指南

### 文件命名

- React 组件使用 PascalCase（如 `EvaluationVote.jsx`）
- 工具函数使用 camelCase（如 `generateEncryptedUserId`）
- 页面文件使用小写（如 `page.js`）

### 导入顺序

1. React 相关导入
2. 第三方库导入
3. 本地组件导入（使用 `@/` 别名）
4. 工具函数导入
5. 数据相关导入

### 组件结构

- 使用 `"use client"` 指令标记客户端组件
- 在组件顶部定义所有 hooks
- 事件处理函数放在组件底部
- 返回的 JSX 结构清晰，适当使用注释

### 状态管理

- 使用 `useState` 管理本地状态
- 使用 `useEffect` 处理副作用
- 使用 `useMemo` 优化计算密集型操作
- 使用 `localStorage` 进行客户端数据持久化

## 关键业务逻辑

### 等级分布要求

- **经控贸易**：A≤11 人，B=23-26 人，C=18-21 人，D+E=3-6 人
- **开投贸易**：A≤4 人，B=9-11 人，C=6-8 人，D+E=1-3 人
- **职能部门**：无等级分布要求

### 用户身份验证

- 基于姓名和身份证号的本地验证
- 生成加密用户 ID 存储在 localStorage
- 支持三种角色：leader（负责人）、employee（员工）、functional（职能部门）

### 评价流程

1. 用户登录并验证身份
2. 根据部门跳转到相应评价页面
3. 逐个评价部门人员
4. 系统验证等级分布
5. 批量提交所有评价数据

## 重要注意事项

- 所有人员数据硬编码在 `src/data/personnelData.js` 中
- 评价数据在提交前完全存储在客户端
- 等级分布验证是提交的必要条件
- 职能部门用户需要评价多个部门
- 系统使用中文界面和提示信息

## 环境变量

项目需要以下环境变量（在 `.env.local` 中配置）：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
```
