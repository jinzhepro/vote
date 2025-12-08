# 人员管理系统初始化指南

## 快速开始

### 第一步：配置数据库连接

1. 打开 `.env.local` 文件
2. 替换以下内容为您的实际 Neon 数据库连接信息：

```env
# Neon 数据库连接字符串
DATABASE_URL="postgresql://your_username:your_password@your_hostname/your_database?sslmode=require"

# 示例：
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
```

### 第二步：获取 Neon 数据库连接信息

如果您还没有 Neon 数据库，请按以下步骤操作：

1. 访问 [Neon Console](https://console.neon.tech/)
2. 注册/登录账户
3. 点击 "New Project" 创建新项目
4. 选择数据库版本和区域
5. 创建完成后，在项目仪表板中：
   - 点击 "Connection Details"
   - 复制 "Connection string"
   - 将其粘贴到 `.env.local` 文件中

### 第三步：启动应用

```bash
npm run dev
```

### 第四步：初始化数据库

1. 打开浏览器访问：`http://localhost:3000/init`
2. 点击 "初始化数据库" 按钮
3. 等待初始化完成

### 第五步：验证初始化结果

初始化成功后，您将看到：

- ✅ 数据库已初始化
- ✅ 67 名人员已录入
- ✅ 2 个部门已创建

## 初始化过程详解

### 数据库表创建

系统会自动创建以下表：

```sql
-- 部门表
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 人员表
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  department_id INTEGER REFERENCES departments(id),
  position VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 部门数据初始化

```sql
INSERT INTO departments (name, description) VALUES
  ('经控贸易', '经控贸易部门'),
  ('开投贸易', '开投贸易部门');
```

### 人员数据初始化

系统将自动录入以下人员：

#### 经控贸易部门（46 人）

郑效明、赵晓、薛慧、张倩、敬志伟、薛清华、邵汉明、陈立群、
赵安琪、刘婷、方舟、韩晓青、赵邦宇、刘丽、李鸿康、张津诚、
马丽萍、李昕益、王泽民、张梦卿、张新军、赵惠东、张笑艳、韩高洁、
孙琨、刘萍、薛洋、潘振龙、侯继儒、沙绿洲、庞东、张鹏京、
闫书奇、吕仕杰、孔帅、王伊凡、杨春梅、管伟胜、刘雅超、付冰清、
张晋哲、原豪豪、崔建刚、张照月、廖斌、杨颖

#### 开投贸易部门（21 人）

周晓彬、陆剑飞、薛德晓、张龙龙、唐国彬、杨仕玉、刘娜、王珉、
初凯、段启愚、高青、纪蕾、王杰、杨龙泉、迟浩元、刘伟玉、
陈雨田、高洋、毛璐杰、杜嘉祎、臧梦娇

## 常见问题解决

### 问题 1：数据库连接失败

**错误信息**：`数据库连接失败`

**解决方案**：

1. 检查 `.env.local` 文件中的 `DATABASE_URL` 是否正确
2. 确认 Neon 数据库服务正常运行
3. 检查网络连接

### 问题 2：初始化失败

**错误信息**：`数据库初始化失败`

**解决方案**：

1. 确认数据库连接正常
2. 检查数据库权限
3. 尝试重新初始化

### 问题 3：人员数据未录入

**现象**：初始化成功但人员数量为 0

**解决方案**：

1. 访问 `http://localhost:3000/init` 检查状态
2. 如果显示未初始化，重新点击初始化按钮
3. 检查浏览器控制台是否有错误信息

## 手动初始化（可选）

如果自动初始化失败，您可以通过 API 手动初始化：

```javascript
// 在浏览器控制台中运行
fetch("/api/init", { method: "POST" })
  .then((r) => r.json())
  .then((data) => console.log(data));
```

## 验证初始化结果

### 方法 1：通过初始化页面

访问 `http://localhost:3000/init` 查看状态

### 方法 2：通过人员管理页面

访问 `http://localhost:3000/staff` 查看人员列表

### 方法 3：通过 API 测试

在浏览器控制台运行：

```javascript
fetch("/api/init")
  .then((r) => r.json())
  .then((data) => console.log("初始化状态:", data));
```

## 后续使用

初始化完成后，您可以：

1. **管理人员**：访问 `http://localhost:3000/staff`
2. **添加人员**：点击"添加人员"按钮
3. **编辑人员**：点击人员卡片上的"编辑"按钮
4. **搜索人员**：使用搜索框查找特定人员
5. **筛选部门**：使用下拉框按部门筛选

## 技术支持

如果遇到问题，请：

1. 检查浏览器控制台的错误信息
2. 确认所有配置文件正确
3. 验证数据库连接状态
4. 查看网络请求是否正常

初始化完成后，人员管理系统即可正常使用！
