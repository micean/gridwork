# GridWork 项目技术文档

## 🎯 项目概述
**GridWork** 是一个基于 Vue 3 + TypeScript 的交互式网格编辑应用，提供了类似电子表格的界面，支持嵌套表格、单元格编辑、剪贴板操作、撤销重做等高级功能。

## 🏗️ 技术栈
- **前端框架**: Vue 3.5.17 + Composition API
- **构建工具**: Vite 7.0.0
- **状态管理**: Pinia 3.0.3
- **样式**: SCSS + 内联样式
- **类型系统**: TypeScript 5.8.0
- **测试**: Vitest 3.2.4
- **代码质量**: ESLint + Prettier
- **快捷键**: Mousetrap.js
- **数据存储**: IndexedDB (浏览器本地数据库)

## 📁 项目结构

```
gridwork/
├── src/
│   ├── components/
│   │   ├── TableComponent.vue      # 主表格组件
│   │   ├── CellContent.vue         # 单元格内容组件
│   │   ├── Slider.vue              # 滑块组件
│   │   ├── ColorPicker.vue         # 颜色选择器组件
│   │   └── HeaderToolbar.vue       # 顶部工具栏组件
│   ├── stores/
│   │   ├── document.ts             # 文档管理状态
│   │   ├── history.ts              # 操作历史管理
│   │   └── search.ts               # 搜索功能状态管理
│   ├── utils/
│   │   ├── data.ts                 # 数据操作工具
│   │   ├── clipboard.ts            # 剪贴板操作
│   │   ├── edit.ts                 # 编辑相关工具
│   │   ├── keys.ts                 # 键盘事件处理
│   │   ├── bus.ts                  # 事件总线
│   │   ├── db.ts                   # IndexedDB数据库管理
│   │   └── db.example.ts           # 数据库使用示例
│   ├── App.vue                     # 主应用组件
│   ├── App.scss                    # 主应用样式
│   ├── main.ts                     # 应用入口
│   └── keys.ts                     # 全局键盘事件
├── .roo/rules-code/                # 项目规则配置
├── public/                         # 静态资源
│   └── favicon.ico                 # 网站图标
├── package.json                    # 依赖配置
├── vite.config.ts                  # Vite配置
├── tsconfig.json                   # TypeScript配置
├── vitest.config.ts                # 测试配置
├── eslint.config.ts                # ESLint配置
└── README.md                       # 项目说明文档
```

## 🔧 核心功能模块

### 1. 数据模型
```typescript
interface CellData {
  id: string;
  text: string;
  fontSize?: number;
  backgroundColor?: string;
  flexDirection?: 'row' | 'column';
  innerGrid?: CellData[][]  // 支持嵌套表格
}

interface DocumentData {
  id: string;
  title: string;
  gridData: CellData[][];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 状态管理

#### 2.1 文档管理状态 (document.ts)
- **文档管理**: 管理整个文档的生命周期
- **选中状态**: 管理单元格选中状态
- **编辑状态**: 跟踪正在编辑的单元格
- **鼠标选择**: 支持拖拽选择多个单元格
- **键盘导航**: 支持方向键导航
- **范围计算**: 计算选中区域的边界
- **文档持久化**: 自动保存到IndexedDB

#### 2.2 历史管理 (history.ts)
- **撤销/重做**: 支持无限层级的撤销重做
- **状态快照**: 自动保存数据和选中状态
- **容量限制**: 最多保存20条历史记录
- **智能合并**: 避免重复记录相同状态

#### 2.3 搜索管理 (search.ts)
- **全局搜索**: 在整个文档中搜索内容
- **高亮显示**: 高亮显示搜索结果

### 3. 数据持久化系统 (db.ts)
GridWork使用IndexedDB作为本地数据存储，支持完整的文档管理功能。

#### 核心功能
- **数据库初始化**: 自动创建和升级数据库结构
- **文档CRUD**: 完整的文档增删改查操作
- **类型安全**: 完整的TypeScript类型支持
- **单例模式**: 确保应用中只有一个数据库实例
- **错误处理**: 完善的错误处理和回滚机制

#### 存储结构
- **文档存储**: 存储完整的文档数据
- **元数据管理**: 文档标题、创建时间、更新时间
- **版本控制**: 支持数据库结构版本升级

### 4. 单元格路径系统 (Cell Path System)
GridWork使用层级路径系统来精确定位每个单元格，支持无限嵌套的表格结构。

#### 路径格式规范
- **基础格式**: `[row,col]` - 表示在根表格中的位置
- **嵌套格式**: `[row1,col1]>[row2,col2]>[row3,col3]` - 表示嵌套表格中的位置
- **层级分隔符**: `>` 用于分隔不同层级的路径
- **坐标格式**: 使用JSON数组格式 `[行索引,列索引]`，从0开始计数

#### 路径示例
```
# 根表格第2行第3列的单元格
[1,2]

# 根表格第0行第0列单元格内的嵌套表格中的第1行第1列
[0,0]>[1,1]

# 三层嵌套的单元格路径
[0,0]>[1,1]>[2,2]
```

#### 核心工具函数
- **路径解析**: 将路径字符串分解为层级数组
- **坐标计算**: 提取特定层级的行列坐标
- **范围选择**: 根据起始和结束路径计算选中的单元格范围
- **边界检测**: 判断相邻单元格是否被选中（用于边框渲染）
- **父级导航**: 支持向上导航到父级表格

### 5. 表格渲染 (TableComponent.vue)
- 递归渲染嵌套表格
- 动态计算行列数
- 支持无限层级嵌套
- 响应式数据更新

### 6. 单元格交互 (CellContent.vue)
- **内容编辑**: 支持富文本编辑
- **样式控制**: 字体大小、背景颜色、边框样式
- **键盘事件**: 方向键、ESC、回车、删除、插入等
- **鼠标事件**: 点击、拖拽选择、双击编辑
- **嵌套表格**: 支持创建和管理嵌套表格

### 7. 剪贴板操作 (clipboard.ts)
- **复制**: 支持纯文本和HTML表格格式
- **粘贴**: 支持表格数据粘贴，智能识别格式
- **剪切**: 复制并清空选中内容
- **格式转换**: 自动识别Excel、HTML表格等格式
- **嵌套支持**: 保留嵌套表格结构

### 8. 键盘快捷键 (keys.ts)
- **方向键**: 单元格导航 (↑↓←→)
- **Enter**: 开始/结束编辑
- **ESC**: 取消选择或返回父级
- **Delete/Backspace**: 清空内容
- **Insert**: 创建嵌套表格
- **Ctrl+Z/Cmd+Z**: 撤销
- **Ctrl+Y/Cmd+Y**: 重做
- **Shift+滚轮**: 调整字体大小

### 9. 数据操作工具 (data.ts)
- **ID生成**: 使用nanoid生成唯一ID
- **数据创建**: 创建网格、行、单元格
- **数据查找**: 根据路径查找单元格和网格
- **数据复制**: 深度复制单元格数据
- **格式转换**: 支持多种数据格式转换
- **序列化**: 支持JSON和HTML表格格式

## 🎨 用户界面

### 顶部工具栏 (HeaderToolbar.vue)
- **文档管理**: 新建、保存、加载文档
- **文档标题**: 显示和编辑当前文档名称
- **行列操作**: 添加/删除行列（上下左右）
- **字体调整**: 13-22px范围滑块控制
- **颜色选择**: 背景颜色选择器
- **撤销重做**: 完整的操作历史导航
- **搜索功能**: 全局内容搜索和导航
- **视觉反馈**: 选中状态高亮、编辑状态指示

### 交互特性
- **拖拽选择**: 鼠标拖拽选择多个单元格
- **嵌套表格**: 支持无限层级嵌套
- **实时编辑**: 双击或按Enter开始编辑
- **剪贴板集成**: 与Excel、Google Sheets等无缝数据交换
- **响应式布局**: 自适应不同屏幕尺寸
- **文档管理**: 完整的文档生命周期管理

## 🔄 数据流架构

```
App.vue → HeaderToolbar → 工具栏操作
App.vue → TableComponent → CellContent → 嵌套TableComponent
document Store → App.vue → CellContent
history Store → App.vue → 状态管理
Keyboard Events → keys.ts → document Store
Mouse Events → document Store
Clipboard Events → clipboard.ts → document Store
IndexedDB → db.ts → document Store → 数据持久化
```

## 🚀 开发特性

### 构建优化
- **Vite**: 快速热重载和构建
- **TypeScript**: 完整的类型支持
- **模块化**: 清晰的代码组织
- **响应式**: Vue 3 Composition API
- **代码分割**: 按需加载组件

### 开发工具
- **Vue DevTools**: 开发调试支持
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试框架
- **项目规则**: 自动化开发规范

### 项目规则
- **启动规范**: 禁止重复执行 `npm run dev`
- **提交规范**: 不等待 `git commit` 执行
- **文档优先**: 新任务开始时先阅读 projectBrief.md

## 📊 项目特点

1. **嵌套表格**: 支持无限层级的表格嵌套
2. **富交互**: 完整的键盘鼠标操作支持
3. **数据持久化**: IndexedDB集成，支持本地存储和文档管理
4. **操作历史**: 完整的撤销重做系统
5. **响应式设计**: 自适应不同屏幕尺寸
6. **类型安全**: 完整的TypeScript支持
7. **模块化架构**: 清晰的组件和工具分离
8. **智能剪贴板**: 支持多种数据格式和嵌套结构
9. **文档管理**: 完整的文档创建、编辑、保存功能
10. **搜索功能**: 全局内容搜索和结果导航

## 🚦 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test:unit

# 代码检查
npm run lint
```

## 🔗 相关链接
- [Vite Configuration](https://vite.dev/config/)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Pinia Store](https://pinia.vuejs.org/)
- [Mousetrap.js](https://craig.is/killing/mice)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)