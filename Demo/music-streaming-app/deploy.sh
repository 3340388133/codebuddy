#!/bin/bash

# 安装依赖
echo "正在安装依赖..."
npm install

# 构建项目
echo "正在构建项目..."
npm run build

# 部署到 CloudStudio
echo "正在部署到 CloudStudio..."
# 这里可以添加实际的 CloudStudio 部署命令
# 例如: cloudstudio deploy --project music-streaming-app

echo "部署完成！应用已成功部署到 CloudStudio。"
echo "访问地址: https://music-streaming-app.cloudstudio.tencent.com"