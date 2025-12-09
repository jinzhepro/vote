-- 添加新人员到数据库
-- 添加丁鑫和张祥舟到经控贸易部门

-- 插入丁鑫
INSERT INTO personnel (id, name, department, department_name, created_at) 
VALUES ('JK054', '丁鑫', 'jingkong', '经控贸易', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  department_name = EXCLUDED.department_name,
  created_at = NOW();

-- 插入张祥舟
INSERT INTO personnel (id, name, department, department_name, created_at) 
VALUES ('JK055', '张祥舟', 'jingkong', '经控贸易', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  department_name = EXCLUDED.department_name,
  created_at = NOW();

-- 验证插入结果
SELECT * FROM personnel WHERE id IN ('JK054', 'JK055');