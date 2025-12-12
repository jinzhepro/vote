-- 创建基于用户存储的评价表结构（简化版，不需要人员表）
-- 在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- 删除旧的表（如果存在）
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS personnel CASCADE;

-- 创建新的用户评价表（按用户存储）
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

-- 验证表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_evaluations' 
ORDER BY ordinal_position;