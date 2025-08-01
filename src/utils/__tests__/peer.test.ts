/**
 * PeerManager 测试文件
 * 由于PeerJS需要真实的网络环境，这里主要测试接口和基本功能
 */

import { describe, it, expect, vi } from 'vitest'
import { createPeerManager } from '../peer'

describe('PeerManager', () => {
  it('应该创建PeerManager实例', () => {
    const peerManager = createPeerManager()
    expect(peerManager).toBeDefined()
    expect(typeof peerManager.initialize).toBe('function')
    expect(typeof peerManager.connectToPeer).toBe('function')
    expect(typeof peerManager.sendToPeer).toBe('function')
    expect(typeof peerManager.broadcast).toBe('function')
    expect(typeof peerManager.disconnectAll).toBe('function')
    expect(typeof peerManager.destroy).toBe('function')
  })

  it('应该返回正确的初始状态', () => {
    const peerManager = createPeerManager()
    const status = peerManager.getConnectionStatus()
    
    expect(status).toHaveProperty('isInitialized')
    expect(status).toHaveProperty('peerId')
    expect(status).toHaveProperty('connectedPeers')
    expect(status).toHaveProperty('totalConnections')
    expect(status.isInitialized).toBe(false)
    expect(status.peerId).toBe(null)
    expect(status.connectedPeers).toEqual([])
    expect(status.totalConnections).toBe(0)
  })

  it('应该设置和获取回调函数', () => {
    const peerManager = createPeerManager()
    const callbacks = {
      onOpen: vi.fn(),
      onConnection: vi.fn(),
      onDisconnection: vi.fn(),
      onData: vi.fn(),
      onError: vi.fn()
    }
    
    peerManager.setCallbacks(callbacks)
    
    // 由于回调是内部存储的，我们只能通过调用方法来验证
    expect(() => peerManager.setCallbacks({})).not.toThrow()
  })

  it('应该返回单例实例', () => {
    const peerManager1 = createPeerManager()
    const peerManager2 = createPeerManager()
    
    expect(peerManager1).toBe(peerManager2)
  })

  it('应该处理空配置', () => {
    const peerManager = createPeerManager()
    expect(peerManager).toBeDefined()
  })

  it('应该处理自定义配置', () => {
    const config = {
      host: 'localhost',
      port: 9000,
      secure: false,
      debug: 3
    }
    const peerManager = createPeerManager(config)
    expect(peerManager).toBeDefined()
  })
})