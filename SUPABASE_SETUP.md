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
-- 创建人员表
CREATE TABLE IF NOT EXISTS personnel (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(20) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评价表
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  personnel_id VARCHAR(10) NOT NULL,
  department VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'employee',
  scores JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  comments TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_personnel_department ON personnel(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_personnel_id ON evaluations(personnel_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_department ON evaluations(department);
CREATE INDEX IF NOT EXISTS idx_evaluations_timestamp ON evaluations(timestamp);

-- 启用行级安全
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
DROP POLICY IF EXISTS "Allow anonymous read access to personnel" ON personnel;
CREATE POLICY "Allow anonymous read access to personnel" ON personnel
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert evaluations" ON evaluations;
CREATE POLICY "Allow insert evaluations" ON evaluations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read own evaluations" ON evaluations;
CREATE POLICY "Allow read own evaluations" ON evaluations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update own evaluations" ON evaluations;
CREATE POLICY "Allow update own evaluations" ON evaluations
  FOR UPDATE USING (true);
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

### 人员数据 API

- `GET /api/personnel` - 获取所有人员数据
- `GET /api/personnel?department=jingkong` - 获取指定部门人员
- `POST /api/personnel` - 添加新人员

### 评价数据 API

- `GET /api/evaluations` - 获取评价数据
- `GET /api/evaluations?userId=xxx` - 获取指定用户的评价
- `POST /api/evaluations` - 提交或更新评价

### 测试 API

- `GET /api/supabase-test` - 测试 Supabase 连接

## 数据结构

### Personnel 表

| 字段            | 类型         | 描述            |
| --------------- | ------------ | --------------- |
| id              | VARCHAR(10)  | 人员 ID（主键） |
| name            | VARCHAR(100) | 姓名            |
| department      | VARCHAR(20)  | 部门代码        |
| department_name | VARCHAR(50)  | 部门名称        |
| created_at      | TIMESTAMP    | 创建时间        |
| updated_at      | TIMESTAMP    | 更新时间        |

### Evaluations 表

| 字段         | 类型         | 描述                        |
| ------------ | ------------ | --------------------------- |
| id           | UUID         | 评价 ID（主键）             |
| user_id      | VARCHAR(100) | 用户 ID                     |
| personnel_id | VARCHAR(10)  | 被评价人员 ID               |
| department   | VARCHAR(20)  | 部门                        |
| role         | VARCHAR(20)  | 用户类型（leader/employee） |
| scores       | JSONB        | 评分详情                    |
| total_score  | INTEGER      | 总分                        |
| comments     | TEXT         | 评论                        |
| timestamp    | TIMESTAMP    | 评价时间                    |
| created_at   | TIMESTAMP    | 创建时间                    |

## 功能特性

1. **用户角色系统**

   - 部门负责人：用户 ID 以 `leader_` 开头
   - 普通员工：用户 ID 以 `device_` 开头

2. **数据同步**

   - 前端自动从 Supabase 获取人员数据
   - 评价数据实时保存到数据库

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

## 开发脚本

- `scripts/test-supabase.js` - 测试 Supabase 连接
- `scripts/setup-supabase-tables.js` - 生成建表 SQL
- `scripts/import-personnel-to-supabase.js` - 导入人员数据
