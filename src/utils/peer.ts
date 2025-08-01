/**
 * PeerJS 工具类
 * 提供P2P连接管理和数据传输功能
 */

import type { DataConnection } from 'peerjs';
import Peer from 'peerjs'

export interface PeerConnectionConfig {
  host?: string
  port?: number
  path?: string
  secure?: boolean
  key?: string
  debug?: number
}

export interface ConnectionInfo {
  peerId: string
  connection: DataConnection
  isConnected: boolean
}

export interface DataMessage {
  type: string
  payload: any
  timestamp: number
  from: string
}

export interface PeerEventCallbacks {
  onConnection?: (connection: DataConnection) => void
  onDisconnection?: (peerId: string) => void
  onData?: (data: DataMessage, connection: DataConnection) => void
  onError?: (error: Error) => void
  onOpen?: (id: string) => void
}

class PeerManager {
  private peer: Peer | null = null
  private connections: Map<string, ConnectionInfo> = new Map()
  private callbacks: PeerEventCallbacks = {}
  private isInitialized = false

  constructor(private config: PeerConnectionConfig = {}) {
    this.config = {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      path: '/',
      debug: 0,
      ...config
    }
  }

  /**
   * 初始化Peer连接
   */
  async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(this.config)

        this.peer.on('open', (id) => {
          this.isInitialized = true
          this.callbacks.onOpen?.(id)
          resolve(id)
        })

        this.peer.on('error', (error) => {
          console.error('Peer error:', error)
          this.callbacks.onError?.(error)
          reject(error)
        })

        this.peer.on('connection', (connection) => {
          this.handleIncomingConnection(connection)
        })

        this.peer.on('disconnected', () => {
          console.log('Peer disconnected')
          this.isInitialized = false
        })

        this.peer.on('close', () => {
          console.log('Peer connection closed')
          this.isInitialized = false
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 处理传入连接
   */
  private handleIncomingConnection(connection: DataConnection): void {
    const peerId = connection.peer

    connection.on('open', () => {
      this.connections.set(peerId, {
        peerId,
        connection,
        isConnected: true
      })
      this.callbacks.onConnection?.(connection)
    })

    connection.on('data', (data) => {
      const message: DataMessage = {
        type: (data && typeof data === 'object' && 'type' in data) ? (data as any).type || 'unknown' : 'raw',
        payload: data,
        timestamp: Date.now(),
        from: peerId
      }
      this.callbacks.onData?.(message, connection)
    })

    connection.on('close', () => {
      this.connections.delete(peerId)
      this.callbacks.onDisconnection?.(peerId)
    })

    connection.on('error', (error) => {
      console.error(`Connection error with ${peerId}:`, error)
      this.connections.delete(peerId)
      this.callbacks.onDisconnection?.(peerId)
    })
  }

  /**
   * 连接到远程Peer
   */
  async connectToPeer(peerId: string): Promise<DataConnection> {
    if (!this.peer || !this.isInitialized) {
      throw new Error('Peer not initialized. Call initialize() first.')
    }

    if (this.connections.has(peerId)) {
      const existing = this.connections.get(peerId)!
      if (existing.isConnected) {
        return existing.connection
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const connection = this.peer!.connect(peerId)

        connection.on('open', () => {
          this.connections.set(peerId, {
            peerId,
            connection,
            isConnected: true
          })
          this.callbacks.onConnection?.(connection)
          resolve(connection)
        })

        connection.on('error', (error) => {
          console.error(`Failed to connect to ${peerId}:`, error)
          reject(error)
        })

        connection.on('close', () => {
          this.connections.delete(peerId)
          this.callbacks.onDisconnection?.(peerId)
        })

        connection.on('data', (data) => {
          const message: DataMessage = {
            type: (data && typeof data === 'object' && 'type' in data) ? (data as any).type || 'unknown' : 'raw',
            payload: data,
            timestamp: Date.now(),
            from: peerId
          }
          this.callbacks.onData?.(message, connection)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 发送数据到指定Peer
   */
  async sendToPeer(peerId: string, data: unknown): Promise<void> {
    const connection = this.connections.get(peerId)
    if (!connection || !connection.isConnected) {
      throw new Error(`No active connection to peer: ${peerId}`)
    }

    return new Promise((resolve, reject) => {
      try {
        connection.connection.send(data)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 广播数据到所有连接的Peer
   */
  async broadcast(data: unknown): Promise<void> {
    const promises: Promise<void>[] = []

    for (const [peerId, connection] of this.connections) {
      if (connection.isConnected) {
        promises.push(this.sendToPeer(peerId, data))
      }
    }

    await Promise.allSettled(promises)
  }

  /**
   * 断开与指定Peer的连接
   */
  disconnectFromPeer(peerId: string): void {
    const connection = this.connections.get(peerId)
    if (connection) {
      connection.connection.close()
      this.connections.delete(peerId)
    }
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    for (const [peerId] of this.connections) {
      this.disconnectFromPeer(peerId)
    }
  }

  /**
   * 销毁Peer实例
   */
  destroy(): void {
    this.disconnectAll()
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
    this.isInitialized = false
  }

  /**
   * 获取当前Peer ID
   */
  getPeerId(): string | null {
    return this.peer?.id || null
  }

  /**
   * 获取所有连接的Peer ID
   */
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys()).filter(
      peerId => this.connections.get(peerId)?.isConnected
    )
  }

  /**
   * 检查是否连接到指定Peer
   */
  isConnectedTo(peerId: string): boolean {
    const connection = this.connections.get(peerId)
    return connection?.isConnected || false
  }

  /**
   * 设置事件回调
   */
  setCallbacks(callbacks: PeerEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): {
    isInitialized: boolean
    peerId: string | null
    connectedPeers: string[]
    totalConnections: number
  } {
    return {
      isInitialized: this.isInitialized,
      peerId: this.getPeerId(),
      connectedPeers: this.getConnectedPeers(),
      totalConnections: this.connections.size
    }
  }
}

// 创建单例实例
let peerManager: PeerManager | null = null

/**
 * 创建PeerManager实例
 */
export function createPeerManager(config?: PeerConnectionConfig): PeerManager {
  if (!peerManager) {
    peerManager = new PeerManager(config)
  }
  return peerManager
}

/**
 * 获取现有的PeerManager实例
 */
export function getPeerManager(): PeerManager | null {
  return peerManager
}

/**
 * 销毁PeerManager实例
 */
export function destroyPeerManager(): void {
  if (peerManager) {
    peerManager.destroy()
    peerManager = null
  }
}

// 默认导出
export default PeerManager
