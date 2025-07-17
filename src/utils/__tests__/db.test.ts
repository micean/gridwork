/**
 * IndexedDB 工具类测试文件
 * 注意：这些测试需要在浏览器环境中运行，Node.js环境不支持IndexedDB
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { IndexedDBManager, createDBManager, defaultConfig } from '../db.ts'

// 模拟IndexedDB环境
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
}

// 设置全局indexedDB
global.indexedDB = mockIndexedDB as any

describe('IndexedDBManager', () => {
  let dbManager: IndexedDBManager

  beforeEach(() => {
    // 重置mock
    vi.clearAllMocks()

    // 使用测试数据库配置
    const testConfig = {
      ...defaultConfig,
      name: 'TestGridWorkDB'
    }
    dbManager = new IndexedDBManager(testConfig)
  })

  afterEach(() => {
    if (dbManager) {
      dbManager.close()
    }
  })

  describe('数据库初始化', () => {
    it('应该成功初始化数据库', async () => {
      // 模拟成功的数据库打开
      const mockDB = { close: vi.fn() }
      const mockRequest = {
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
        result: mockDB
      }

      mockIndexedDB.open.mockReturnValue(mockRequest)

      const initPromise = dbManager.init()
      mockRequest.onsuccess()

      await initPromise
      expect(mockIndexedDB.open).toHaveBeenCalledWith('TestGridWorkDB', 1)
    })

    it('应该处理数据库初始化错误', async () => {
      const mockRequest = {
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
        error: new Error('Failed to open')
      }

      mockIndexedDB.open.mockReturnValue(mockRequest)

      const initPromise = dbManager.init()
      mockRequest.onerror()

      await expect(initPromise).rejects.toThrow('Failed to open database: Error: Failed to open')
    })
  })

  describe('静态方法', () => {
    it('应该检查数据库是否存在', async () => {
      const mockRequest = {
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
        result: { close: vi.fn() }
      }

      mockIndexedDB.open.mockReturnValue(mockRequest)

      const existsPromise = IndexedDBManager.exists('TestDB')
      mockRequest.onsuccess()

      const exists = await existsPromise
      expect(exists).toBe(true)
    })

    it('应该删除数据库', async () => {
      const mockRequest = {
        onsuccess: null as any,
        onerror: null as any
      }

      mockIndexedDB.deleteDatabase.mockReturnValue(mockRequest)

      const deletePromise = IndexedDBManager.deleteDatabase('TestDB')
      mockRequest.onsuccess()

      await deletePromise
      expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith('TestDB')
    })
  })

  describe('单例模式', () => {
    it('应该创建单例实例', () => {
      const manager1 = createDBManager()
      const manager2 = createDBManager()

      expect(manager1).toBe(manager2)
    })
  })

  describe('类型定义', () => {
    it('应该导出所有必要的类型', () => {
      expect(typeof IndexedDBManager).toBe('function')
      expect(typeof createDBManager).toBe('function')
      expect(typeof defaultConfig).toBe('object')
    })
  })
})
