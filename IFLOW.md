# Vote 项目开发指南

## 项目概述

**Vote** 是一个企业员工绩效考核系统，专为2025年度员工绩效考核设计。该系统支持多部门评价管理，提供完整的用户身份验证、评价流程、数据统计和管理功能。

### 核心特性

- 🏢 **多部门支持**: 经控贸易(jingkong)、开投贸易(kaitou)、职能部门(functional)
- 👥 **多角色评价**: 部门负责人(Leader)、普通员工(Employee)、职能部门(Functional)
- 🔐 **安全身份验证**: 基于姓名+身份证号的身份验证，支持本地验证不存储敏感信息
- 📊 **评价标准管理**: 10项评价指标，支持自定义评分等级
- 📈 **数据统计分析**: 实时统计评价数据和等级分布
- 📋 **Excel导出**: 支持按部门、角色导出评价数据
- 🎯 **等级分布验证**: 自动验证评价结果是否符合企业要求
- ⚡ **管理员Dashboard**: 完整的管理界面和数据管理功能
- 🛡️ **隐私保护**: 身份验证信息仅用于校验，不上传服务器
- 🔄 **会话管理**: 基于localStorage的用户会话管理

## 技术架构

### 核心技术栈

- **前端框架**: Next.js 16.0.7 + React 19.2.0
- **数据库**: Supabase (PostgreSQL)
- **缓存**: Redis 5.10.0
- **样式框架**: Tailwind CSS 4
- **UI组件**: Radix UI (Dialog、Slot等)
- **图标库**: Lucide React
- **通知系统**: Sonner
- **数据处理**: XLSX (Excel导出)
- **加密**: 自定义加密用户ID
- **字体**: Geist Sans & Geist Mono

### 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.js            # 首页 - 身份验证入口
│   ├── layout.js          # 全局布局和样式
│   ├── globals.css        # 全局样式文件
│   ├── admin/             # 管理员模块
│   │   ├── page.js        # 管理员登录
│   │   ├── dashboard/     # 管理面板
│   │   └── generate-test-data/  # 测试数据生成
│   ├── api/               # API路由
│   │   ├── evaluations/   # 评价数据API
│   │   ├── personnel/     # 人员数据API
│   │   └── user-evaluations/  # 用户评价API
│   └── vote/              # 投票评价模块
│       ├── functional/    # 职能部门评价
│       │   ├── select-department/  # 部门选择页面
│       │   └── [role]/[personId]/  # 动态评价页面
│       ├── jingkong/      # 经控贸易评价
│       │   ├── employee/  # 员工评价页面
│       │   ├── leader/    # 负责人评价页面
│       │   └── [role]/[personId]/  # 动态评价页面
│       ├── kaitou/        # 开投贸易评价
│       │   ├── employee/  # 员工评价页面
│       │   ├── leader/    # 负责人评价页面
│       │   └── [role]/[personId]/  # 动态评价页面
│       └── success/       # 评价完成页面
├── components/            # React组件
│   ├── admin/            # 管理员相关组件
│   │   ├── AdminDashboard.jsx
│   │   └── AdminLogin.jsx
│   ├── ui/               # 基础UI组件
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── footer.jsx
│   │   ├── input.jsx
│   │   └── loading.jsx
│   ├── vote/             # 投票相关组件
│   │   ├── EvaluationVote.jsx
│   │   └── VotePersonnelList.jsx
│   └── ErrorBoundary.jsx # 错误边界组件
├── lib/                  # 工具库
│   ├── supabase.js       # Supabase数据库连接
│   ├── encryption.js     # 用户ID加密
│   └── utils.js          # 通用工具函数
└── data/                 # 数据定义
    ├── personnelData.js  # 人员数据和验证函数
    └── evaluationCriteria.js  # 评价标准和验证函数

scripts/                  # 脚本目录（当前为空，保留用于扩展）
```

## 快速开始

### 环境要求

- Node.js 16.0.7 或更高版本
- npm 或 yarn 包管理器
- Supabase 账户和项目（可选，系统支持本地数据运行）

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件并配置 Supabase 连接（可选）：

```env
# Supabase配置（可选，不配置将使用默认值）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

**注意**: 系统已内置默认Supabase配置，可直接运行进行测试。

### 开发运行

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

### 数据库管理脚本

以下脚本为项目保留的数据库管理功能（scripts目录当前为空，待扩展）：

```bash
# 设置Supabase表结构
npm run setup:tables

# 设置数据库表
npm run setup:db

# 获取数据库表创建指南
npm run setup:guide

# 测试Supabase连接
npm run test:supabase

# 导入人员数据到Supabase
npm run import:personnel

# 上传人员数据到数据库
npm run upload:personnel

# 修复RLS策略
npm run fix:rls

# 检查部署状态
npm run check:deploy

# 设置用户表
npm run setup:user-tables
```

## 核心功能

### 1. 身份验证系统

用户通过姓名+身份证号进行身份验证：

- **本地验证**: 身份证号格式和校验码本地验证，不上传服务器
- **隐私保护**: 姓名和身份证号仅用于身份校验，确保本人操作，不存储或泄露
- **加密用户ID**: 生成基于姓名和部门的加密用户ID用于系统识别
- **会话管理**: 支持localStorage存储用户会话，自动清理完成的部门记录
- **智能路由**: 职能部门需要先选择评价部门，其他部门直接跳转到对应评价页面
- **错误处理**: 完善的错误提示和异常处理机制

### 2. 评价系统

#### 评价标准

系统使用10项标准评价指标：

1. **责任心** (15分): 主动工作和承担责任的态度
2. **勤勉性** (5分): 遵守规章制度情况和时间观念
3. **爱岗敬业** (15分): 服务意识和奉献精神
4. **合作性** (10分): 团队合作意识
5. **专业知识** (8分): 工作知识和技术能力运用
6. **判断能力** (7分): 判断工作问题轻重缓急
7. **学习能力** (10分): 专业知识学习的主动性和效果
8. **工作成效** (10分): 岗位职责履行情况
9. **工作质量** (10分): 完成工作规定标准及准确性
10. **工作效率** (10分): 指定期限内完成指定工作的数量

#### 评分等级

- **优秀 (A)**: 95-100分
- **良好 (B)**: 85-94分
- **合格 (C)**: 75-84分
- **基本合格 (D)**: 65-74分
- **不合格 (E)**: <65分

#### 等级分布要求

**经控贸易部门**:
- A等级: ≤11人
- B等级: 23-26人
- C等级: 18-21人
- D+E等级: 3-6人

**开投贸易部门**:
- A等级: ≤4人
- B等级: 9-11人
- C等级: 6-8人
- D+E等级: 1-3人

### 3. 管理员功能

#### 管理面板特性

- 实时评价数据统计
- 按部门、角色分类查看
- 用户评价详情查看
- 数据导出到Excel
- 等级分布验证
- 测试数据生成

#### 导出功能

支持按以下维度导出Excel：
- 经控贸易 - 部门负责人
- 经控贸易 - 普通员工
- 开投贸易 - 部门负责人
- 开投贸易 - 普通员工
- 职能部门对经控贸易评价
- 职能部门对开投贸易评价

## API 文档

### 评价数据API

```javascript
// 获取用户评价数据
GET /api/user-evaluations?stats=true

// 创建或更新用户评价
POST /api/user-evaluations
{
  "userId": "encrypted_user_id",
  "userName": "用户姓名",
  "userRole": "employee",
  "userDepartment": "jingkong",
  "evaluations": {
    "department": "kaitou",
    "personnelId": "KT001",
    "scores": {
      "responsibility": 15,
      "diligence": 5,
      "dedication": 15
    }
  }
}

// 删除用户评价
DELETE /api/user-evaluations?userId=xxx
```

### 人员数据API

```javascript
// 获取人员列表
GET /api/personnel

// 根据ID获取人员信息
GET /api/personnel?id=JK001
```

## 数据库结构

### 用户评价表 (user_evaluations)

```sql
CREATE TABLE user_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) NOT NULL DEFAULT 'employee',
  user_department VARCHAR(20) NOT NULL,
  evaluations JSONB NOT NULL,  -- 存储该用户的所有评价数据
  completed_departments TEXT[] DEFAULT '{}',  -- 已完成的部门列表
  total_evaluations INTEGER DEFAULT 0,  -- 总评价数量
  is_submitted BOOLEAN DEFAULT FALSE,  -- 是否已提交
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 索引和权限

```sql
-- 创建索引
CREATE INDEX idx_user_evaluations_user_id ON user_evaluations(user_id);
CREATE INDEX idx_user_evaluations_department ON user_evaluations(user_department);
CREATE INDEX idx_user_evaluations_role ON user_evaluations(user_role);

-- 启用行级安全
ALTER TABLE user_evaluations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "Allow insert user evaluations" ON user_evaluations
  FOR INSERT WITH CHECK (true);
```

## 部署指南

### Vercel 部署

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 部署完成

### 环境变量配置

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## 开发规范

### 代码风格

- 使用 ESLint 9 进行代码规范检查，配置基于 next/core-web-vitals
- 遵循 React/Next.js 最佳实践，使用函数式组件和Hooks
- 使用 Tailwind CSS 4 进行样式开发，配合 class-variance-authority 和 clsx
- 组件采用 `.jsx` 扩展名，页面使用 `.js` 扩展名
- 使用 Geist 字体家族作为默认字体

### 文件命名规范

- **页面文件**: `page.js` (App Router约定)
- **组件文件**: `ComponentName.jsx` (PascalCase)
- **工具文件**: `utils.js`, `encryption.js` (camelCase)
- **数据文件**: `data.js`, `personnelData.js` (camelCase)
- **API路由**: `route.js` (App Router约定)
- **样式文件**: `globals.css` (全局样式)

### 状态管理

- **本地状态**: 使用 React Hooks (useState, useEffect) 进行组件状态管理
- **数据持久化**: 使用 Supabase 进行评价数据存储
- **用户会话**: 使用 localStorage 进行用户会话和完成状态管理
- **错误处理**: 使用 ErrorBoundary 组件进行全局错误捕获
- **通知系统**: 使用 Sonner 进行用户通知

### 项目配置

- **路径别名**: `@/*` 映射到 `./src/*` 目录
- **TypeScript**: 使用 jsconfig.json 配置路径映射
- **ESLint**: 自定义配置，覆盖默认忽略规则
- **PostCSS**: 配置 Tailwind CSS 4 处理

## 故障排除

### 常见问题

1. **Supabase连接失败**
   - 检查 `.env.local` 配置
   - 确认网络连接
   - 验证API密钥权限

2. **身份验证失败**
   - 确认身份证号格式正确
   - 检查人员数据是否存在
   - 验证localStorage是否可用

3. **评价数据异常**
   - 检查评价标准配置
   - 验证等级分布规则
   - 查看API响应日志

4. **Excel导出失败**
   - 检查统计数据是否存在
   - 确认XLSX库安装
   - 验证文件权限

### 调试方法

```bash
# 查看详细日志（开发模式）
npm run dev

# 运行代码规范检查
npm run lint

# 检查Supabase连接
npm run test:supabase

# 验证数据库表结构
npm run setup:guide

# 检查部署状态
npm run check:deploy
```

### 浏览器调试

- **控制台日志**: 系统在关键操作点输出详细日志信息
- **localStorage检查**: 可在浏览器开发者工具中查看用户会话状态
- **网络请求**: 使用Network标签页监控API请求状态
- **组件状态**: 使用React Developer Tools检查组件状态

## 测试数据

### 预置人员数据

- **经控贸易**: 55人 (JK001-JK055)
- **开投贸易**: 23人 (KT001-KT023)
- **职能部门**: 5人 (FN001-FN005)

### 测试脚本

```bash
# 生成测试评价数据
访问 /admin/generate-test-data

# 手动创建测试数据
npm run generate:test-data
```

## 性能优化

### 数据库优化

- 使用JSONB字段存储评价数据
- 创建合适的数据库索引
- 启用行级安全(RLS)

### 前端优化

- 使用Next.js App Router
- 实现组件懒加载
- 优化图片和资源加载

### 缓存策略

- 使用Redis缓存频繁查询
- 实现客户端状态缓存
- 优化API响应时间

## 安全考虑

### 数据安全

- 用户ID加密存储
- 行级安全策略
- API访问控制

### 身份验证

- 身份证号格式验证
- 用户会话管理
- 防止重复投票

### 数据完整性

- 评价数据校验
- 等级分布验证
- 数据一致性检查

## 维护和监控

### 日常维护

- 定期检查数据库性能
- 监控API响应时间
- 备份重要数据

### 监控指标

- 用户活跃度
- 评价完成率
- 系统响应时间

### 备份策略

- 定期数据库备份
- 配置文件备份
- 代码版本控制

## 扩展功能

### 计划中的功能

- [ ] 评价结果统计分析
- [ ] 评价历史对比
- [ ] 自定义评价标准
- [ ] 评价提醒功能
- [ ] 移动端适配
- [ ] 多语言支持

### 自定义开发

系统支持以下自定义：
- 评价标准调整
- 等级分布规则修改
- 人员数据结构变更
- 界面样式调整

## 技术支持

### 联系方式

- 项目维护者: 开发团队
- 技术文档: 本文档
- 问题反馈: GitHub Issues

### 更新日志

- **v1.0.0** (2025-12-12): 初始版本发布
  - 基础评价系统
  - 管理员功能
  - 数据导出功能
  - 等级分布验证

- **v1.1.0** (2025-12-24): 项目优化和文档更新
  - 更新技术栈到 Next.js 16.0.7 + React 19.2.0
  - 升级到 Tailwind CSS 4
  - 增强隐私保护和身份验证机制
  - 完善错误处理和用户体验
  - 优化项目结构和代码规范
  - 更新开发文档和部署指南

---

*本文档最后更新时间: 2025年12月24日*