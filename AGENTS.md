# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目概述

这是一个基于 Next.js 的人员评价系统，用于国贸集团青云通公司的年度绩效考核。系统支持三个部门（经控贸易、开投贸易、职能部门）的人员评价，具有严格的等级分布要求。

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
npm run setup:tables          # 设置Supabase表
npm run setup:db              # 设置数据库表
npm run test:supabase         # 测试Supabase连接
npm run import:personnel      # 导入人员数据到Supabase
npm run fix:rls               # 修复RLS策略
```

## 核心架构

### 数据存储

- **双重数据库支持**: 支持 Supabase 和本地 PostgreSQL
- **本地存储优先**: 评价数据首先保存在 localStorage 中，用户手动提交到服务器
- **人员数据**: 存储在`src/data/personnelData.js`中的静态数据

### 关键组件

- **评价系统**: `src/components/vote/EvaluationVote.jsx` - 处理单个人员评价
- **人员列表**: `src/components/vote/VotePersonnelList.jsx` - 显示部门人员列表和评价状态
- **等级验证**: `src/data/evaluationCriteria.js` - 包含评分标准和等级分布验证逻辑

### 部门结构

- **经控贸易 (jingkong)**: 55 人，A≤11 人，B=23-26 人，C=18-21 人，D+E=3-6 人
- **开投贸易 (kaitou)**: 23 人，A≤4 人，B=9-11 人，C=6-8 人，D+E=1-3 人
- **职能部门 (functional)**: 6 人，需要评价所有其他部门

## 代码风格和约定

### 导入路径

- 使用`@/`前缀引用 src 目录下的文件
- 组件导入使用相对路径

### 文件命名

- React 组件使用 PascalCase: `EvaluationVote.jsx`
- 工具函数使用 camelCase: `generateEncryptedUserId`
- 页面文件使用`page.js`

### 组件结构

- 所有组件使用`"use client"`指令
- 使用函数组件和 Hooks
- 错误边界包装在`src/components/ErrorBoundary.jsx`

### 数据处理

- 人员数据验证使用`validateIdCard()`函数
- 用户 ID 生成使用`generateEncryptedUserId(name, department)`
- 评价数据存储在 localStorage 的`localEvaluations`键中

## 关键业务逻辑

### 评价流程

1. 用户通过姓名和身份证号登录
2. 系统生成加密用户 ID 并存储在 localStorage
3. 用户选择部门进行评价
4. 评价数据保存在本地，可随时编辑
5. 完成所有评价后验证等级分布
6. 符合要求后提交到服务器

### 等级分布验证

- 只有经控贸易和开投贸易部门需要等级分布验证
- 职能部门不需要等级分布限制
- 验证逻辑在`validateGradeDistribution()`函数中

### API 端点

- `/api/user-evaluations` - 用户评价数据 CRUD
- `/api/personnel` - 人员数据管理
- `/api/evaluations` - 评价记录管理

## 环境变量

项目需要以下环境变量（在`.env.local`中配置）：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
```

## 测试

项目目前没有配置自动化测试框架。手动测试流程：

1. 启动开发服务器
2. 使用测试账号登录（如：张晋哲/370304199501072739）
3. 完成评价流程
4. 验证等级分布和提交功能

## 部署注意事项

- 确保 Supabase 表结构正确设置
- 检查 RLS 策略允许适当的读写操作
- 验证环境变量配置
- 确保 localStorage 在生产环境中可用
