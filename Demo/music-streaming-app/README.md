# 音乐流媒体应用

这是一个现代化的音乐流媒体应用，提供音乐播放、播放列表管理和搜索功能。

## 功能特点

- 音乐播放和控制
- 播放列表管理
- 专辑浏览
- 音乐搜索
- 响应式设计

## 技术栈

- Vite
- TypeScript
- Tailwind CSS
- React/Vue (根据实际项目情况)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署到 CloudStudio

### 方法一：使用部署脚本

```bash
# 赋予脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署

1. 安装依赖：`npm install`
2. 构建项目：`npm run build`
3. 登录 CloudStudio 控制台
4. 创建新项目并上传构建文件
5. 配置环境变量和部署设置
6. 完成部署

## 访问应用

部署完成后，可以通过以下地址访问应用：

```
https://music-streaming-app.cloudstudio.tencent.com
```

## 配置文件

项目包含 `cloudstudio.config.json` 文件，用于配置 CloudStudio 部署参数。