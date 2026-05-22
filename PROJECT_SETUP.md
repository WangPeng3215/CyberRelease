
# 赛博放生 - 项目运行说明

## 项目介绍

《赛博放生》是一个基于 Vue 3 + Vite + Tailwind CSS + Pinia + OpenLayers 构建的互联网娱乐项目，为用户提供虚拟的鱼类放生体验。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **CSS 框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **地图组件**: OpenLayers (计划中)

## 项目结构

```
CyberRelease/
├── .trae/
│   └── documents/          # 项目文档
├── src/
│   ├── assets/             # 静态资源
│   ├── components/
│   │   ├── map/            # 地图相关组件
│   │   ├── panels/         # 面板组件
│   │   ├── dialogs/        # 对话框组件
│   │   └── effects/        # 特效组件
│   ├── data/               # 模拟数据
│   ├── store/              # Pinia 状态管理
│   ├── views/              # 页面组件
│   ├── router/             # 路由配置
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── public/                 # 公共文件
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
├── postcss.config.js       # PostCSS 配置
└── package.json            # 项目依赖
```

## 安装运行

### 前置条件

确保已安装 Node.js (建议版本 16.x 或更高)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 功能说明

- **地图浏览**: 在地图上查看各个水域
- **水域选择**: 点击选择要放生的水域
- **鱼类选择**: 从多种鱼类中选择要放生的鱼类
- **功德系统**: 放生鱼类获得功德，提升等级
- **排行榜**: 查看用户功德排名
- **实时广播**: 查看其他用户的放生活动
- **生态事件**: 查看生态系统的随机事件

## 设计风格

- 科技 GIS 风格
- 深蓝色赛博 UI
- 政务环保平台风格
- 毛玻璃卡片效果
- 蓝色发光边框
