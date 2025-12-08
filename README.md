# 匿名投票系统与人员管理平台

这是一个基于 Next.js 构建的综合性平台，包含匿名投票系统和贸易部门人员管理功能。

## 功能特性

### 🗳️ 投票系统

- 创建匿名投票
- 参与投票（单选/多选）
- 查看投票结果和统计
- 投票搜索功能

### 👥 人员管理系统

- 贸易部门人员信息管理
- 按部门分类（经控贸易、开投贸易）
- 人员信息的增删改查
- 搜索和筛选功能
- 部门统计信息

## 技术栈

- **前端**: Next.js 16.0.7, React 19.2.0, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Neon PostgreSQL
- **数据库客户端**: @neondatabase/serverless

## 快速开始

### 1. 环境准备

确保您已安装 Node.js 18+ 版本。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

1. 访问 [Neon Console](https://console.neon.tech/) 创建数据库
2. 复制数据库连接字符串
3. 在项目根目录创建 `.env.local` 文件：

```env
DATABASE_URL="postgresql://your_username:your_password@your_hostname/your_database?sslmode=require"
```

### 4. 快速启动（推荐）

运行快速启动脚本：

```bash
node quick-start.js
```

脚本会自动检查环境配置并引导您完成初始化。

### 5. 手动启动

```bash
npm run dev
```

### 6. 初始化系统

1. 打开浏览器访问 [http://localhost:3000/init](http://localhost:3000/init)
2. 点击"初始化数据库"按钮
3. 等待初始化完成（将自动录入 67 名人员数据）

### 7. 开始使用

- **投票系统**: 访问 [http://localhost:3000](http://localhost:3000)
- **人员管理**: 访问 [http://localhost:3000/staff](http://localhost:3000/staff)

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── staff/             # 人员管理页面
│   ├── init/              # 数据初始化页面
│   ├── api/               # API 路由
│   └── ...
├── lib/                   # 工具函数和数据库配置
│   ├── db.js              # 数据库连接
│   ├── staffUtils.js      # 人员数据操作
│   └── initData.js        # 初始化数据
├── components/            # React 组件
└── ...
```

## 人员数据

系统预置了以下人员数据：

### 经控贸易部门（46 人）

郑效明、赵晓、薛慧、张倩、敬志伟、薛清华、邵汉明、陈立群、
赵安琪、刘婷、方舟、韩晓青、赵邦宇、刘丽、李鸿康、张津诚、
马丽萍、李昕益、王泽民、张梦卿、张新军、赵惠东、张笑艳、韩高洁、
孙琨、刘萍、薛洋、潘振龙、侯继儒、沙绿洲、庞东、张鹏京、
闫书奇、吕仕杰、孔帅、王伊凡、杨春梅、管伟胜、刘雅超、付冰清、
张晋哲、原豪豪、崔建刚、张照月、廖斌、杨颖

### 开投贸易部门（21 人）

周晓彬、陆剑飞、薛德晓、张龙龙、唐国彬、杨仕玉、刘娜、王珉、
初凯、段启愚、高青、纪蕾、王杰、杨龙泉、迟浩元、刘伟玉、
陈雨田、高洋、毛璐杰、杜嘉祎、臧梦娇

## API 接口

### 人员管理 API

- `GET /api/staff` - 获取所有人员和部门
- `POST /api/staff` - 创建新人员
- `GET /api/staff/[id]` - 获取单个人员信息
- `PUT /api/staff/[id]` - 更新人员信息
- `DELETE /api/staff/[id]` - 删除人员
- `GET /api/staff/departments` - 获取所有部门
- `GET /api/staff/search?q=关键词` - 搜索人员

### 初始化 API

- `GET /api/init` - 检查初始化状态
- `POST /api/init` - 初始化数据库和数据

## 文档

- [人员管理功能说明](./STAFF_MANAGEMENT.md)
- [初始化详细指南](./INITIALIZATION_GUIDE.md)
- [API 测试脚本](./test-staff-api.js)

## 开发

### 本地开发

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
npm start
```

### 代码检查

```bash
npm run lint
```

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量 `DATABASE_URL`
4. 部署完成后访问 `/init` 页面初始化数据

### 其他平台

确保平台支持 Node.js 和 PostgreSQL 连接。

## 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 `.env.local` 文件中的 `DATABASE_URL` 是否正确
   - 确认 Neon 数据库服务正常运行

2. **初始化失败**

   - 检查数据库权限
   - 查看浏览器控制台错误信息

3. **页面加载缓慢**
   - 检查网络连接
   - 确认数据库响应时间

详细的故障排除指南请参考 [INITIALIZATION_GUIDE.md](./INITIALIZATION_GUIDE.md)。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License
