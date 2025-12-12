# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的人员评价系统，用于国贸集团青云通公司的年度员工绩效考核。系统支持多部门、多角色的评价流程，并集成了 Supabase 数据库进行数据存储。

## 构建和开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库相关命令
npm run setup:tables          # 设置数据库表
npm run setup:db              # 设置数据库表（别名）
npm run setup:guide           # 显示手动建表SQL指南
npm run upload:personnel      # 上传人员数据到数据库
npm run fix:rls               # 修复行级安全策略
```

## 项目特定架构

### 数据存储策略

- **本地优先**: 评价数据首先保存在浏览器的 localStorage 中，格式为`localEvaluations`
- **批量提交**: 用户完成所有评价后，通过 API 批量提交到 Supabase 数据库
- **离线支持**: 系统可以在没有网络连接的情况下进行评价，数据暂存本地

### 用户身份验证

- 使用`generateEncryptedUserId()`函数基于姓名和部门生成加密的用户 ID
- 用户 ID 格式：`{department}_{hash}`，例如`jingkong_123456789`
- 用户身份信息存储在 localStorage 的`userId`字段中
- 登录时需要验证姓名和身份证号的匹配关系
- 身份证号验证使用`validateIdCard()`函数，包含格式和校验码验证

### 部门和角色系统

- **经控贸易(jingkong)**: 55 人，包括负责人和员工
- **开投贸易(kaitou)**: 21 人，包括负责人和员工
- **职能部门(functional)**: 5 人，负责评价其他部门
- **角色类型**: leader(负责人), employee(员工), functional(职能部门)

### 评价等级分布要求

- **经控贸易**: A≤11 人，B=23-26 人，C=18-21 人，D+E=3-6 人
- **开投贸易**: A≤3 人，B=9-11 人，C=6-8 人，D+E=1-3 人
- **职能部门**: 不需要等级分布验证

## 代码风格指南

### 文件命名

- React 组件使用 PascalCase: `EvaluationVote.jsx`
- 页面文件使用 kebab-case: `select-department/page.js`
- 工具函数使用 camelCase: `encryption.js`

### 组件结构

- 使用函数式组件和 React Hooks
- 客户端组件顶部添加`"use client";`指令
- 使用 Tailwind CSS 进行样式设计
- UI 组件使用 shadcn/ui 库

### 数据流

- 人员数据从`src/data/personnelData.js`获取
- 评价标准定义在`src/data/evaluationCriteria.js`
- API 路由位于`src/app/api/`目录

### 状态管理

- 使用 React 的 useState 和 useEffect 进行本地状态管理
- 评价数据存储在 localStorage 中，格式为`localEvaluations`
- 用户身份信息存储在 localStorage 的`userId`字段

## 关键工具函数

### 加密工具 (`src/lib/encryption.js`)

- `generateEncryptedUserId(name, department)`: 生成基于姓名和部门的加密用户 ID
- `validateUserId(userId, name, department)`: 验证用户 ID 是否匹配

### 身份验证工具 (`src/data/personnelData.js`)

- `validateIdCard(idCard)`: 验证身份证号格式和校验码
- `getPersonnelByNameAndIdCard(name, idCard)`: 根据姓名和身份证号查找人员信息

### 评价工具 (`src/data/evaluationCriteria.js`)

- `calculateTotalScore(evaluations)`: 计算评价总分
- `getScoreGrade(score)`: 获取评价等级
- `validateGradeDistribution(evaluations, department)`: 验证等级分布是否符合要求

### 数据库工具 (`src/lib/supabase.js`)

- Supabase 客户端配置和连接

## 测试数据生成

系统提供测试数据生成功能：

- 访问`/admin/generate-test-data`页面
- 输入姓名自动生成符合等级分布要求的评价数据
- 数据保存在 localStorage 中，格式与实际评价数据一致
- 可以导出 JSON 文件用于测试

## 部署注意事项

### 环境变量

需要在`.env.local`中配置 Supabase 连接信息：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### 数据库设置

1. 在 Supabase 控制台执行 SQL 创建表和 RLS 策略
2. 运行`npm run upload:personnel`上传人员数据
3. 测试 API 连接和数据流

## 常见问题

### 评价数据不提交

- 检查等级分布是否符合部门要求
- 确认所有人员都已评价完成
- 验证 Supabase 连接和 RLS 策略

### 用户身份验证失败

- 检查姓名是否在人员数据中存在
- 确认身份证号格式是否正确
- 验证姓名和身份证号是否匹配
- 确认部门信息是否正确
- 验证加密函数是否正常工作

### 数据同步问题

- 本地数据优先，服务器数据为备份
- 批量提交失败时检查网络连接
- 清除本地数据重新生成测试数据
