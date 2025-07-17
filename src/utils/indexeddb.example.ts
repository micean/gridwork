/**
 * IndexedDB 工具类使用示例
 * 展示如何在项目中使用 IndexedDBManager
 */

import { createDBManager, defaultConfig } from './indexeddb'

// 示例：使用默认配置
async function exampleUsage() {
  try {
    // 创建数据库管理器
    const dbManager = createDBManager()
    
    // 初始化数据库
    await dbManager.init()
    console.log('数据库初始化成功')
    
    // 添加项目数据
    const projectId = await dbManager.add('projects', {
      name: '我的项目',
      description: '这是一个测试项目',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    console.log('添加项目成功，ID:', projectId)
    
    // 添加单元格数据
    const cellId = await dbManager.add('cells', {
      projectId: projectId,
      row: 1,
      col: 1,
      value: 'Hello World',
      style: { color: '#000000', backgroundColor: '#ffffff' },
      updatedAt: new Date().toISOString()
    })
    console.log('添加单元格成功，ID:', cellId)
    
    // 获取所有项目
    const allProjects = await dbManager.getAll('projects')
    console.log('所有项目:', allProjects)
    
    // 按项目ID查询单元格
    const projectCells = await dbManager.query('cells', {
      index: 'projectId',
      range: IDBKeyRange.only(projectId)
    })
    console.log('项目单元格:', projectCells)
    
    // 更新项目
    await dbManager.put('projects', {
      id: projectId,
      name: '更新后的项目名称',
      description: '这是一个测试项目',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    console.log('更新项目成功')
    
    // 获取单个项目
    const project = await dbManager.get('projects', projectId)
    console.log('项目详情:', project)
    
    // 统计记录
    const projectCount = await dbManager.count('projects')
    const cellCount = await dbManager.count('cells')
    console.log(`项目数量: ${projectCount}, 单元格数量: ${cellCount}`)
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 示例：自定义配置
async function customConfigExample() {
  const customConfig = {
    name: 'MyAppDB',
    version: 2,
    stores: [
      {
        name: 'users',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'email', keyPath: 'email', unique: true },
          { name: 'username', keyPath: 'username', unique: true },
          { name: 'createdAt', keyPath: 'createdAt' }
        ]
      },
      {
        name: 'documents',
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'userId', keyPath: 'userId' },
          { name: 'title', keyPath: 'title' },
          { name: 'lastModified', keyPath: 'lastModified' }
        ]
      }
    ]
  }
  
  const dbManager = createDBManager(customConfig)
  await dbManager.init()
  
  // 添加用户
  const userId = await dbManager.add('users', {
    email: 'user@example.com',
    username: 'testuser',
    profile: { name: '测试用户' },
    createdAt: new Date().toISOString()
  })
  
  // 添加文档
  await dbManager.add('documents', {
    userId: userId,
    title: '我的文档',
    content: '文档内容...',
    lastModified: new Date().toISOString()
  })
}

// 示例：错误处理
async function errorHandlingExample() {
  const dbManager = createDBManager()
  
  try {
    await dbManager.init()
    
    // 尝试添加重复的唯一键
    await dbManager.add('projects', {
      name: '重复项目',
      createdAt: new Date().toISOString()
    })
    
    // 再次添加相同名称的项目（假设name是唯一索引）
    await dbManager.add('projects', {
      name: '重复项目',
      createdAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('预期错误：', error)
    // 处理唯一约束冲突
  }
}

// 示例：批量操作
async function batchOperationsExample() {
  const dbManager = createDBManager()
  await dbManager.init()
  
  // 批量添加数据
  const cells = []
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 10; col++) {
      cells.push({
        projectId: 1,
        row: row,
        col: col,
        value: `R${row}C${col}`,
        updatedAt: new Date().toISOString()
      })
    }
  }
  
  // 使用Promise.all进行批量操作
  await Promise.all(
    cells.map(cell => dbManager.add('cells', cell))
  )
  
  console.log('批量添加完成')
}

// 导出示例函数供使用
export {
  exampleUsage,
  customConfigExample,
  errorHandlingExample,
  batchOperationsExample
}