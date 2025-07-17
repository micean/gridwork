/**
 * IndexedDB 工具类
 * 提供对 IndexedDB 数据库的封装操作
 */

const DB_NAME = 'GridWorkDB'
export const DOCUMENTS_STORE = 'documents'

export interface DatabaseConfig {
  version: number
  stores: StoreConfig[]
}

export interface StoreConfig {
  name: string
  keyPath: string
  autoIncrement?: boolean
  indexes?: IndexConfig[]
}

export interface IndexConfig {
  name: string
  keyPath: string
  unique?: boolean
  multiEntry?: boolean
}

export interface QueryOptions {
  index?: string
  range?: IDBKeyRange
  direction?: IDBCursorDirection
  limit?: number
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, this.config.version)

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建或更新对象存储
        this.config.stores.forEach(storeConfig => {
          let store: IDBObjectStore

          if (!db.objectStoreNames.contains(storeConfig.name)) {
            store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement
            })
          } else {
            store = request.transaction!.objectStore(storeConfig.name)
          }

          // 创建索引
          if (storeConfig.indexes) {
            storeConfig.indexes.forEach(indexConfig => {
              if (!store.indexNames.contains(indexConfig.name)) {
                store.createIndex(indexConfig.name, indexConfig.keyPath, {
                  unique: indexConfig.unique,
                  multiEntry: indexConfig.multiEntry
                })
              }
            })
          }
        })
      }
    })
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 添加数据
   */
  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return this.executeTransaction(storeName, 'readwrite', (store) => {
      return store.add(data)
    })
  }

  /**
   * 更新数据
   */
  async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return this.executeTransaction(storeName, 'readwrite', (store) => {
      return store.put(data)
    })
  }

  /**
   * 删除数据
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return this.executeTransaction(storeName, 'readwrite', (store) => {
      return store.delete(key)
    })
  }

  /**
   * 获取数据
   */
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return this.executeTransaction(storeName, 'readonly', (store) => {
      return store.get(key)
    })
  }

  /**
   * 获取所有数据
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return this.executeTransaction(storeName, 'readonly', (store) => {
      return store.getAll()
    })
  }

  /**
   * 查询数据
   */
  async query<T>(storeName: string, options: QueryOptions = {}): Promise<T[]> {
    return this.executeTransaction(storeName, 'readonly', (store) => {
      let source: IDBObjectStore | IDBIndex = store

      if (options.index) {
        source = store.index(options.index)
      }

      const request = source.getAll(options.range, options.limit)
      return request
    })
  }

  /**
   * 清空存储
   */
  async clear(storeName: string): Promise<void> {
    return this.executeTransaction(storeName, 'readwrite', (store) => {
      return store.clear()
    })
  }

  /**
   * 统计记录数量
   */
  async count(storeName: string, keyRange?: IDBKeyRange): Promise<number> {
    return this.executeTransaction(storeName, 'readonly', (store) => {
      return store.count(keyRange)
    })
  }

  /**
   * 执行事务
   */
  private async executeTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode)
      const store = transaction.objectStore(storeName)
      const request = operation(store)

      request.onerror = () => {
        reject(new Error(`Database operation failed: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error}`))
      }
    })
  }

  /**
   * 检查数据库是否存在
   */
  static async exists(dbName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open(dbName)
      let existed = true

      request.onerror = () => {
        resolve(false)
      }

      request.onsuccess = () => {
        request.result.close()
        resolve(existed)
      }

      request.onupgradeneeded = () => {
        existed = false
        request.transaction?.abort()
      }
    })
  }

  /**
   * 删除数据库
   */
  static async deleteDatabase(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName)

      request.onerror = () => {
        reject(new Error(`Failed to delete database: ${request.error}`))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }
}

// 默认配置示例
export const defaultConfig: DatabaseConfig = {
  version: 1,
  stores: [
    {
      name: DOCUMENTS_STORE,
      keyPath: 'id',
      autoIncrement: false,
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'createdAt', keyPath: 'createdAt' }
      ]
    },
  ]
}

// 创建单例实例
let dbManager: IndexedDBManager | null = null

export function createDBManager(config: DatabaseConfig = defaultConfig): IndexedDBManager {
  if (!dbManager) {
    dbManager = new IndexedDBManager(config)
  }
  return dbManager
}

export function getDBManager(): IndexedDBManager | null {
  return dbManager
}
