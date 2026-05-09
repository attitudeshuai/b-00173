# 音频可视化系统 (Audio Visualization System)

这是一个基于 Web 的炫酷音频可视化系统，用户可以加载本地 MP3 文件并选择不同的可视化效果。

## 项目简介

本项目采用 BS (Browser/Server) 架构，前端使用 React + Vite 构建，样式使用 Tailwind CSS。

### 功能特性

- **MP3 音频加载**: 支持用户上传/选择本地音频文件。
- **多种可视化效果**: 提供 5 种不同的可视化模式（如水流、粒子、星空、自然等）。
- **实时渲染**: 利用 Web Audio API 和 Canvas/WebGL 实现流畅的音频动态效果。

## 目录结构

```
project/
├── frontend/           # 前端项目代码 (Vite + React + TS)
│   ├── src/
│   │   ├── components/ # 组件
│   │   ├── App.tsx     # 主入口
│   │   └── index.css   # 样式 (Tailwind)
│   ├── Dockerfile      # 前端 Docker 构建文件
│   └── package.json
├── docker-compose.yml  # Docker 编排文件
└── README.md           # 项目文档
```

## 部署与运行

### 本地开发

1. 进入 frontend 目录:
   ```bash
   cd frontend
   ```
2. 安装依赖:
   ```bash
   pnpm install
   ```
3. 启动开发服务器:
   ```bash
   pnpm dev
   ```

### Docker 部署

在项目根目录下运行:

```bash
docker-compose up -d
```

访问 `http://localhost:3000` 即可查看效果。
