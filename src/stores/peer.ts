import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import PeerManager, { createPeerManager, type DataMessage } from '@/utils/peer'
import type { DataConnection } from 'peerjs'

export const usePeerStore = defineStore('peer', () => {
  const peerManager = ref<PeerManager>()
  const peerId = ref<string>('')
  const shareStatus = ref<string>('')
  const shareLink = ref<string>('')
  const connections = ref<string[]>([])
  const isInitialized = ref<boolean>(false)
  const onDataListener = ref<(data: DataMessage) => void>(() => {})
  const onConnectedListener = ref<(peerId: string) => void>(() => {})
  const onDisconnectedListener = ref<(peerId: string) => void>(() => {})
  const onErrorListener = ref<(error: Error) => void>(() => {})

  const baseUrl = computed(() => {
    return 'https://micean.github.io/gridwork'
  })

  const fullShareLink = computed(() => {
    return peerId.value ? `${baseUrl.value}?peerId=${peerId.value}` : ''
  })

  const isConnected = computed(() => {
    return isInitialized.value && peerId.value !== ''
  })

  async function initializePeer() {
    try {
      shareStatus.value = '正在连接...'
      peerId.value = ''
      shareLink.value = ''

      peerManager.value = createPeerManager()

      peerManager.value.setCallbacks({
        onOpen: (id: string) => {
          peerId.value = id
          shareStatus.value = '连接成功'
          shareLink.value = fullShareLink.value
        },
        onError: (error: Error) => {
          if(onErrorListener.value)
            onErrorListener.value(error)
          shareStatus.value = `连接失败: ${error.message}`
        },
        onConnection: (connection: DataConnection) => {
          if(onConnectedListener.value)
            onConnectedListener.value(connection.peer)
          connections.value = [...connections.value, connection.peer]
        },
        onDisconnection: (peerId: string) => {
          if(onDisconnectedListener.value)
            onDisconnectedListener.value(peerId)
          connections.value = connections.value.filter(id => id !== peerId)
        },
        onData: (data: DataMessage) => {
          console.log('Received data:', data)
          // 处理接收到的数据
          if (onDataListener.value) {
            onDataListener.value(data)
          }
        }
      })

      await peerManager.value.initialize()
      isInitialized.value = true
    } catch (error) {
      shareStatus.value = `连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      isInitialized.value = false
    }
  }

  function cleanupPeer() {
    if (peerManager.value) {
      peerManager.value.destroy()
      peerManager.value = undefined
    }
    peerId.value = ''
    shareStatus.value = ''
    shareLink.value = ''
    connections.value = []
    isInitialized.value = false
    onDataListener.value = () => {}
    onConnectedListener.value = () => {}
    onDisconnectedListener.value = () => {}
    onErrorListener.value = () => {}
  }

  async function connectToPeer(peerId: string) {
    if (!peerManager.value) {
      throw new Error('Peer manager not initialized')
    }
    return await peerManager.value.connectToPeer(peerId)
  }

  async function sendToPeer(peerId: string, data: unknown) {
    if (!peerManager.value) {
      throw new Error('Peer manager not initialized')
    }
    return await peerManager.value.sendToPeer(peerId, data)
  }

  function receiveData(fn: (data: DataMessage) => void) {
    onDataListener.value = fn
  }

  function setOnConnectedListener(fn: (peerId: string) => void) {
    onConnectedListener.value = fn
  }

  function setOnDisconnectedListener(fn: (peerId: string) => void) {
    onDisconnectedListener.value = fn
  }

  function setOnErrorListener(fn: (error: Error) => void) {
    onErrorListener.value = fn
  }

  async function broadcast(data: unknown) {
    if (!peerManager.value) {
      throw new Error('Peer manager not initialized')
    }
    return await peerManager.value.broadcast(data)
  }

  function getConnectionStatus() {
    if (!peerManager.value) {
      return {
        isInitialized: false,
        peerId: null,
        connectedPeers: [],
        totalConnections: 0
      }
    }
    return peerManager.value.getConnectionStatus()
  }

  return {
    // state
    peerId,
    shareStatus,
    shareLink,
    connections,
    isInitialized,

    // computed
    fullShareLink,
    isConnected,

    // actions
    initializePeer,
    cleanupPeer,
    connectToPeer,
    sendToPeer,
    receiveData,
    setOnConnectedListener,
    setOnDisconnectedListener,
    setOnErrorListener,
    broadcast,
    getConnectionStatus
  }
})
