# 部署指南

## 本地与线上环境差异排查

如果应用在本地运行正常但在线上环境出现问题，请按照以下步骤进行排查：

### 1. 环境变量检查

确保线上环境正确设置了以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
NODE_ENV=production
```

### 2. 运行部署检查脚本

在部署环境中运行以下命令检查系统状态：

```bash
npm run check:deploy
```

### 3. 常见问题及解决方案

#### 问题 1：点击登录按钮无反应

**可能原因：**

- localStorage 不可用
- 环境变量未正确设置
- JavaScript 错误

**解决方案：**

1. 检查浏览器控制台是否有错误信息
2. 确认浏览器支持 localStorage
3. 检查网络请求是否正常

#### 问题 2：人员数据加载失败

**可能原因：**

- Supabase 连接问题
- 环境变量配置错误
- 数据库表未正确设置

**解决方案：**

1. 验证 Supabase URL 和密钥是否正确
2. 检查 Supabase 数据库表是否存在
3. 确认 RLS（行级安全）策略是否正确配置

#### 问题 3：路由跳转失败

**可能原因：**

- Next.js 路由配置问题
- 部署平台路由配置不正确

**解决方案：**

1. 检查部署平台的路由配置
2. 确认所有页面文件都正确部署
3. 检查动态路由是否正确配置

### 4. 调试步骤

#### 启用详细日志

在浏览器控制台中查看详细的错误信息：

```javascript
// 在浏览器控制台中运行
localStorage.setItem("debug", "true");
```

#### 检查网络请求

1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 尝试登录操作
4. 检查是否有失败的请求

#### 验证 localStorage

在浏览器控制台中运行：

```javascript
// 检查 localStorage 是否可用
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  console.log("localStorage 正常工作");
} catch (e) {
  console.error("localStorage 不可用:", e);
}
```

### 5. 部署平台特定配置

#### Vercel 部署

1. 在 Vercel 控制台中设置环境变量
2. 确保构建命令为 `npm run build`
3. 确保输出目录为 `.next`

#### Netlify 部署

1. 在 Netlify 控制台中设置环境变量
2. 构建命令：`npm run build`
3. 发布目录：`.next`

#### 自定义服务器部署

1. 确保服务器安装了所有依赖
2. 设置正确的环境变量
3. 运行 `npm run build` 构建应用
4. 运行 `npm start` 启动应用

### 6. 性能优化

#### 启用 gzip 压缩

在 Next.js 配置中启用压缩：

```javascript
// next.config.js
module.exports = {
  compress: true,
  // 其他配置...
};
```

#### 优化图片

确保使用 Next.js 的 Image 组件：

```jsx
import Image from "next/image";

<Image src="/path/to/image.jpg" alt="描述" width={500} height={300} />;
```

### 7. 监控和日志

#### 错误监控

考虑集成错误监控服务：

- Sentry
- LogRocket
- 自定义错误日志

#### 性能监控

使用以下工具监控性能：

- Google PageSpeed Insights
- Web Vitals
- Lighthouse

### 8. 回滚计划

如果部署后出现问题：

1. 立即回滚到上一个稳定版本
2. 检查部署日志
3. 在本地环境中重现问题
4. 修复问题后重新部署

### 9. 联系支持

如果问题仍然存在：

1. 收集详细的错误信息
2. 记录复现步骤
3. 提供浏览器和操作系统信息
4. 联系技术支持团队

---

## 测试清单

部署前请确认以下项目：

- [ ] 所有环境变量已设置
- [ ] 本地测试通过
- [ ] 构建过程无错误
- [ ] 数据库连接正常
- [ ] 所有页面可正常访问
- [ ] 表单提交功能正常
- [ ] 错误处理正常工作
- [ ] 移动端适配正常
- [ ] 性能指标符合要求

---

## 更新日志

### v1.0.0

- 添加错误边界组件
- 改进 localStorage 错误处理
- 添加部署检查脚本
- 优化线上环境兼容性
