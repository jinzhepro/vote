# Supabase 数据库集成设置指南

## 概述

本项目已集成 Supabase 数据库，用于存储人员数据和评价记录。

## 设置步骤

### 1. 配置环境变量

在 `.env.local` 文件中配置 Supabase 连接信息：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://ilphmqejliqqlfiupgrn.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_actual_supabase_anon_key_here
```

### 2. 创建数据库表

在 Supabase 控制台的 SQL 编辑器中执行以下命令：

```sql
-- 创建用户评价表（按用户存储，推荐使用）
CREATE TABLE IF NOT EXISTS user_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) NOT NULL DEFAULT 'employee',
  user_department VARCHAR(20) NOT NULL,
  evaluations JSONB NOT NULL, -- 存储该用户的所有评价数据
  completed_departments TEXT[] DEFAULT '{}', -- 已完成的部门列表
  total_evaluations INTEGER DEFAULT 0, -- 总评价数量
  is_submitted BOOLEAN DEFAULT FALSE, -- 是否已提交
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_evaluations_user_id ON user_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_evaluations_department ON user_evaluations(user_department);
CREATE INDEX IF NOT EXISTS idx_user_evaluations_role ON user_evaluations(user_role);
CREATE INDEX IF NOT EXISTS idx_user_evaluations_submitted ON user_evaluations(is_submitted);
CREATE INDEX IF NOT EXISTS idx_user_evaluations_updated ON user_evaluations(updated_at);

-- 启用行级安全
ALTER TABLE user_evaluations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
DROP POLICY IF EXISTS "Allow insert user evaluations" ON user_evaluations;
CREATE POLICY "Allow insert user evaluations" ON user_evaluations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read own user evaluations" ON user_evaluations;
CREATE POLICY "Allow read own user evaluations" ON user_evaluations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update own user evaluations" ON user_evaluations;
CREATE POLICY "Allow update own user evaluations" ON user_evaluations
  FOR UPDATE USING (true);

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_evaluations_updated_at
    BEFORE UPDATE ON user_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. 导入人员数据

运行以下命令将人员数据导入到数据库：

```bash
node scripts/import-personnel-to-supabase.js
```

### 4. 测试连接

- 访问 `/test-supabase` 页面测试前端连接
- 运行 `node scripts/test-supabase.js` 测试后端连接

## API 端点

### 用户评价数据 API

- `GET /api/user-evaluations` - 获取用户评价数据
- `GET /api/user-evaluations?userId=xxx` - 获取指定用户的评价
- `GET /api/user-evaluations?stats=true` - 获取统计数据
- `POST /api/user-evaluations` - 创建或更新用户评价
- `DELETE /api/user-evaluations?userId=xxx` - 删除用户评价

### 测试 API

- `GET /api/supabase-test` - 测试 Supabase 连接

## 数据结构

### User Evaluations 表

| 字段                  | 类型         | 描述                                   |
| --------------------- | ------------ | -------------------------------------- |
| id                    | UUID         | 记录 ID（主键）                        |
| user_id               | VARCHAR(100) | 用户 ID                                |
| user_name             | VARCHAR(100) | 用户姓名                               |
| user_role             | VARCHAR(20)  | 用户角色（leader/employee/functional） |
| user_department       | VARCHAR(20)  | 用户部门                               |
| evaluations           | JSONB        | 该用户的所有评价数据                   |
| completed_departments | TEXT[]       | 已完成的部门列表                       |
| total_evaluations     | INTEGER      | 总评价数量                             |
| is_submitted          | BOOLEAN      | 是否已提交                             |
| created_at            | TIMESTAMP    | 创建时间                               |
| updated_at            | TIMESTAMP    | 更新时间                               |

## 功能特性

1. **用户角色系统**

   - 部门负责人：用户角色为 `leader`
   - 普通员工：用户角色为 `employee`
   - 职能部门：用户角色为 `functional`

2. **基于用户的数据存储**

   - 每个用户的所有评价数据存储在一条记录中
   - 支持批量操作和用户级别的数据管理
   - 无外键约束问题

3. **错误处理**

   - Supabase 连接失败时自动降级到本地数据
   - 完善的错误提示和日志记录

## 故障排除

1. **连接失败**

   - 检查 `.env.local` 中的 Supabase 配置
   - 确认网络连接正常

2. **表不存在错误**

   - 确保已在 Supabase 控制台执行了 SQL 命令
   - 检查表名和字段名是否正确

3. **权限错误**
   - 确认 RLS 策略已正确设置
   - 检查 API 密钥权限

## 新的数据库结构（推荐）

为了解决外键约束问题和提高数据管理效率，项目现在支持基于用户的评价数据存储：

### 用户评价表结构

```sql
-- 创建用户评价表（按用户存储）
CREATE TABLE IF NOT EXISTS user_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) NOT NULL DEFAULT 'employee',
  user_department VARCHAR(20) NOT NULL,
  evaluations JSONB NOT NULL, -- 存储该用户的所有评价数据
  completed_departments TEXT[] DEFAULT '{}', -- 已完成的部门列表
  total_evaluations INTEGER DEFAULT 0, -- 总评价数量
  is_submitted BOOLEAN DEFAULT FALSE, -- 是否已提交
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 优势

1. **无外键约束问题**：不再依赖 personnel 表的外键约束
2. **数据一致性**：每个用户的所有评价数据存储在一条记录中
3. **更好的性能**：减少数据库查询复杂度
4. **易于管理**：支持批量操作和用户级别的数据管理

### 迁移步骤

1. 执行 `scripts/create-user-based-tables.sql` 创建新表结构
2. 系统会自动使用新的 `/api/user-evaluations` API
3. 旧的 `/api/evaluations` API 仍然可用，但建议迁移到新结构

### API 端点

- `GET /api/user-evaluations` - 获取用户评价数据
- `GET /api/user-evaluations?stats=true` - 获取统计数据
- `POST /api/user-evaluations` - 创建或更新用户评价
- `DELETE /api/user-evaluations?userId=xxx` - 删除用户评价

## 开发脚本

- `scripts/test-supabase.js` - 测试 Supabase 连接
- `scripts/setup-supabase-tables.js` - 生成建表 SQL
- `scripts/import-personnel-to-supabase.js` - 导入人员数据
- `scripts/create-user-based-tables.sql` - 创建基于用户的表结构
