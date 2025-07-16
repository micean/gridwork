# GridWork 项目技术文档

## 🎯 项目概述
**GridWork** 是一个基于 Vue 3 + TypeScript 的交互式网格编辑应用，提供了类似电子表格的界面，支持嵌套表格、单元格编辑、剪贴板操作等高级功能。

## 🏗️ 技术栈
- **前端框架**: Vue 3.5.17 + Composition API
- **构建工具**: Vite 7.0.0
- **状态管理**: Pinia 3.0.3
- **样式**: SCSS + 内联样式
- **类型系统**: TypeScript 5.8.0
- **测试**: Vitest 3.2.4
- **代码质量**: ESLint + Prettier

## 📁 项目结构

```
gridwork/
├── src/
│   ├── components/
│   │   ├── TableComponent.vue      # 主表格组件
│   │   ├── CellContent.vue         # 单元格内容组件
│   │   └── Slider.vue             # 滑块组件
│   ├── stores/
│   │   └── selectedCells.ts       # 选中单元格状态管理
│   ├── utils/
│   │   ├── data.ts                # 数据操作工具
│   │   ├── clipboard.ts           # 剪贴板操作
│   │   ├── edit.ts                # 编辑相关工具
│   │   └── bus.ts                 # 事件总线
│   ├── App.vue                    # 主应用组件
│   ├── main.ts                    # 应用入口
│   └── keys.ts                    # 键盘事件处理
├── package.json                   # 依赖配置
├── vite.config.ts                 # Vite配置
└── tsconfig.json                  # TypeScript配置
```

## 🔧 核心功能模块

### 1. 数据模型
```typescript
interface CellData {
  id: string;
  text: string;
  fontSize?: number;
  innerGrid?: CellData[][]  // 支持嵌套表格
}
```

### 2. 状态管理 (selectedCells.ts)
- **选中状态**: 管理单元格选中状态
- **编辑状态**: 跟踪正在编辑的单元格
- **鼠标选择**: 支持拖拽选择多个单元格
- **键盘导航**: 支持方向键导航

### 3. 单元格路径系统 (Cell Path System)
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

#### 路径在组件中的使用
- **TableComponent.vue**: 生成单元格的完整路径并传递给CellContent
- **CellContent.vue**: 接收路径作为props，用于状态管理和事件处理
- **selectedCells.ts**: 使用路径进行选中状态管理、范围计算和键盘导航

### 3. 表格渲染 (TableComponent.vue)
- 递归渲染嵌套表格
- 动态计算行列数
- 支持无限层级嵌套

### 4. 单元格交互 (CellContent.vue)
- **内容编辑**: 支持富文本编辑
- **样式控制**: 字体大小、边框样式
- **键盘事件**: 方向键、ESC、回车等
- **鼠标事件**: 点击、拖拽选择

### 5. 剪贴板操作 (clipboard.ts)
- **复制**: 支持纯文本和HTML格式
- **粘贴**: 支持表格数据粘贴
- **智能识别**: 自动识别表格格式

### 6. 键盘快捷键 (keys.ts)
- **方向键**: 单元格导航
- **Enter**: 开始编辑
- **ESC**: 取消选择
- **Delete**: 清空内容
- **Insert**: 创建嵌套表格
- **滚轮+Shift**: 调整字体大小

## 🎨 用户界面

### 工具栏功能
- **行列操作**: 添加/删除行列
- **字体调整**: 13-22px范围
- **视觉反馈**: 选中状态高亮

### 交互特性
- **拖拽选择**: 鼠标拖拽选择多个单元格
- **嵌套表格**: 支持无限层级嵌套
- **实时编辑**: 双击或按Enter开始编辑
- **剪贴板集成**: 与Excel等软件无缝数据交换

## 🔄 数据流架构

```
App.vue → TableComponent → CellContent → 嵌套TableComponent
selectedCells Store → App.vue → CellContent
Keyboard Events → selectedCells Store
Mouse Events → selectedCells Store
Clipboard Events → selectedCells Store
```

## 🚀 开发特性

### 构建优化
- **Vite**: 快速热重载和构建
- **TypeScript**: 完整的类型支持
- **模块化**: 清晰的代码组织
- **响应式**: Vue 3 Composition API

### 开发工具
- **Vue DevTools**: 开发调试支持
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

## 📊 项目特点

1. **嵌套表格**: 支持无限层级的表格嵌套
2. **富交互**: 完整的键盘鼠标操作支持
3. **数据持久化**: 剪贴板集成，支持外部数据导入
4. **响应式设计**: 自适应不同屏幕尺寸
5. **类型安全**: 完整的TypeScript支持
6. **模块化架构**: 清晰的组件和工具分离

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